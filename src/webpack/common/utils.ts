/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
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

import { _resolveDiscordLoaded, filters, find, findByCode, findByProps, mapMangledModule, waitFor } from "@webpack";

import type * as t from "./types/utils";

export const FluxDispatcher = findByProps<t.FluxDispatcher>("dispatch", "subscribe", (m: t.FluxDispatcher) => {
    // Non import call to avoid circular dependency
    Vencord.Plugins.subscribeAllPluginsFluxEvents(m);

    const cb = () => {
        m.unsubscribe("CONNECTION_OPEN", cb);
        _resolveDiscordLoaded();
    };
    m.subscribe("CONNECTION_OPEN", cb);

    return m;
});

export const ComponentDispatch = findByProps("dispatchToLastSubscribed");

export const Constants: t.Constants = mapMangledModule('ME:"/users/@me"', {
    Endpoints: filters.byProps("USER", "ME"),
    UserFlags: filters.byProps("STAFF", "SPAMMER"),
    FriendsSections: m => m.PENDING === "PENDING" && m.ADD_FRIEND
});

export const RestAPI = find<t.RestAPI>(m => typeof m === "object" && m.del && m.put);
export const moment = findByProps<typeof import("moment")>("parseTwoDigitYear");

export const hljs = findByProps<typeof import("highlight.js")>("highlight", "registerLanguage");

export const { match, P }: Pick<typeof import("ts-pattern"), "match" | "P"> = mapMangledModule("@ts-pattern/matcher", {
    match: filters.byCode("return new"),
    P: filters.byProps("when")
});

export const lodash = findByProps<typeof import("lodash")>("debounce", "cloneDeep");

export const i18n = find<t.i18n>(m => m.Messages?.["en-US"]);

export const SnowflakeUtils = findByProps<t.SnowflakeUtils>("fromTimestamp", "extractTimestamp");

export const Parser = findByProps<t.Parser>("parseTopic");
export const Alerts = findByProps<t.Alerts>("show", "close");

const ToastType = {
    MESSAGE: 0,
    SUCCESS: 1,
    FAILURE: 2,
    CUSTOM: 3
};
const ToastPosition = {
    TOP: 0,
    BOTTOM: 1
};

export interface ToastData {
    message: string,
    id: string,
    /**
     * Toasts.Type
     */
    type: number,
    options?: ToastOptions;
}

export interface ToastOptions {
    /**
     * Toasts.Position
     */
    position?: number;
    component?: React.ReactNode,
    duration?: number;
}

export const Toasts = {
    Type: ToastType,
    Position: ToastPosition,
    // what's less likely than getting 0 from Math.random()? Getting it twice in a row
    genId: () => (Math.random() || Math.random()).toString(36).slice(2),

    // hack to merge with the following interface, dunno if there's a better way
    ...{} as {
        show(data: ToastData): void;
        pop(): void;
        create(message: string, type: number, options?: ToastOptions): ToastData;
    }
};

waitFor(filters.byProps("showToast"), m => {
    Toasts.show = m.showToast;
    Toasts.pop = m.popToast;
    Toasts.create = m.createToast;
});

/**
 * Show a simple toast. If you need more options, use Toasts.show manually
 */
export function showToast(message: string, type = ToastType.MESSAGE, options?: ToastOptions) {
    Toasts.show(Toasts.create(message, type, options));
}

export const UserUtils: t.UserUtils = {
    getUser: findByCode(".USER(")
};

export const UploadManager = findByProps("clearAll", "addFile");
export const UploadHandler: t.UploadHandler = {
    promptToUpload: findByCode(".ATTACHMENT_TOO_MANY_ERROR_TITLE,")
};

export const ApplicationAssetUtils = findByProps<t.ApplicationAssetUtils>("fetchAssetIds", "getAssetImage");

export const Clipboard: t.Clipboard = mapMangledModule('queryCommandEnabled("copy")', {
    copy: filters.byCode(".copy("),
    SUPPORTS_COPY: e => typeof e === "boolean"
});

export const NavigationRouter: t.NavigationRouter = mapMangledModule("Transitioning to ", {
    transitionTo: filters.byCode("transitionTo -"),
    transitionToGuild: filters.byCode("transitionToGuild -"),
    back: filters.byCode("goBack()"),
    forward: filters.byCode("goForward()"),
});
export const ChannelRouter: t.ChannelRouter = mapMangledModule('"Thread must have a parent ID."', {
    transitionToChannel: filters.byCode(".preload"),
    transitionToThread: filters.byCode('"Thread must have a parent ID."')
});

export const SettingsRouter = findByProps("open", "saveAccountChanges");

export const PermissionsBits = find<t.PermissionsBits>(m => typeof m.ADMINISTRATOR === "bigint");

export const zustandCreate = findByCode("will be removed in v4");
export const zustandPersist = findByCode("[zustand persist middleware]");

export const MessageActions = findByProps("editMessage", "sendMessage");
export const MessageCache = findByProps("clearCache", "_channelMessages");
export const UserProfileActions = findByProps("openUserProfileModal", "closeUserProfileModal");
export const InviteActions = findByProps("resolveInvite");

export const IconUtils = findByProps<t.IconUtils>("getGuildBannerURL", "getUserAvatarURL");

export const ExpressionPickerStore: t.ExpressionPickerStore = mapMangledModule("expression-picker-last-active-view", {
    openExpressionPicker: filters.byCode(/setState\({activeView:(?:(?!null)\i),activeViewType:/),
    closeExpressionPicker: filters.byCode("setState({activeView:null"),
    toggleMultiExpressionPicker: filters.byCode(".EMOJI,"),
    toggleExpressionPicker: filters.byCode(/getState\(\)\.activeView===\i\?\i\(\):\i\(/),
    setExpressionPickerView: filters.byCode(/setState\({activeView:\i,lastActiveView:/),
    setSearchQuery: filters.byCode("searchQuery:"),
    useExpressionPickerStore: filters.byCode("Object.is")
});

export const PopoutActions: t.PopoutActions = mapMangledModule('type:"POPOUT_WINDOW_OPEN"', {
    open: filters.byCode('type:"POPOUT_WINDOW_OPEN"'),
    close: filters.byCode('type:"POPOUT_WINDOW_CLOSE"'),
    setAlwaysOnTop: filters.byCode('type:"POPOUT_WINDOW_SET_ALWAYS_ON_TOP"'),
});

export const UsernameUtils = findByProps<t.UsernameUtils>("useName", "getGlobalName");
export const DisplayProfileUtils: t.DisplayProfileUtils = mapMangledModule(/=\i\.getUserProfile\(\i\),\i=\i\.getGuildMemberProfile\(/, {
    getDisplayProfile: filters.byCode(".getGuildMemberProfile("),
    useDisplayProfile: filters.byCode(/\[\i\.\i,\i\.\i],\(\)=>/)
});
