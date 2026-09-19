/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides:
 * 1. A dedicated Agnes AI settings panel in the DSH sidebar
 * 2. Detection of whether the agnes-ai provider is configured
 * 3. Display of configured models and their status
 * 4. Quick-add guidance for new users
 */

import { Service } from '@deepseek-ai/cordis'

// ============================================================================
// Types
// ============================================================================

export interface AgnesModelInfo {
  id: string
  name: string
  description: string
  isFree: boolean
  category: 'text' | 'image' | 'video'
  supportsImageInput?: boolean
  contextWindow?: number
  maxTokens?: number
}

export interface AgnesProviderState {
  exists: boolean
  hasApiKey: boolean
  models: AgnesModelInfo[]
  error?: string
}

// ============================================================================
// Model Catalog
// ============================================================================

export const AGNES_MODELS: AgnesModelInfo[] = [
  // Text models
  {
    id: 'agnes-2.5-flash',
    name: 'Agnes 2.5 Flash',
    description: '免费·多模态对话·编码优化·智能体工作流',
    isFree: true,
    category: 'text',
    supportsImageInput: true,
    contextWindow: 524288,
    maxTokens: 65536,
  },
  {
    id: 'agnes-3.0-flash',
    name: 'Agnes 3.0 Flash',
    description: '免费·新一代Agent编程模型·工具调用强化',
    isFree: true,
    category: 'text',
    supportsImageInput: true,
    contextWindow: 524288,
    maxTokens: 65536,
  },
  {
    id: 'agnes-2.5-pro',
    name: 'Agnes 2.5 Pro',
    description: '付费·高级推理·科学计算·长上下文分析',
    isFree: false,
    category: 'text',
    supportsImageInput: true,
    contextWindow: 524288,
    maxTokens: 65536,
  },
  {
    id: 'agnes-2.5-pro-beta',
    name: 'Agnes 2.5 Pro Beta',
    description: '付费·打榜模型·Artificial Analysis评测',
    isFree: false,
    category: 'text',
    supportsImageInput: true,
    contextWindow: 524288,
    maxTokens: 65536,
  },
  // Image models
  {
    id: 'agnes-image-2.1-flash',
    name: 'Agnes Image 2.1 Flash',
    description: '免费·文生图·图生图·多图合成',
    isFree: true,
    category: 'image',
  },
  {
    id: 'agnes-image-2.5-flash',
    name: 'Agnes Image 2.5 Flash',
    description: '免费·最新一代图像模型·全面超越2.1版本',
    isFree: true,
    category: 'image',
  },
  // Video models
  {
    id: 'agnes-video-v2.0',
    name: 'Agnes Video V2.0',
    description: '免费·文生视频·图生视频·关键帧动画',
    isFree: true,
    category: 'video',
  },
  {
    id: 'agnes-video-25-flash',
    name: 'Agnes Video 2.5 Flash',
    description: '免费·异步任务API·720P专享',
    isFree: true,
    category: 'video',
  },
  {
    id: 'agnes-video-25',
    name: 'Agnes Video 2.5',
    description: '付费·多分辨率·首尾帧控制·多模态参考',
    isFree: false,
    category: 'video',
  },
]

// ============================================================================
// Provider Detection
// ============================================================================

const AGNES_PROVIDER_ID = 'agnes-ai'

/**
 * Check if the agnes-ai provider is registered in the LLM adapter list.
 * This runs on the host side where we have access to ctx.llm.
 */
export function checkProviderExists(ctx: any): boolean {
  try {
    const providers = ctx.llm?.listProviders?.() ?? []
    return providers.some((p: { id: string }) => p.id === AGNES_PROVIDER_ID)
  } catch {
    return false
  }
}

/**
 * Get the full provider state including API key status and configured models.
 */
export async function getProviderState(ctx: any): Promise<AgnesProviderState> {
  const exists = checkProviderExists(ctx)

  if (!exists) {
    return {
      exists: false,
      hasApiKey: false,
      models: [],
      error: 'Provider not configured',
    }
  }

  // Check API key via credentials service
  let hasApiKey = false
  try {
    const credentials = ctx.get('credentials')
    if (credentials) {
      const ref = 'AGNES_API_KEY'
      const result = await credentials.describe?.([ref])
      if (result?.ok && result.value) {
        hasApiKey = !!result.value[ref]?.configured
      }
    }
  } catch {
    // Credential check failed, assume not configured
  }

  // Use our known catalog as the source of truth
  const models: AgnesModelInfo[] = [...AGNES_MODELS]

  return {
    exists: true,
    hasApiKey,
    models,
  }
}

// ============================================================================
// Settings Operations
// ============================================================================

/**
 * Read the current llm-pi-ai settings to check if agnes-ai provider is configured.
 */
export async function readAgnesSettings(ctx: any): Promise<{
  configured: boolean
  hasApiKey: boolean
  models: string[]
}> {
  try {
    const settings = ctx.get('settings')
    if (!settings) {
      return { configured: false, hasApiKey: false, models: [] }
    }

    // Read the llm-pi-ai namespace
    const ns = 'llm-pi-ai'
    const view = settings.view?.(ns)
    if (!view) {
      return { configured: false, hasApiKey: false, models: [] }
    }

    const value = view.value
    const providers = value?.providers
    const agnesConfig = providers?.['agnes-ai']

    if (!agnesConfig) {
      return { configured: false, hasApiKey: false, models: [] }
    }

    // Check API key
    const apiKeyEnv = agnesConfig.apiKeyEnv || 'AGNES_API_KEY'
    let hasApiKey = false
    try {
      const credentials = ctx.get('credentials')
      if (credentials) {
        const credResult = await credentials.describe?.([apiKeyEnv])
        hasApiKey = !!credResult?.value?.[apiKeyEnv]?.configured
      }
    } catch {
      // Fallback
    }

    // Extract model IDs
    const modelIds = (agnesConfig.models || [])
      .map((m: { id: string }) => m.id)
      .filter(Boolean)

    return {
      configured: true,
      hasApiKey,
      models: modelIds,
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[agnes-ai-client] Failed to read settings:', error)
    return {
      configured: false,
      hasApiKey: false,
      models: [],
    }
  }
}

// ============================================================================
// Client Entry Point
// ============================================================================

export const name = 'agnes-ai-for-dsh-client'

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)

  // The client plugin injects React components into the DSH settings UI.
  // It registers a custom sidebar section for Agnes AI.
  //
  // In the DSH architecture, client-side plugins use the `slots` service
  // to inject UI components into specific positions in the settings page.

  // Expose Agnes AI panel registration
  const slots = ctx.get('slots')
  if (slots) {
    slots.register?.('agnes-ai-settings-panel', {
      name,
      title: 'Agnes AI',
      icon: 'robot',
      order: 50,
    })
  }

  ctx.logger?.info?.(`[${name}] loaded`)
}
