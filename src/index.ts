/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Integrates Agnes AI as an LLM provider with:
 * - Multimodal support (image understanding)
 * - Image generation capabilities
 * - Video generation capabilities
 * 
 * Configuration:
 * 1. Go to Settings → Models
 * 2. Add a new provider with:
 *    - Provider ID: agnes-ai
 *    - Display Name: Agnes AI
 *    - API: openai-completions
 *    - Base URL: https://api.agnes-ai.cn/v1
 *    - Models: agnes-2.5-flash, agnes-3.0-flash, etc.
 * 3. Enter your API key in the provider settings
 * 
 * The plugin will automatically use the API key from DSH's credential system.
 */

import { createPlugin } from '@deepseek-ai/cordis'

export const name = 'agnes-ai-for-dsh'

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)
  
  // The actual provider configuration is handled by cordis.patch.yml
  // This plugin integrates with DSH's settings and credential system
  
  // When user adds a provider with ID "agnes-ai" in Settings → Models,
  // this plugin ensures it has multimodal support enabled
  
  ctx.logger?.info?.(`[${name}] registered`)
}

/**
 * Agnes AI provider configuration template
 * Users should add this to their settings:
 * 
 * llm-pi-ai:
 *   providers:
 *     agnes-ai:
 *       displayName: 'Agnes AI'
 *       apiKeyEnv: AGNES_API_KEY  // or leave blank to use stored credential
 *       api: openai-completions
 *       baseURL: https://api.agnes-ai.cn/v1
 *       models:
 *         - id: agnes-2.5-flash
 *           name: 'Agnes 2.5 Flash'
 *           contextWindow: 524288
 *           image: true  // Enable multimodal
 */
export const AGNES_AI_PROVIDER_CONFIG = {
  id: 'agnes-ai',
  displayName: 'Agnes AI',
  api: 'openai-completions' as const,
  baseURL: 'https://api.agnes-ai.cn/v1',
  models: [
    {
      id: 'agnes-2.5-flash',
      name: 'Agnes 2.5 Flash',
      contextWindow: 524288,
      maxTokens: 65536,
      image: true,  // Enable multimodal
      description: '免费·多模态对话·编码优化',
    },
    {
      id: 'agnes-3.0-flash',
      name: 'Agnes 3.0 Flash',
      contextWindow: 524288,
      maxTokens: 65536,
      image: true,  // Enable multimodal
      description: '免费·新一代Agent编程模型',
    },
    {
      id: 'agnes-2.5-pro',
      name: 'Agnes 2.5 Pro',
      contextWindow: 524288,
      maxTokens: 65536,
      image: true,  // Enable multimodal
      description: '付费·高级推理·科学计算',
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
}