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

import { Channel, Guild, GuildMember, User } from "discord-types/general";
import type { ReactNode } from "react";
import { LiteralUnion } from "type-fest";

import type { FluxEvents } from "./fluxEvents";
import { i18nMessages } from "./i18nMessages";

export { FluxEvents };

export interface FluxDispatcher {
    _actionHandlers: any;
    _subscriptions: any;
    dispatch(event: { [key: string]: unknown; type: FluxEvents; }): Promise<void>;
    isDispatching(): boolean;
    subscribe(event: FluxEvents, callback: (data: any) => void): void;
    unsubscribe(event: FluxEvents, callback: (data: any) => void): void;
    wait(callback: () => void): void;
}

export type Parser = Record<
    | "parse"
    | "parseTopic"
    | "parseEmbedTitle"
    | "parseInlineReply"
    | "parseGuildVerificationFormRule"
    | "parseGuildEventDescription"
    | "parseAutoModerationSystemMessage"
    | "parseForumPostGuidelines"
    | "parseForumPostMostRecentMessage",
    (content: string, inline?: boolean, state?: Record<string, any>) => ReactNode[]
> & Record<"defaultRules" | "guildEventRules", Record<string, Record<"react" | "html" | "parse" | "match" | "order", any>>>;

export interface Alerts {
    show(alert: {
        title: any;
        body: React.ReactNode;
        className?: string;
        confirmColor?: string;
        cancelText?: string;
        confirmText?: string;
        secondaryConfirmText?: string;
        onCancel?(): void;
        onConfirm?(): void;
        onConfirmSecondary?(): void;
        onCloseCallback?(): void;
    }): void;
    /** This is a noop, it does nothing. */
    close(): void;
}

export interface SnowflakeUtils {
    fromTimestamp(timestamp: number): string;
    extractTimestamp(snowflake: string): number;
    age(snowflake: string): number;
    atPreviousMillisecond(snowflake: string): string;
    compare(snowflake1?: string, snowflake2?: string): number;
}

interface RestRequestData {
    url: string;
    query?: Record<string, any>;
    body?: Record<string, any>;
    oldFormErrors?: boolean;
    retries?: number;
}

export type RestAPI = Record<"del" | "get" | "patch" | "post" | "put", (data: RestRequestData) => Promise<any>>;

export type Permissions = "ADD_REACTIONS"
    | "ADMINISTRATOR"
    | "ATTACH_FILES"
    | "BAN_MEMBERS"
    | "CHANGE_NICKNAME"
    | "CONNECT"
    | "CREATE_EVENTS"
    | "CREATE_GUILD_EXPRESSIONS"
    | "CREATE_INSTANT_INVITE"
    | "CREATE_PRIVATE_THREADS"
    | "CREATE_PUBLIC_THREADS"
    | "DEAFEN_MEMBERS"
    | "EMBED_LINKS"
    | "KICK_MEMBERS"
    | "MANAGE_CHANNELS"
    | "MANAGE_EVENTS"
    | "MANAGE_GUILD"
    | "MANAGE_GUILD_EXPRESSIONS"
    | "MANAGE_MESSAGES"
    | "MANAGE_NICKNAMES"
    | "MANAGE_ROLES"
    | "MANAGE_THREADS"
    | "MANAGE_WEBHOOKS"
    | "MENTION_EVERYONE"
    | "MODERATE_MEMBERS"
    | "MOVE_MEMBERS"
    | "MUTE_MEMBERS"
    | "PRIORITY_SPEAKER"
    | "READ_MESSAGE_HISTORY"
    | "REQUEST_TO_SPEAK"
    | "SEND_MESSAGES"
    | "SEND_MESSAGES_IN_THREADS"
    | "SEND_POLLS"
    | "SEND_TTS_MESSAGES"
    | "SEND_VOICE_MESSAGES"
    | "SET_VOICE_CHANNEL_STATUS"
    | "SPEAK"
    | "STREAM"
    | "USE_APPLICATION_COMMANDS"
    | "USE_CLYDE_AI"
    | "USE_EMBEDDED_ACTIVITIES"
    | "USE_EXTERNAL_APPS"
    | "USE_EXTERNAL_EMOJIS"
    | "USE_EXTERNAL_SOUNDS"
    | "USE_EXTERNAL_STICKERS"
    | "USE_SOUNDBOARD"
    | "USE_VAD"
    | "VIEW_AUDIT_LOG"
    | "VIEW_CHANNEL"
    | "VIEW_CREATOR_MONETIZATION_ANALYTICS"
    | "VIEW_GUILD_ANALYTICS";

