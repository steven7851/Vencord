/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { findByProps, findComponentByCode } from "@webpack";

import { NoopComponent } from "./react";

export const enum ModalSize {
    SMALL = "small",
    MEDIUM = "medium",
    LARGE = "large",
    DYNAMIC = "dynamic",
}

const enum ModalTransitionState {
    ENTERING,
    ENTERED,
    EXITING,
    EXITED,
    HIDDEN,
}

export interface ModalProps {
    transitionState: ModalTransitionState;
    onClose(): void;
}

export interface ModalOptions {
    modalKey?: string;
    onCloseRequest?: (() => void);
    onCloseCallback?: (() => void);
}

type RenderFunction = (props: ModalProps) => React.ReactNode;

type Modals = {
    ModalRoot: AnyComponentTypeWithChildren<{
        transitionState: ModalTransitionState;
        size?: ModalSize;
        role?: "alertdialog" | "dialog";
        className?: string;
        fullscreenOnMobile?: boolean;
        "aria-label"?: string;
        "aria-labelledby"?: string;
        onAnimationEnd?(): string;
    }>;
    ModalHeader: AnyComponentTypeWithChildren<{
        /** Flex.Justify.START */
        justify?: string;
        /** Flex.Direction.HORIZONTAL */
        direction?: string;
        /** Flex.Align.CENTER */
        align?: string;
        /** Flex.Wrap.NO_WRAP */
        wrap?: string;
        separator?: boolean;

        className?: string;
    }>;
    /** This also accepts Scroller props but good luck with that */
    ModalContent: AnyComponentTypeWithChildren<{
        className?: string;
        scrollerRef?: React.Ref<HTMLElement>;
    }>;
    ModalFooter: AnyComponentTypeWithChildren<{
        /** Flex.Justify.START */
        justify?: string;
        /** Flex.Direction.HORIZONTAL_REVERSE */
        direction?: string;
        /** Flex.Align.STRETCH */
        align?: string;
        /** Flex.Wrap.NO_WRAP */
        wrap?: string;
        separator?: boolean;

        className?: string;
    }>;
    ModalCloseButton: AnyComponentType<{
        focusProps?: any;
        onClick(): void;
        withCircleBackground?: boolean;
        hideOnFullscreen?: boolean;
        className?: string;
    }>;
};


export let ModalRoot: Modals["ModalRoot"] = NoopComponent;
export let ModalHeader: Modals["ModalHeader"] = NoopComponent;
export let ModalContent: Modals["ModalContent"] = NoopComponent;
export let ModalFooter: Modals["ModalFooter"] = NoopComponent;
export let ModalCloseButton: Modals["ModalCloseButton"] = NoopComponent;

export const Modals = findByProps<Modals>("ModalRoot", "ModalCloseButton", (m: Modals) => {
    ({ ModalRoot, ModalHeader, ModalContent, ModalFooter, ModalCloseButton } = m);

    return m;
});

export type ImageModalProps = {
    className?: string;
    src: string;
    placeholder: string;
    original: string;
    width?: number;
    height?: number;
    animated?: boolean;
    responsive?: boolean;
    renderLinkComponent(props: any): React.ReactNode;
    renderForwardComponent(props: any): React.ReactNode;
    maxWidth?: number;
    maxHeight?: number;
    shouldAnimate?: boolean;
    onClose?(): void;
    shouldHideMediaOptions?: boolean;
};

export const ImageModal = findComponentByCode<ImageModalProps>(".MEDIA_MODAL_CLOSE", "responsive");

const ModalAPI = findByProps("openModalLazy");

/**
 * Wait for the render promise to resolve, then open a modal with it.
 * This is equivalent to render().then(openModal)
 * You should use the Modal components exported by this file
 */
export function openModalLazy(render: () => Promise<RenderFunction>, options?: ModalOptions & { contextKey?: string; }): Promise<string> {
    return ModalAPI.openModalLazy(render, options);
}

/**
 * Open a Modal with the given render function.
 * You should use the Modal components exported by this file
 */
export function openModal(render: RenderFunction, options?: ModalOptions, contextKey?: string): string {
    return ModalAPI.openModal(render, options, contextKey);
}

/**
 * Close a modal by its key
 */
export function closeModal(modalKey: string, contextKey?: string): void {
    return ModalAPI.closeModal(modalKey, contextKey);
}

/**
 * Close all open modals
 */
export function closeAllModals(): void {
    return ModalAPI.closeAllModals();
}
