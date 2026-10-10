/**
 * Shared types and constants for the Agnes AI plugin.
 *
 * Agnes exposes an OpenAI-compatible surface (see ../API/*.md):
 *   POST /v1/chat/completions     text / multimodal chat
 *   POST /v1/images/generations   image generation + editing
 *   POST /v1/videos               async video task creation
 *   GET  /agnesapi?video_id=..    async video task polling
 */
/** China endpoint (default). */
export declare const AGNES_BASE_URL_CN = "https://api.agnes-ai.cn/v1";
/** Global endpoint. */
export declare const AGNES_BASE_URL_GLOBAL = "https://apihub.agnes-ai.com/v1";
export type AgnesRegion = 'cn' | 'global';
/** Resolve a region to its API base URL. */
export declare function getAgnesBaseUrl(region?: AgnesRegion): string;
/**
 * Strip the trailing `/v1` so a root-relative route such as
 * `/agnesapi?video_id=...` can be built from the same base URL.
 */
export declare function getAgnesOrigin(baseURL: string): string;
/** Provider route registered with the llm-pi-ai adapter. */
export declare const AGNES_PROVIDER_ID = "agnes-ai";
/** Credential reference holding the API key. */
export declare const AGNES_API_KEY_ENV = "AGNES_AI_API_KEY";
/** llm-pi-ai settings namespace (the loader entry id of that plugin). */
export declare const AGNES_SETTINGS_NS = "llm-pi-ai";
/** Path of the provider block inside that namespace. */
export declare const AGNES_SETTINGS_PATH: readonly ["providers", "agnes-ai"];
export type AgnesModelKind = 'chat' | 'image' | 'video';
export interface AgnesModel {
    id: string;
    name: string;
    kind: AgnesModelKind;
    /** Whether the model accepts image input. */
    vision: boolean;
    /** Whether usage is currently free. */
    free: boolean;
    description: string;
    contextWindow?: number;
    /** Default output token ceiling, chat models only. */
    maxTokens?: number;
}
/** Chat / multimodal models. */
export declare const AGNES_CHAT_MODELS: AgnesModel[];
/** Image generation / editing models. */
export declare const AGNES_IMAGE_MODELS: AgnesModel[];
/**
 * Video generation models.
 * Note: `agnes-video-v2.0` is retired upstream — do not reintroduce it.
 */
export declare const AGNES_VIDEO_MODELS: AgnesModel[];
export declare const AGNES_ALL_MODELS: AgnesModel[];
/** Model ids for the image tool's enum. */
export declare const AGNES_IMAGE_MODEL_IDS: string[];
/** Model ids for the video tool's enum. */
export declare const AGNES_VIDEO_MODEL_IDS: string[];
/** Image size tiers accepted by the image endpoint. */
export declare const AGNES_IMAGE_SIZES: readonly ["1K", "2K", "3K", "4K"];
/** Aspect ratios accepted by both media endpoints. */
export declare const AGNES_RATIOS: readonly ["1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9"];
/** Video resolutions for `agnes-video-2.5` (Flash is fixed to 720P). */
export declare const AGNES_VIDEO_SIZES: readonly ["720P", "1080P", "1K", "2K"];
/** Video durations, as strings, inclusive. */
export declare const AGNES_VIDEO_SECONDS: readonly ["4", "5", "6", "7", "8", "9", "10", "11", "12"];
/** Video generation modes. */
export declare const AGNES_VIDEO_MODES: readonly ["text", "keyframe", "reference"];
/** One of the three documented video generation modes. */
export type AgnesVideoMode = (typeof AGNES_VIDEO_MODES)[number];
/** The one resolution `agnes-video-2.5-flash` accepts. */
export declare const AGNES_VIDEO_FLASH_SIZE = "720P";
/** The `agnes-ai` provider entry for the llm-pi-ai adapter. */
export declare const AGNES_PROVIDER_CONFIG: {
    displayName: string;
    apiKeyEnv: string;
    api: string;
    baseURL: string;
    defaultInput: string[];
    models: {
        id: string;
        name: string;
        contextWindow: number | undefined;
        defaultMaxTokens: number | undefined;
        input: string[];
        description: string;
    }[];
};
//# sourceMappingURL=types.d.ts.map