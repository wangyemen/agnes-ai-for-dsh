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
/** Video generation models */
export declare const VIDEO_FREE_MODELS: readonly ["agnes-video-v2.0", "agnes-video-25-flash"];
export type VideoFreeModel = typeof VIDEO_FREE_MODELS[number];
export declare const VIDEO_PAID_MODELS: readonly ["agnes-video-25"];
export type VideoPaidModel = typeof VIDEO_PAID_MODELS[number];
export declare const VIDEO_MODELS: readonly ["agnes-video-v2.0", "agnes-video-25-flash", "agnes-video-25"];
export type VideoModel = typeof VIDEO_MODELS[number];
/** All Agnes AI models */
export declare const AGNES_MODELS: readonly ["agnes-2.5-flash", "agnes-3.0-flash", "agnes-2.5-pro", "agnes-2.5-pro-beta", "agnes-image-2.1-flash", "agnes-image-2.5-flash", "agnes-video-v2.0", "agnes-video-25-flash", "agnes-video-25"];
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
export declare const VIDEO_MODES: readonly ["ti2vid", "keyframes", "text", "reference"];
export type VideoMode = typeof VIDEO_MODES[number];
export declare const VIDEO_RESOLUTIONS: readonly ["480p", "720p", "1080p", "1K", "2K"];
export type VideoResolution = typeof VIDEO_RESOLUTIONS[number];
export declare const VIDEO_RATIOS: readonly ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9"];
export type VideoRatio = typeof VIDEO_RATIOS[number];
export interface AgnesVideoRequest {
    model: VideoModel;
    prompt: string;
    seconds?: string;
    mode?: VideoMode;
    size?: VideoResolution;
    aspect_ratio?: VideoRatio;
    image?: string;
    num_frames?: number;
    frame_rate?: number;
    seed?: number;
    negative_prompt?: string;
    extra_body?: {
        image?: string[];
        mode?: VideoMode;
        videos?: string[];
        audios?: string[];
    };
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
    completed_at?: number;
    seconds: string;
    size: string;
    metadata?: {
        size_mapping?: {
            adjusted: boolean;
            height: number;
            width: number;
            ratio: VideoRatio;
            resolution: VideoResolution;
            requested_height?: number;
            requested_width?: number;
            message?: string;
        };
        url: string;
    };
    error?: null | object;
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