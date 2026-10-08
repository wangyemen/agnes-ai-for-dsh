/**
 * Agnes AI Types - Complete model catalog and API types
 */
// ============================================================================
// Model Categories
// ============================================================================
/** Text models that are free to use */
export const TEXT_FREE_MODELS = ['agnes-2.5-flash', 'agnes-3.0-flash'];
/** Text models that require payment */
export const TEXT_PAID_MODELS = ['agnes-2.5-pro', 'agnes-2.5-pro-beta'];
/** All text models */
export const TEXT_MODELS = [...TEXT_FREE_MODELS, ...TEXT_PAID_MODELS];
/** Image generation models (all free) */
export const IMAGE_MODELS = ['agnes-image-2.1-flash', 'agnes-image-2.5-flash'];
/** Video generation models. `agnes-video-v2.0` was retired upstream and removed. */
export const VIDEO_FREE_MODELS = ['agnes-video-2.5-flash'];
export const VIDEO_PAID_MODELS = ['agnes-video-2.5'];
export const VIDEO_MODELS = [...VIDEO_FREE_MODELS, ...VIDEO_PAID_MODELS];
/** All Agnes AI models */
export const AGNES_MODELS = [...TEXT_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS];
// ============================================================================
// API Endpoints
// ============================================================================
export const AGNES_ENDPOINTS = {
    CHINA: 'https://api.agnes-ai.cn/v1',
    GLOBAL: 'https://apihub.agnes-ai.com/v1',
};
// ============================================================================
// Image Generation Types
// ============================================================================
export const IMAGE_SIZES = ['1K', '2K', '3K', '4K'];
export const IMAGE_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'];
// ============================================================================
// Video Generation Types
// ============================================================================
/** 2.5 / 2.5 Flash 的生成模式。v2.0 的 `ti2vid` / `keyframes` 已废弃。 */
export const VIDEO_MODES = ['text', 'keyframe', 'reference'];
/** 输出分辨率档位。Flash 仅支持 `720P`。 */
export const VIDEO_RESOLUTIONS = ['720P', '1080P', '1K', '2K'];
export const VIDEO_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'];
/** Complete pricing catalog */
export const AGNES_MODEL_PRICING = [
    // Text Models - Free
    {
        id: 'agnes-2.5-flash',
        name: 'Agnes 2.5 Flash',
        isFree: true,
        category: 'text',
        description: '免费·多模态对话·编码优化·智能体工作流',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImageInput: true,
    },
    {
        id: 'agnes-3.0-flash',
        name: 'Agnes 3.0 Flash',
        isFree: true,
        category: 'text',
        description: '免费·新一代Agent编程模型·工具调用强化',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImageInput: true,
    },
    // Text Models - Paid
    {
        id: 'agnes-2.5-pro',
        name: 'Agnes 2.5 Pro',
        isFree: false,
        category: 'text',
        description: '付费·高级推理·科学计算·长上下文分析',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImageInput: true,
        pricing: {
            inputCacheHit: '¥0.035/百万Token',
            input: '¥0.35/百万Token',
            output: '¥1.00/百万Token',
        },
    },
    {
        id: 'agnes-2.5-pro-beta',
        name: 'Agnes 2.5 Pro Beta',
        isFree: false,
        category: 'text',
        description: '付费·打榜模型·Artificial Analysis评测',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImageInput: true,
        pricing: {
            inputCacheHit: '¥0.035/百万Token',
            input: '¥0.35/百万Token',
            output: '¥1.00/百万Token',
        },
    },
    // Image Models - Free
    {
        id: 'agnes-image-2.1-flash',
        name: 'Agnes Image 2.1 Flash',
        isFree: true,
        category: 'image',
        description: '免费·文生图·图生图·多图合成',
    },
    {
        id: 'agnes-image-2.5-flash',
        name: 'Agnes Image 2.5 Flash',
        isFree: true,
        category: 'image',
        description: '免费·最新一代图像模型',
    },
    // Video Models - Free
    {
        id: 'agnes-video-2.5-flash',
        name: 'Agnes Video 2.5 Flash',
        isFree: true,
        category: 'video',
        description: '限时免费·异步任务API·720P专享·文生视频·首尾帧控制·图片/音频参考',
    },
    // Video Models - Paid
    {
        id: 'agnes-video-2.5',
        name: 'Agnes Video 2.5',
        isFree: false,
        category: 'video',
        description: '付费·多分辨率·首尾帧控制·多模态参考',
        pricing: {
            '720P': '¥0.15/秒',
            '1080P': '¥0.25/秒',
            '1K': '¥0.25/秒',
            '2K': '¥0.35/秒',
        },
    },
];
//# sourceMappingURL=types.js.map