export type PermissionsBits = Record<Permissions, bigint>;

export interface Locale {
    name: string;
    value: string;
    localizedName: string;
}

export interface LocaleInfo {
    code: string;
    enabled: boolean;
    name: string;
    englishName: string;
    postgresLang: string;
}

export interface i18n {
    getAvailableLocales(): Locale[];
    getLanguages(): LocaleInfo[];
    getDefaultLocale(): string;
    getLocale(): string;
    getLocaleInfo(): LocaleInfo;
    setLocale(locale: string): void;

    loadPromise: Promise<void>;

    Messages: Record<i18nMessages, any>;
}

export interface Clipboard {
    copy(text: string): void;
    SUPPORTS_COPY: boolean;
}

export interface NavigationRouter {
    back(): void;
    forward(): void;
    transitionTo(path: string, ...args: unknown[]): void;
    transitionToGuild(guildId: string, ...args: unknown[]): void;
}

export interface ChannelRouter {
    transitionToChannel: (channelId: string) => void;
    transitionToThread: (channel: Channel) => void;
}

export interface IconUtils {
    getUserAvatarURL(user: User, canAnimate?: boolean, size?: number, format?: string): string;
    getDefaultAvatarURL(id: string, discriminator?: string): string;
    getUserBannerURL(data: { id: string, banner: string, canAnimate?: boolean, size: number; }): string | undefined;
    getAvatarDecorationURL(dara: { avatarDecoration: string, size: number; canCanimate?: boolean; }): string | undefined;

    getGuildMemberAvatarURL(member: GuildMember, canAnimate?: string): string | null;
    getGuildMemberAvatarURLSimple(data: { guildId: string, userId: string, avatar: string, canAnimate?: boolean; size?: number; }): string;
    getGuildMemberBannerURL(data: { id: string, guildId: string, banner: string, canAnimate?: boolean, size: number; }): string | undefined;

    getGuildIconURL(data: { id: string, icon?: string, size?: number, canAnimate?: boolean; }): string | undefined;
    getGuildBannerURL(guild: Guild, canAnimate?: boolean): string | null;

    getChannelIconURL(data: { id: string; icon?: string; applicationId?: string; size?: number; }): string | undefined;
    getEmojiURL(data: { id: string, animated: boolean, size: number, forcePNG?: boolean; }): string;

    hasAnimatedGuildIcon(guild: Guild): boolean;
    isAnimatedIconHash(hash: string): boolean;

    getGuildSplashURL: any;
    getGuildDiscoverySplashURL: any;
    getGuildHomeHeaderURL: any;
    getResourceChannelIconURL: any;
    getNewMemberActionIconURL: any;
    getGuildTemplateIconURL: any;
    getApplicationIconURL: any;
    getGameAssetURL: any;
    getVideoFilterAssetURL: any;

    getGuildMemberAvatarSource: any;
    getUserAvatarSource: any;
    getGuildSplashSource: any;
    getGuildDiscoverySplashSource: any;
    makeSource: any;
    getGameAssetSource: any;
    getGuildIconSource: any;
    getGuildTemplateIconSource: any;
    getGuildBannerSource: any;
    getGuildHomeHeaderSource: any;
    getChannelIconSource: any;
    getApplicationIconSource: any;
    getAnimatableSourceWithFallback: any;
}

export interface UserUtils {
    getUser: (id: string) => Promise<User>;
}

export interface UploadHandler {
    promptToUpload: (files: File[], channel: Channel, draftType: Number) => void;
}

export interface ApplicationAssetUtils {
    fetchAssetIds: (applicationId: string, e: string[]) => Promise<string[]>;
}

