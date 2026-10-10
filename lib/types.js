/**
 * Shared types and constants for the Agnes AI plugin.
 *
 * Agnes exposes an OpenAI-compatible surface (see ../API/*.md):
 *   POST /v1/chat/completions     text / multimodal chat
 *   POST /v1/images/generations   image generation + editing
 *   POST /v1/videos               async video task creation
 *   GET  /agnesapi?video_id=..    async video task polling
 */
// ============================================================================
// Endpoints and regions
// ============================================================================
/** China endpoint (default). */
export const AGNES_BASE_URL_CN = 'https://api.agnes-ai.cn/v1';
/** Global endpoint. */
export const AGNES_BASE_URL_GLOBAL = 'https://apihub.agnes-ai.com/v1';
/** Resolve a region to its API base URL. */
export function getAgnesBaseUrl(region = 'cn') {
    return region === 'global' ? AGNES_BASE_URL_GLOBAL : AGNES_BASE_URL_CN;
}
/**
 * Strip the trailing `/v1` so a root-relative route such as
 * `/agnesapi?video_id=...` can be built from the same base URL.
 */
export function getAgnesOrigin(baseURL) {
    return baseURL.replace(/\/v1\/?$/, '');
}
// ============================================================================
// Provider / settings identity
// ============================================================================
/** Provider route registered with the llm-pi-ai adapter. */
export const AGNES_PROVIDER_ID = 'agnes-ai';
/** Credential reference holding the API key. */
export const AGNES_API_KEY_ENV = 'AGNES_AI_API_KEY';
/** llm-pi-ai settings namespace (the loader entry id of that plugin). */
export const AGNES_SETTINGS_NS = 'llm-pi-ai';
/** Path of the provider block inside that namespace. */
export const AGNES_SETTINGS_PATH = ['providers', AGNES_PROVIDER_ID];
/** Chat / multimodal models. */
export const AGNES_CHAT_MODELS = [
    {
        id: 'agnes-2.5-flash',
        name: 'Agnes 2.5 Flash',
        kind: 'chat',
        vision: true,
        free: true,
        description: '免费·多模态对话·编码优化',
        contextWindow: 524288,
        maxTokens: 65536,
    },
    {
        id: 'agnes-3.0-flash',
        name: 'Agnes 3.0 Flash',
        kind: 'chat',
        vision: true,
        free: true,
        description: '免费·新一代 Agent 编程模型',
        contextWindow: 524288,
        maxTokens: 65536,
    },
    {
        id: 'agnes-2.5-pro',
        name: 'Agnes 2.5 Pro',
        kind: 'chat',
        vision: true,
        free: false,
        description: '付费·高级推理·科学计算',
        contextWindow: 524288,
        maxTokens: 65536,
    },
    {
        id: 'agnes-2.5-pro-beta',
        name: 'Agnes 2.5 Pro Beta',
        kind: 'chat',
        vision: true,
        free: false,
        description: '付费·打榜模型',
        contextWindow: 524288,
        maxTokens: 65536,
    },
];
/** Image generation / editing models. */
export const AGNES_IMAGE_MODELS = [
    {
        id: 'agnes-image-2.1-flash',
        name: 'Agnes Image 2.1 Flash',
        kind: 'image',
        vision: true,
        free: true,
        description: '免费·文生图·图生图·多图合成',
    },
    {
        id: 'agnes-image-2.5-flash',
        name: 'Agnes Image 2.5 Flash',
        kind: 'image',
        vision: true,
        free: true,
        description: '免费·最新一代图像模型',
    },
];
/**
 * Video generation models.
 * Note: `agnes-video-v2.0` is retired upstream — do not reintroduce it.
 */
export const AGNES_VIDEO_MODELS = [
    {
        id: 'agnes-video-2.5-flash',
        name: 'Agnes Video 2.5 Flash',
        kind: 'video',
        vision: false,
        free: true,
        description: '限时免费·异步任务·720P 专享',
    },
    {
        id: 'agnes-video-2.5',
        name: 'Agnes Video 2.5',
        kind: 'video',
        vision: false,
        free: false,
        description: '付费·多分辨率·首尾帧控制·多模态参考',
    },
];
export const AGNES_ALL_MODELS = [
    ...AGNES_CHAT_MODELS,
    ...AGNES_IMAGE_MODELS,
    ...AGNES_VIDEO_MODELS,
];
/** Model ids for the image tool's enum. */
export const AGNES_IMAGE_MODEL_IDS = AGNES_IMAGE_MODELS.map((m) => m.id);
/** Model ids for the video tool's enum. */
export const AGNES_VIDEO_MODEL_IDS = AGNES_VIDEO_MODELS.map((m) => m.id);
// ============================================================================
// Hard API limits, lifted from the official docs
// ============================================================================
/** Image size tiers accepted by the image endpoint. */
export const AGNES_IMAGE_SIZES = ['1K', '2K', '3K', '4K'];
/** Aspect ratios accepted by both media endpoints. */
export const AGNES_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'];
/** Video resolutions for `agnes-video-2.5` (Flash is fixed to 720P). */
export const AGNES_VIDEO_SIZES = ['720P', '1080P', '1K', '2K'];
/** Video durations, as strings, inclusive. */
export const AGNES_VIDEO_SECONDS = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
/** Video generation modes. */
export const AGNES_VIDEO_MODES = ['text', 'keyframe', 'reference'];
/** The one resolution `agnes-video-2.5-flash` accepts. */
export const AGNES_VIDEO_FLASH_SIZE = '720P';
// ============================================================================
// Provider config block written into cordis.patch.yml
// ============================================================================
/** The `agnes-ai` provider entry for the llm-pi-ai adapter. */
export const AGNES_PROVIDER_CONFIG = {
    displayName: 'Agnes AI',
    apiKeyEnv: AGNES_API_KEY_ENV,
    api: 'openai-completions',
    baseURL: AGNES_BASE_URL_CN,
    defaultInput: ['text', 'image'],
    models: AGNES_CHAT_MODELS.map((m) => ({
        id: m.id,
        name: m.name,
        contextWindow: m.contextWindow,
        defaultMaxTokens: m.maxTokens,
        input: ['text', 'image'],
        description: m.description,
    })),
};
//# sourceMappingURL=types.js.map