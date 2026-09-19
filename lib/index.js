/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider
 * 2. Sets up settings namespace for client configuration
 */
import { Schema } from '@deepseek-ai/cordis';
export const name = 'agnes-ai-for-dsh';
// Configuration schema for Agnes AI settings
export const Config = Schema.object({
    apiKeyEnv: Schema.string().default('AGNES_API_KEY'),
    baseURL: Schema.string().default('https://api.agnes-ai.cn/v1'),
    globalBaseURL: Schema.string().default('https://apihub.agnes-ai.com/v1'),
    defaultEndpoint: Schema.enum(['china', 'global']).default('china'),
    requirePaidConfirmation: Schema.boolean().default(true),
});
export function apply(ctx, config) {
    ctx.logger?.info?.(`[${name}] loading`);
    // Register settings namespace for client to read/write
    if (ctx.settings) {
        ctx.settings.installSection(ctx, 'agnes-ai-settings', Config, config);
        ctx.logger?.info?.(`[${name}] settings namespace registered`);
    }
    ctx.logger?.info?.(`[${name}] loaded`);
}
/**
 * Agnes AI provider configuration template
 */
export const AGNES_AI_PROVIDER_CONFIG = {
    displayName: 'Agnes AI',
    apiKeyEnv: 'AGNES_API_KEY',
    api: 'openai-completions',
    baseURL: 'https://api.agnes-ai.cn/v1',
    models: [
        {
            id: 'agnes-2.5-flash',
            name: 'Agnes 2.5 Flash',
            contextWindow: 524288,
            maxTokens: 65536,
            image: true,
            description: '免费·多模态对话·编码优化',
        },
        {
            id: 'agnes-3.0-flash',
            name: 'Agnes 3.0 Flash',
            contextWindow: 524288,
            maxTokens: 65536,
            image: true,
            description: '免费·新一代Agent编程模型',
        },
        {
            id: 'agnes-image-2.5-flash',
            name: 'Agnes Image 2.5 Flash',
            image: true,
            description: '免费·图像生成',
        },
        {
            id: 'agnes-video-25-flash',
            name: 'Agnes Video 2.5 Flash',
            image: false,
            description: '免费·视频生成',
        },
    ],
};
//# sourceMappingURL=index.js.map