/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Integrates Agnes AI as an LLM provider with:
 * - Multimodal support (image understanding)
 * - Image generation capabilities
 * - Video generation capabilities
 * 
 * Configuration:
 * 1. Set AGNES_API_KEY environment variable
 * 2. In DSH Settings → Models, add provider with id "agnes-ai"
 * 3. Select models from the Agnes AI catalog
 */

import { createPlugin } from '@deepseek-ai/cordis'

export const name = 'agnes-ai-for-dsh'

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)
  
  // Register Agnes AI as a provider
  // The actual provider configuration is in cordis.patch.yml
  // This plugin handles the settings panel integration
  
  ctx.logger?.info?.(`[${name}] registered`)
}

/**
 * Agnes AI provider configuration
 * Users should add this to their settings:
 * 
 * llm-pi-ai:
 *   providers:
 *     agnes-ai:
 *       displayName: 'Agnes AI'
 *       apiKeyEnv: AGNES_API_KEY
 *       api: openai-completions
 *       baseURL: https://api.agnes-ai.cn/v1
 *       models:
 *         - id: agnes-2.5-flash
 *           name: 'Agnes 2.5 Flash'
 *           contextWindow: 524288
 *           image: true
 */
export const AGNES_AI_PROVIDER = {
  id: 'agnes-ai',
  displayName: 'Agnes AI',
  apiKeyEnv: 'AGNES_API_KEY',
  api: 'openai-completions' as const,
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
      id: 'agnes-2.5-pro',
      name: 'Agnes 2.5 Pro',
      contextWindow: 524288,
      maxTokens: 65536,
      image: true,
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