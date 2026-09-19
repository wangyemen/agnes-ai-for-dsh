/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider configuration
 * 2. Provides model catalog and API constants
 */
export const name = 'agnes-ai-for-dsh';
export const AGNES_TEXT_MODELS = [
    {
        id: 'agnes-2.5-flash',
        name: 'Agnes 2.5 Flash',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '免费·多模态对话·编码优化',
        pricing: 'free',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-3.0-flash',
        name: 'Agnes 3.0 Flash',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '免费·新一代Agent编程模型',
        pricing: 'free',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-2.5-pro',
        name: 'Agnes 2.5 Pro',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '付费·高级推理·科学计算',
        pricing: 'paid',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-2.5-pro-beta',
        name: 'Agnes 2.5 Pro Beta',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '付费·打榜模型',
        pricing: 'paid',
        systemPromptUpdate: 'in-history',
    },
];
export const AGNES_IMAGE_MODELS = [
    {
        id: 'agnes-image-2.1-flash',
        name: 'Agnes Image 2.1 Flash',
        image: true,
        description: '免费·文生图·图生图·多图合成',
        pricing: 'free',
    },
    {
        id: 'agnes-image-2.5-flash',
        name: 'Agnes Image 2.5 Flash',
        image: true,
        description: '免费·最新一代图像模型',
        pricing: 'free',
    },
];
export const AGNES_VIDEO_MODELS = [
    {
        id: 'agnes-video-v2.0',
        name: 'Agnes Video V2.0',
        image: false,
        description: '免费·文生视频·图生视频·关键帧动画',
        pricing: 'free',
    },
    {
        id: 'agnes-video-25-flash',
        name: 'Agnes Video 2.5 Flash',
        image: false,
        description: '免费·异步任务API·720P专享',
        pricing: 'free',
    },
    {
        id: 'agnes-video-25',
        name: 'Agnes Video 2.5',
        image: false,
        description: '付费·多分辨率·首尾帧控制',
        pricing: 'paid',
    },
];
export const AGNES_ALL_MODELS = [
    ...AGNES_TEXT_MODELS,
    ...AGNES_IMAGE_MODELS,
    ...AGNES_VIDEO_MODELS,
];
// ============================================================================
// Provider Configuration
// ============================================================================
export const AGNES_PROVIDER_ID = 'agnes-ai';
export const AGNES_BASE_URL = 'https://api.agnes-ai.cn/v1';
export const AGNES_API_KEY_ENV = 'AGNES_API_KEY';
export const AGNES_SETTINGS_NS = 'llm-pi-ai';
export const AGNES_SETTINGS_PATH = ['providers', 'agnes-ai'];
export const AGNES_PROVIDER_CONFIG = {
    displayName: 'Agnes AI',
    apiKeyEnv: AGNES_API_KEY_ENV,
    api: 'openai-completions',
    baseURL: AGNES_BASE_URL,
    models: AGNES_TEXT_MODELS,
};
// ============================================================================
// Tool Definitions
// ============================================================================
export const AGNES_IMAGE_GENERATION_TOOL = {
    name: 'agnes_image_generation',
    description: [
        'Generate images using Agnes AI image models.',
        'Supports text-to-image and image-to-image generation.',
        'Returns an image URL or base64 data.',
        '',
        'Parameters:',
        '  - model: Model ID (e.g., agnes-image-2.5-flash)',
        '  - prompt: Text description of the image',
        '  - size: Output size (1K, 2K, 3K, 4K)',
        '  - ratio: Aspect ratio (1:1, 16:9, 9:16, etc.)',
        '  - image: Input image URL for image-to-image (optional)',
        '  - return_base64: Return base64 instead of URL (optional)',
    ].join('\n'),
    parameters: {
        type: 'object',
        properties: {
            model: {
                type: 'string',
                enum: AGNES_IMAGE_MODELS.map((m) => m.id),
                description: 'Image generation model to use',
            },
            prompt: {
                type: 'string',
                description: 'Text description of the image to generate',
            },
            size: {
                type: 'string',
                enum: ['1K', '2K', '3K', '4K'],
                description: 'Output image size',
            },
            ratio: {
                type: 'string',
                enum: ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'],
                description: 'Aspect ratio',
            },
            image: {
                type: 'string',
                description: 'Input image URL for image-to-image generation',
            },
            return_base64: {
                type: 'boolean',
                description: 'Return base64 encoded image instead of URL',
            },
        },
        required: ['model', 'prompt', 'size'],
    },
};
export const AGNES_VIDEO_GENERATION_TOOL = {
    name: 'agnes_video_generation',
    description: [
        'Generate videos using Agnes AI video models.',
        'Supports text-to-video and image-to-video generation.',
        'Returns a video task ID for async polling.',
        '',
        'Parameters:',
        '  - model: Model ID (e.g., agnes-video-25-flash)',
        '  - prompt: Text description of the video',
        '  - seconds: Video duration in seconds (default: 5)',
        '  - size: Resolution (480P, 720P, 1080P, 1K, 2K)',
        '  - aspect_ratio: Video aspect ratio (16:9, 9:16, 1:1)',
        '  - image: Input image URL for image-to-video (optional)',
    ].join('\n'),
    parameters: {
        type: 'object',
        properties: {
            model: {
                type: 'string',
                enum: AGNES_VIDEO_MODELS.map((m) => m.id),
                description: 'Video generation model to use',
            },
            prompt: {
                type: 'string',
                description: 'Text description of the video to generate',
            },
            seconds: {
                type: 'string',
                description: 'Video duration in seconds',
            },
            size: {
                type: 'string',
                enum: ['480P', '720P', '1080P', '1K', '2K'],
                description: 'Video resolution',
            },
            aspect_ratio: {
                type: 'string',
                enum: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
                description: 'Video aspect ratio',
            },
            image: {
                type: 'string',
                description: 'Input image URL for image-to-video generation',
            },
        },
        required: ['model', 'prompt'],
    },
};
export const AGNES_TOOLS = [AGNES_IMAGE_GENERATION_TOOL, AGNES_VIDEO_GENERATION_TOOL];
// ============================================================================
// Plugin Entry Point
// ============================================================================
export function apply(ctx) {
    ctx.logger?.info?.(`[${name}] loading`);
    // Register the provider config under llm-pi-ai settings namespace
    // The actual registration happens via cordis.patch.yml which inserts
    // the dsh-llm-pi-ai bundle with our provider configuration.
    // This host plugin ensures the settings are available at runtime.
    // Log model catalog for debugging
    ctx.logger?.info?.(`[${name}] registered ${AGNES_ALL_MODELS.length} models`);
    ctx.logger?.info?.(`[${name}] text: ${AGNES_TEXT_MODELS.length}, image: ${AGNES_IMAGE_MODELS.length}, video: ${AGNES_VIDEO_MODELS.length}`);
    ctx.logger?.info?.(`[${name}] loaded`);
}
//# sourceMappingURL=index.js.map