/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides GUI settings panel for configuring Agnes AI.
 * Registers a settings section in the DSH web client.
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Free text models - available without confirmation */
export declare const FREE_TEXT_MODELS: readonly [{
    readonly id: "agnes-2.5-flash";
    readonly name: "Agnes 2.5 Flash";
    readonly description: "免费·多模态对话·编码优化·智能体工作流";
    readonly contextWindow: 524288;
    readonly maxTokens: 65536;
    readonly supportsImage: true;
}, {
    readonly id: "agnes-3.0-flash";
    readonly name: "Agnes 3.0 Flash";
    readonly description: "免费·新一代Agent编程模型·工具调用强化";
    readonly contextWindow: 524288;
    readonly maxTokens: 65536;
    readonly supportsImage: true;
}];
/** Paid text models - require confirmation */
export declare const PAID_TEXT_MODELS: {
    id: string;
    name: string;
    description: string;
    contextWindow: number;
    maxTokens: number;
    supportsImage: boolean;
    pricing: {
        inputCacheHit: string;
        input: string;
        output: string;
    };
}[];
/** All text models */
export declare const ALL_TEXT_MODELS: readonly [{
    readonly id: "agnes-2.5-flash";
    readonly name: "Agnes 2.5 Flash";
    readonly description: "免费·多模态对话·编码优化·智能体工作流";
    readonly contextWindow: 524288;
    readonly maxTokens: 65536;
    readonly supportsImage: true;
}, {
    readonly id: "agnes-3.0-flash";
    readonly name: "Agnes 3.0 Flash";
    readonly description: "免费·新一代Agent编程模型·工具调用强化";
    readonly contextWindow: 524288;
    readonly maxTokens: 65536;
    readonly supportsImage: true;
}, ...{
    id: string;
    name: string;
    description: string;
    contextWindow: number;
    maxTokens: number;
    supportsImage: boolean;
    pricing: {
        inputCacheHit: string;
        input: string;
        output: string;
    };
}[]];
/** Free image models */
export declare const FREE_IMAGE_MODELS: readonly [{
    readonly id: "agnes-image-2.1-flash";
    readonly name: "Agnes Image 2.1 Flash";
    readonly description: "免费·文生图·图生图·多图合成";
}, {
    readonly id: "agnes-image-2.5-flash";
    readonly name: "Agnes Image 2.5 Flash";
    readonly description: "免费·最新一代图像模型·全面超越2.1版本";
}];
/** Free video models */
export declare const FREE_VIDEO_MODELS: readonly [{
    readonly id: "agnes-video-v2.0";
    readonly name: "Agnes Video V2.0";
    readonly description: "免费·文生视频·图生视频·关键帧动画";
}, {
    readonly id: "agnes-video-25-flash";
    readonly name: "Agnes Video 2.5 Flash";
    readonly description: "免费·异步任务API·720P专享";
}];
/** Paid video models */
export declare const PAID_VIDEO_MODELS: {
    id: string;
    name: string;
    description: string;
    pricing: {
        '720P': string;
        '1080P': string;
        '1K': string;
        '2K': string;
    };
}[];
export interface AgnesModelInfo {
    id: string;
    name: string;
    description: string;
    isFree?: boolean;
    category?: 'text' | 'image' | 'video';
    contextWindow?: number;
    maxTokens?: number;
    supportsImage?: boolean;
    pricing?: Record<string, string>;
}
export interface AgnesProviderConfig {
    displayName: string;
    baseURL: string;
    models: AgnesModelInfo[];
}
export declare const name = "agnes-ai-for-dsh-client";
export declare const inject: readonly ["settings", "slots"];
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map