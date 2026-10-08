/**
 * Agnes AI Types - Complete model catalog and API types
 */
/** Text models that are free to use */
export declare const TEXT_FREE_MODELS: readonly ["agnes-2.5-flash", "agnes-3.0-flash"];
export type TextFreeModel = typeof TEXT_FREE_MODELS[number];
/** Text models that require payment */
export declare const TEXT_PAID_MODELS: readonly ["agnes-2.5-pro", "agnes-2.5-pro-beta"];
export type TextPaidModel = typeof TEXT_PAID_MODELS[number];
/** All text models */
export declare const TEXT_MODELS: readonly ["agnes-2.5-flash", "agnes-3.0-flash", "agnes-2.5-pro", "agnes-2.5-pro-beta"];
export type TextModel = typeof TEXT_MODELS[number];
/** Image generation models (all free) */
export declare const IMAGE_MODELS: readonly ["agnes-image-2.1-flash", "agnes-image-2.5-flash"];
export type ImageModel = typeof IMAGE_MODELS[number];
/** Video generation models. `agnes-video-v2.0` was retired upstream and removed. */
export declare const VIDEO_FREE_MODELS: readonly ["agnes-video-2.5-flash"];
export type VideoFreeModel = typeof VIDEO_FREE_MODELS[number];
export declare const VIDEO_PAID_MODELS: readonly ["agnes-video-2.5"];
export type VideoPaidModel = typeof VIDEO_PAID_MODELS[number];
export declare const VIDEO_MODELS: readonly ["agnes-video-2.5-flash", "agnes-video-2.5"];
export type VideoModel = typeof VIDEO_MODELS[number];
/** All Agnes AI models */
export declare const AGNES_MODELS: readonly ["agnes-2.5-flash", "agnes-3.0-flash", "agnes-2.5-pro", "agnes-2.5-pro-beta", "agnes-image-2.1-flash", "agnes-image-2.5-flash", "agnes-video-2.5-flash", "agnes-video-2.5"];
export type AgnesModel = typeof AGNES_MODELS[number];
export declare const AGNES_ENDPOINTS: {
    readonly CHINA: "https://api.agnes-ai.cn/v1";
    readonly GLOBAL: "https://apihub.agnes-ai.com/v1";
};
export type AgnesEndpoint = typeof AGNES_ENDPOINTS[keyof typeof AGNES_ENDPOINTS];
export declare const IMAGE_SIZES: readonly ["1K", "2K", "3K", "4K"];
export type ImageSize = typeof IMAGE_SIZES[number];
export declare const IMAGE_RATIOS: readonly ["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"];
export type ImageRatio = typeof IMAGE_RATIOS[number];
export interface AgnesImageRequest {
    model: ImageModel;
    prompt: string;
    size: ImageSize;
    ratio?: ImageRatio;
    image?: string[];
    return_base64?: boolean;
    extra_body?: {
        response_format?: 'url' | 'b64_json';
        image?: string[];
    };
}
export interface AgnesImageResponse {
    created: number;
    data: Array<{
        url: string | null;
        b64_json: string | null;
        revised_prompt: string | null;
    }>;
}
/** 2.5 / 2.5 Flash 的生成模式。v2.0 的 `ti2vid` / `keyframes` 已废弃。 */
export declare const VIDEO_MODES: readonly ["text", "keyframe", "reference"];
export type VideoMode = typeof VIDEO_MODES[number];
/** 输出分辨率档位。Flash 仅支持 `720P`。 */
export declare const VIDEO_RESOLUTIONS: readonly ["720P", "1080P", "1K", "2K"];
export type VideoResolution = typeof VIDEO_RESOLUTIONS[number];
export declare const VIDEO_RATIOS: readonly ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
export type VideoRatio = typeof VIDEO_RATIOS[number];
/** 参考视频条目（`reference` 模式的 `videos[]`）。 */
export interface AgnesVideoReference {
    url: string;
    start_seconds?: number;
    require_audio?: boolean;
}
export interface AgnesVideoRequest {
    model: VideoModel;
    prompt: string;
    /** 生成模式；默认 `text`。 */
    mode?: VideoMode;
    /** 字符串 `"4"`–`"12"`，默认 `"5"`。 */
    seconds?: string;
    size?: VideoResolution;
    aspect_ratio?: VideoRatio;
    seed?: number;
    /** `keyframe` 模式：首帧图片 URL（与 last_frame 至少提供一个）。 */
    first_frame?: string;
    /** `keyframe` 模式：尾帧图片 URL。 */
    last_frame?: string;
    /** `reference` 模式：参考图片 URL 列表（2.5 最多 8 张，Flash 最多 5 张）。 */
    images?: string[];
    /** `reference` 模式：参考音频 URL 列表（Flash 最多 3 段）。 */
    audios?: string[];
    /** `reference` 模式：参考视频列表（2.5 最多 1 个；Flash 不支持）。 */
    videos?: AgnesVideoReference[];
}
export interface AgnesVideoTaskResponse {
    id: string;
    task_id: string;
    video_id: string;
    object: string;
    model: string;
    status: 'queued' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    created_at: number;
    started_at?: number | null;
    completed_at?: number | null;
    expires_at?: number | null;
    seconds: string;
    size: string;
    quality?: string;
    /** 完成时顶层字段即视频地址（v2.0 的 `metadata.url` 已废弃）。 */
    url?: string;
    /** 内部字段，不用于判断是否完成。 */
    internal_status?: string;
    internal_progress?: number;
    error?: null | {
        message?: string;
    } | object;
}
export interface AgnesChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
        };
    }>;
}
export interface AgnesChatRequest {
    model: TextModel;
    messages: AgnesChatMessage[];
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
    tools?: Array<object>;
    tool_choice?: string | object;
    chat_template_kwargs?: {
        enable_thinking?: boolean;
    };
    thinking?: {
        type: 'enabled';
        budget_tokens?: number;
    };
}
export interface AgnesChatResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export interface AgnesModelPricing {
    /** Model ID */
    id: string;
    /** Display name */
    name: string;
    /** Whether this model is free */
    isFree: boolean;
    /** Category: 'text' | 'image' | 'video' */
    category: 'text' | 'image' | 'video';
    /** Description in Chinese */
    description: string;
    /** Context window size in tokens (text models only) */
    contextWindow?: number;
    /** Maximum output tokens (text models only) */
    maxTokens?: number;
    /** Supports image input (text models only) */
    supportsImageInput?: boolean;
    /** Pricing info for paid models */
    pricing?: Record<string, string>;
}
/** Complete pricing catalog */
export declare const AGNES_MODEL_PRICING: AgnesModelPricing[];
//# sourceMappingURL=types.d.ts.map