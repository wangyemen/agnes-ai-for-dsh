/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides GUI settings panel for configuring Agnes AI.
 * Registers a settings section in the DSH web client.
 */
// ============================================================================
// Model Definitions
// ============================================================================
/** Free text models - available without confirmation */
export const FREE_TEXT_MODELS = [
    {
        id: 'agnes-2.5-flash',
        name: 'Agnes 2.5 Flash',
        description: '免费·多模态对话·编码优化·智能体工作流',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImage: true,
    },
    {
        id: 'agnes-3.0-flash',
        name: 'Agnes 3.0 Flash',
        description: '免费·新一代Agent编程模型·工具调用强化',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImage: true,
    },
];
/** Paid text models - require confirmation */
export const PAID_TEXT_MODELS = [
    {
        id: 'agnes-2.5-pro',
        name: 'Agnes 2.5 Pro',
        description: '付费·高级推理·科学计算·长上下文分析',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImage: true,
        pricing: {
            inputCacheHit: '¥0.035/百万Token',
            input: '¥0.35/百万Token',
            output: '¥1.00/百万Token',
        },
    },
    {
        id: 'agnes-2.5-pro-beta',
        name: 'Agnes 2.5 Pro Beta',
        description: '付费·打榜模型·Artificial Analysis评测',
        contextWindow: 524288,
        maxTokens: 65536,
        supportsImage: true,
        pricing: {
            inputCacheHit: '¥0.035/百万Token',
            input: '¥0.35/百万Token',
            output: '¥1.00/百万Token',
        },
    },
];
/** All text models */
export const ALL_TEXT_MODELS = [...FREE_TEXT_MODELS, ...PAID_TEXT_MODELS];
/** Free image models */
export const FREE_IMAGE_MODELS = [
    {
        id: 'agnes-image-2.1-flash',
        name: 'Agnes Image 2.1 Flash',
        description: '免费·文生图·图生图·多图合成',
    },
    {
        id: 'agnes-image-2.5-flash',
        name: 'Agnes Image 2.5 Flash',
        description: '免费·最新一代图像模型·全面超越2.1版本',
    },
];
/** Free video models */
export const FREE_VIDEO_MODELS = [
    {
        id: 'agnes-video-v2.0',
        name: 'Agnes Video V2.0',
        description: '免费·文生视频·图生视频·关键帧动画',
    },
    {
        id: 'agnes-video-25-flash',
        name: 'Agnes Video 2.5 Flash',
        description: '免费·异步任务API·720P专享',
    },
];
/** Paid video models */
export const PAID_VIDEO_MODELS = [
    {
        id: 'agnes-video-25',
        name: 'Agnes Video 2.5',
        description: '付费·多分辨率·首尾帧控制·多模态参考',
        pricing: {
            '720P': '¥0.15/秒',
            '1080P': '¥0.25/秒',
            '1K': '¥0.35/秒',
            '2K': '¥0.35/秒',
        },
    },
];
// ============================================================================
// Client Plugin
// ============================================================================
export const name = 'agnes-ai-for-dsh-client';
export const inject = ['settings', 'slots'];
export function apply(ctx) {
    ctx.logger?.info?.(`[${name}] loading`);
    // Register settings section in the sidebar
    ctx.slots?.inject?.('settings.section', () => {
        return {
            key: 'agnes-ai-settings',
            title: 'Agnes AI',
            icon: 'sparkles',
            order: 50,
            render: () => {
                // This would render the settings panel UI
                // For now, return a simple placeholder
                return {
                    type: 'div',
                    children: [
                        { type: 'h2', children: 'Agnes AI 配置' },
                        { type: 'p', children: '请在 设置 → 模型 中配置 Agnes AI 提供商' },
                        { type: 'hr' },
                        {
                            type: 'details',
                            children: [
                                { type: 'summary', children: '快速配置' },
                                {
                                    type: 'pre',
                                    children: JSON.stringify({
                                        llm_pi_ai: {
                                            providers: {
                                                'agnes-ai': {
                                                    displayName: 'Agnes AI',
                                                    apiKeyEnv: 'AGNES_API_KEY',
                                                    api: 'openai-completions',
                                                    baseURL: 'https://api.agnes-ai.cn/v1',
                                                    models: [
                                                        { id: 'agnes-2.5-flash', image: true },
                                                        { id: 'agnes-3.0-flash', image: true },
                                                        { id: 'agnes-image-2.5-flash' },
                                                        { id: 'agnes-video-25-flash' },
                                                    ],
                                                },
                                            },
                                        },
                                    }, null, 2)
                                },
                            ]
                        },
                    ]
                };
            }
        };
    });
    ctx.logger?.info?.(`[${name}] loaded`);
}
//# sourceMappingURL=index.js.map