export interface Constants {
    Endpoints: Record<string, any>;
    UserFlags: Record<string, number>;
    FriendsSections: Record<string, string>;
}

export type ActiveView = LiteralUnion<"emoji" | "gif" | "sticker" | "soundboard", string>;

export interface ExpressionPickerStoreState extends AnyRecord {
    activeView: ActiveView | null;
    lastActiveView: ActiveView | null;
    activeViewType: any | null;
    searchQuery: string;
    isSearchSuggestion: boolean,
    pickerId: string;
}

export interface ExpressionPickerStore {
    openExpressionPicker(activeView: ActiveView, activeViewType?: any): void;
    closeExpressionPicker(activeViewType?: any): void;
    toggleMultiExpressionPicker(activeViewType?: any): void;
    toggleExpressionPicker(activeView: ActiveView, activeViewType?: any): void;
    setExpressionPickerView(activeView: ActiveView): void;
    setSearchQuery(searchQuery: string, isSearchSuggestion?: boolean): void;
    useExpressionPickerStore(): ExpressionPickerStoreState;
    useExpressionPickerStore<T>(selector: (state: ExpressionPickerStoreState) => T): T;
}

export interface BrowserWindowFeatures {
    toolbar?: boolean;
    menubar?: boolean;
    location?: boolean;
    directories?: boolean;
    width?: number;
    height?: number;
    defaultWidth?: number;
    defaultHeight?: number;
    left?: number;
    top?: number;
    defaultAlwaysOnTop?: boolean;
    movable?: boolean;
    resizable?: boolean;
    frame?: boolean;
    alwaysOnTop?: boolean;
    hasShadow?: boolean;
    transparent?: boolean;
    skipTaskbar?: boolean;
    titleBarStyle?: string | null;
    backgroundColor?: string;
}

export interface PopoutActions {
    open(key: string, render: (windowKey: string) => ReactNode, features?: BrowserWindowFeatures);
    close(key: string): void;
    setAlwaysOnTop(key: string, alwaysOnTop: boolean): void;
}

export type UserNameUtilsTagInclude = LiteralUnion<"auto" | "always" | "never", string>;
export interface UserNameUtilsTagOptions {
    forcePomelo?: boolean;
    identifiable?: UserNameUtilsTagInclude;
    decoration?: UserNameUtilsTagInclude;
    mode?: "full" | "username";
}

export interface UsernameUtils {
    getGlobalName(user: User): string;
    getFormattedName(user: User, useTagInsteadOfUsername?: boolean): string;
    getName(user: User): string;
    useName(user: User): string;
    getUserTag(user: User, options?: UserNameUtilsTagOptions): string;
    useUserTag(user: User, options?: UserNameUtilsTagOptions): string;


    useDirectMessageRecipient: any;
    humanizeStatus: any;
}

export class DisplayProfile {
    userId: string;
    banner?: string;
    bio?: string;
    pronouns?: string;
    accentColor?: number;
    themeColors?: number[];
    popoutAnimationParticleType?: any;
    profileEffectId?: string;
    _userProfile?: any;
    _guildMemberProfile?: any;
    canUsePremiumProfileCustomization: boolean;
    canEditThemes: boolean;
    premiumGuildSince: Date | null;
    premiumSince: Date | null;
    premiumType?: number;
    primaryColor?: number;

    getBadges(): Array<{
        id: string;
        description: string;
        icon: string;
        link?: string;
    }>;
    getBannerURL(options: { canAnimate: boolean; size: number; }): string;
    getLegacyUsername(): string | null;
    hasFullProfile(): boolean;
    hasPremiumCustomization(): boolean;
    hasThemeColors(): boolean;
    isUsingGuildMemberBanner(): boolean;
    isUsingGuildMemberBio(): boolean;
    isUsingGuildMemberPronouns(): boolean;
}

export interface DisplayProfileUtils {
    getDisplayProfile(userId: string, guildId?: string, customStores?: any): DisplayProfile | null;
    useDisplayProfile(userId: string, guildId?: string, customStores?: any): DisplayProfile | null;
}
