/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * This plugin provides:
 * 1. Pre-configured LLM provider settings for Agnes AI
 * 2. Multimodal support (image understanding)
 * 3. Image and video generation tools
 * 
 * Users need to:
 * 1. Add provider with ID "agnes-ai" in Settings → Models
 * 2. Enter their API key
 * 3. Enable image support for text models
 */

import { createPlugin } from '@deepseek-ai/cordis'

export const name = 'agnes-ai-for-dsh'

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)
  
  // Log setup instructions
  ctx.logger?.info?.(`[${name}] To configure Agnes AI:`)
  ctx.logger?.info?.(`[${name}] 1. Go to Settings → Models`)
  ctx.logger?.info?.(`[${name}] 2. Add new provider:`)
  ctx.logger?.info?.(`[${name}]    - Provider ID: agnes-ai`)
  ctx.logger?.info?.(`[${name}]    - Display Name: Agnes AI`)
  ctx.logger?.info?.(`[${name}]    - API: openai-completions`)
  ctx.logger?.info?.(`[${name}]    - Base URL: https://api.agnes-ai.cn/v1`)
  ctx.logger?.info?.(`[${name}]    - API Key: [your api key]`)
  ctx.logger?.info?.(`[${name}] 3. Add models:`)
  ctx.logger?.info?.(`[${name}]    - agnes-2.5-flash (enable Image)`)
  ctx.logger?.info?.(`[${name}]    - agnes-3.0-flash (enable Image)`)
  ctx.logger?.info?.(`[${name}]    - agnes-image-2.5-flash`)
  ctx.logger?.info?.(`[${name}]    - agnes-video-25-flash`)
  
  ctx.logger?.info?.(`[${name}] registered`)
}

/**
 * Pre-configured Agnes AI provider settings
 * Copy this to your settings.yaml under llm-pi-ai:
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
 *         - id: agnes-3.0-flash
 *           name: 'Agnes 3.0 Flash'
 *           contextWindow: 524288
 *           image: true
 *         - id: agnes-image-2.5-flash
 *           name: 'Agnes Image 2.5 Flash'
 *         - id: agnes-video-25-flash
 *           name: 'Agnes Video 2.5 Flash'
 */
export const AGNES_AI_DEFAULT_CONFIG = {
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