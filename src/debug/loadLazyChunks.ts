/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@utils/Logger";
import { canonicalizeMatch } from "@utils/patches";
import * as Webpack from "@webpack";
import { wreq } from "@webpack";
import { AnyModuleFactory, ModuleFactory } from "webpack";

export async function loadLazyChunks() {
    const LazyChunkLoaderLogger = new Logger("LazyChunkLoader");

    try {
        LazyChunkLoaderLogger.log("Loading all chunks...");

        const validChunks = new Set<number>();
        const invalidChunks = new Set<number>();
        const deferredRequires = new Set<number>();

        let chunksSearchingResolve: (value: void | PromiseLike<void>) => void;
        const chunksSearchingDone = new Promise<void>(r => chunksSearchingResolve = r);

        // True if resolved, false otherwise
        const chunksSearchPromises = [] as Array<() => boolean>;

        const LazyChunkRegex = canonicalizeMatch(/(?:(?:Promise\.all\(\[)?(\i\.e\("?[^)]+?"?\)[^\]]*?)(?:\]\))?)\.then\(\i(?:\.\i)?\.bind\(\i,"?([^)]+?)"?(?:,[^)]+?)?\)\)/g);

        async function searchAndLoadLazyChunks(factoryCode: string) {
            const lazyChunks = factoryCode.matchAll(LazyChunkRegex);
            const validChunkGroups = new Set<[chunkIds: number[], entryPoint: number]>();

            await Promise.all(Array.from(lazyChunks).map(async ([, rawChunkIds, entryPoint]) => {
                const chunkIds = rawChunkIds ? Array.from(rawChunkIds.matchAll(Webpack.ChunkIdsRegex)).map(m => Number(m[1])) : [];

                if (chunkIds.length === 0) {
                    return;
                }

                let invalidChunkGroup = false;

                for (const id of chunkIds) {
                    if (wreq.u(id) == null || wreq.u(id) === "undefined.js") continue;

                    const isWorkerAsset = await fetch(wreq.p + wreq.u(id))
                        .then(r => r.text())
                        .then(t => t.includes("importScripts("));

                    if (isWorkerAsset) {
                        invalidChunks.add(id);
                        invalidChunkGroup = true;
                        continue;
                    }

                    validChunks.add(id);
                }

                if (!invalidChunkGroup) {
                    validChunkGroups.add([chunkIds, Number(entryPoint)]);
                }
            }));

            // Loads all found valid chunk groups
            await Promise.all(
                Array.from(validChunkGroups)
                    .map(([chunkIds]) =>
                        Promise.all(chunkIds.map(id => wreq.e(id)))
                    )
            );

            // Requires the entry points for all valid chunk groups
            for (const [, entryPoint] of validChunkGroups) {
                try {
                    if (wreq.m[entryPoint]) wreq(entryPoint);
                } catch (err) {
                    console.error(err);
                }
            }

            // setImmediate to only check if all chunks were loaded after this function resolves
            // We check if all chunks were loaded every time a factory is loaded
            // If we are still looking for chunks in the other factories, the array will have that factory's chunk search promise not resolved
            // But, if all chunk search promises are resolved, this means we found every lazy chunk loaded by Discord code and manually loaded them
            setTimeout(() => {
                let allResolved = true;

                for (let i = 0; i < chunksSearchPromises.length; i++) {
                    const isResolved = chunksSearchPromises[i]();

                    if (isResolved) {
                        // Remove finished promises to avoid having to iterate through a huge array everytime
                        chunksSearchPromises.splice(i--, 1);
                    } else {
                        allResolved = false;
                    }
                }

                if (allResolved) chunksSearchingResolve();
            }, 0);
        }

        function factoryListener(factory: AnyModuleFactory | ModuleFactory) {
            let isResolved = false;
            searchAndLoadLazyChunks(String(factory))
                .then(() => isResolved = true)
                .catch(() => isResolved = true);

            chunksSearchPromises.push(() => isResolved);
        }

        Webpack.factoryListeners.add(factoryListener);
        for (const factoryId in wreq.m) {
            factoryListener(wreq.m[factoryId]);
        }

        await chunksSearchingDone;
        Webpack.factoryListeners.delete(factoryListener);

        // Require deferred entry points
        for (const deferredRequire of deferredRequires) {
            wreq(deferredRequire);
        }

        // All chunks Discord has mapped to asset files, even if they are not used anymore
        const allChunks = [] as number[];

        // Matches "id" or id:
        for (const currentMatch of String(wreq.u).matchAll(/(?:"([\deE]+?)"(?![,}]))|(?:([\deE]+?):)/g)) {
            const id = currentMatch[1] ?? currentMatch[2];
            if (id == null) continue;

            allChunks.push(Number(id));
        }

        if (allChunks.length === 0) throw new Error("Failed to get all chunks");

        // Chunks which our regex could not catch to load
        // It will always contain WebWorker assets, and also currently contains some language packs which are loaded differently
        const chunksLeft = allChunks.filter(id => {
            return !(validChunks.has(id) || invalidChunks.has(id));
        });

        await Promise.all(chunksLeft.map(async id => {
            const isWorkerAsset = await fetch(wreq.p + wreq.u(id))
                .then(r => r.text())
                .then(t => t.includes("importScripts("));

            // Loads the chunk. Currently this only happens with the language packs which are loaded differently
            if (!isWorkerAsset) {
                await wreq.e(id);
            }
        }));

        LazyChunkLoaderLogger.log("Finished loading all chunks!");
    } catch (e) {
        LazyChunkLoaderLogger.log("A fatal error occurred:", e);
    }
}
