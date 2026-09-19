/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider configuration
 * 2. Registers image/video generation tools
 * 3. Provides model catalog and API constants
 */

import type { Context } from '@deepseek-ai/cordis'

export const name = 'agnes-ai-for-dsh'

// ============================================================================
// Model Catalog
// ============================================================================

export interface AgnesModelEntry {
  id: string
  name: string
  contextWindow?: number
  defaultMaxTokens?: number
  image?: boolean
  description?: string
  pricing?: 'free' | 'paid'
  reasoningEfforts?: Record<string, unknown>
  systemPromptUpdate?: string
}

export const AGNES_TEXT_MODELS: AgnesModelEntry[] = [
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
]

export const AGNES_IMAGE_MODELS: AgnesModelEntry[] = [
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
]

export const AGNES_VIDEO_MODELS: AgnesModelEntry[] = [
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
]

export const AGNES_ALL_MODELS = [
  ...AGNES_TEXT_MODELS,
  ...AGNES_IMAGE_MODELS,
  ...AGNES_VIDEO_MODELS,
]

// ============================================================================
// Provider Configuration
// ============================================================================

export const AGNES_PROVIDER_ID = 'agnes-ai'
export const AGNES_API_KEY_ENV = 'AGNES_AI_API_KEY'
export const AGNES_SETTINGS_NS = 'llm-pi-ai'
export const AGNES_SETTINGS_PATH = ['providers', 'agnes-ai']

/** China region API endpoint */
export const AGNES_BASE_URL_CN = 'https://api.agnes-ai.cn/v1'
/** Global/International region API endpoint */
export const AGNES_BASE_URL_GLOBAL = 'https://apihub.agnes-ai.com/v1'

/** Available regions for Agnes AI */
export const AGNES_REGIONS = {
  CN: 'cn',
  GLOBAL: 'global',
} as const

export type AgnesRegion = typeof AGNES_REGIONS[keyof typeof AGNES_REGIONS]

/** Get base URL based on region */
export function getAgnesBaseUrl(region: AgnesRegion = 'cn'): string {
  return region === 'global' ? AGNES_BASE_URL_GLOBAL : AGNES_BASE_URL_CN
}

export const AGNES_PROVIDER_CONFIG = {
  displayName: 'Agnes AI',
  apiKeyEnv: AGNES_API_KEY_ENV,
  api: 'openai-completions' as const,
  baseURL: AGNES_BASE_URL_CN,
  models: AGNES_TEXT_MODELS,
}

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
}

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
}

export const AGNES_TOOLS = [AGNES_IMAGE_GENERATION_TOOL, AGNES_VIDEO_GENERATION_TOOL]

// ============================================================================
// API Key Resolution
// ============================================================================

/**
 * 从 DSH credentials 服务读取 Agnes API Key。
 * 尝试多种可能的 API 形态，兼容不同 DSH 版本的 credentials 服务。
 */
async function resolveAgnesApiKey(ctx: any): Promise<string | null> {
  try {
    const credentials = ctx.get('credentials')
    if (!credentials) return null

    const ref = AGNES_API_KEY_ENV

    // 形态 1：resolve([ref]) → { [ref]: 'value' }
    if (typeof credentials.resolve === 'function') {
      const result = await credentials.resolve([ref])
      const v = result?.[ref] ?? result?.values?.[ref]
      if (typeof v === 'string') return v
      if (v && typeof v === 'object' && typeof v.value === 'string') return v.value
    }

    // 形态 2：get(ref) → 'value' | { value: 'value' }
    if (typeof credentials.get === 'function') {
      const result = await credentials.get(ref)
      if (typeof result === 'string') return result
      if (result && typeof result.value === 'string') return result.value
    }

    // 形态 3：describe([ref]) → { value: { [ref]: { value } } }
    if (typeof credentials.describe === 'function') {
      const result = await credentials.describe([ref])
      const v = result?.value?.[ref]?.value
      if (typeof v === 'string') return v
    }

    return null
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[agnes-ai-for-dsh] resolveAgnesApiKey failed:', err)
    return null
  }
}

// ============================================================================
// Tool Implementations (HTTP calls)
// ============================================================================

async function executeImageGeneration(args: any, ctx: any): Promise<unknown> {
  const apiKey = await resolveAgnesApiKey(ctx)
  if (!apiKey) {
    return {
      error: `Agnes API key not configured. Please set ${AGNES_API_KEY_ENV} in Settings → Credentials.`,
    }
  }

  const body: any = {
    model: args.model || 'agnes-image-2.5-flash',
    prompt: args.prompt,
    size: args.size || '1K',
  }
  if (args.ratio) body.ratio = args.ratio
  if (args.image) body.image = [args.image]
  if (args.return_base64) body.response_format = 'b64_json'

  try {
    const resp = await fetch(`${AGNES_BASE_URL_CN}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return { error: `Agnes Image API error (${resp.status}): ${text}` }
    }

    const data: any = await resp.json()
    const item = data?.data?.[0] ?? data?.data ?? data
    if (!item) return { error: 'Agnes API returned no image data.' }

    const url = item?.url
    const b64 = item?.b64_json
    if (url) return { url }
    if (b64) return { url: `data:image/png;base64,${b64}` }
    return { error: 'Agnes API returned no URL or b64_json.' }
  } catch (err: any) {
    return { error: `Network error: ${err.message || String(err)}` }
  }
}

async function executeVideoGeneration(args: any, ctx: any): Promise<unknown> {
  const apiKey = await resolveAgnesApiKey(ctx)
  if (!apiKey) {
    return {
      error: `Agnes API key not configured. Please set ${AGNES_API_KEY_ENV} in Settings → Credentials.`,
    }
  }

  const modelName = args.model || 'agnes-video-25-flash'

  const body: any = {
    model: modelName,
    prompt: args.prompt,
    seconds: args.seconds || '5',
    size: args.size || '720P',
    aspect_ratio: args.aspect_ratio || '16:9',
    mode: args.image ? 'image' : 'text',
  }
  if (args.image) body.image = args.image

  // 1. 创建视频生成任务
  let videoId: string | null = null
  try {
    const resp = await fetch(`${AGNES_BASE_URL_CN}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return { error: `Agnes Video create error (${resp.status}): ${text}` }
    }

    const data: any = await resp.json()
    videoId = data?.video_id ?? data?.id ?? data?.data?.video_id ?? null
    if (!videoId) return { error: 'Agnes API did not return a video_id.' }
  } catch (err: any) {
    return { error: `Network error during video create: ${err.message || String(err)}` }
  }

  // 2. 轮询任务状态
  const maxAttempts = 90 // 约 3 分钟
  const pollIntervalMs = 2000
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, pollIntervalMs))

    try {
      const resp = await fetch(
        `https://api.agnes-ai.cn/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=${encodeURIComponent(modelName)}`,
        { headers: { 'Authorization': `Bearer ${apiKey}` } },
      )
      if (!resp.ok) continue

      const data: any = await resp.json()
      const status = data?.status

      if (status === 'completed' || status === 'succeeded' || status === 'success') {
        const url = data?.metadata?.url ?? data?.url ?? data?.video_url
        if (!url) return { error: 'Video completed but no URL returned.' }
        return { url }
      }

      if (status === 'failed' || status === 'error') {
        return { error: `Video generation failed: ${data?.error || data?.message || 'unknown'}` }
      }

      // pending / processing → 继续轮询
    } catch {
      // 网络抖动，继续下一次轮询
    }
  }

  return { error: 'Video generation timed out after ~3 minutes.' }
}

// ============================================================================
// Plugin Entry Point
// ============================================================================

export function apply(ctx: Context): void {
  ctx.logger?.info?.(`[${name}] loading`)

  ctx.inject(['tools'], (sctx: any) => {
    // ---- 图片生成工具 ----
    sctx.tools.register({
      name: AGNES_IMAGE_GENERATION_TOOL.name,
      description: AGNES_IMAGE_GENERATION_TOOL.description,
      parameters: AGNES_IMAGE_GENERATION_TOOL.parameters,
      execute: async (args: any) => executeImageGeneration(args, sctx),
    })

    // ---- 视频生成工具 ----
    sctx.tools.register({
      name: AGNES_VIDEO_GENERATION_TOOL.name,
      description: AGNES_VIDEO_GENERATION_TOOL.description,
      parameters: AGNES_VIDEO_GENERATION_TOOL.parameters,
      execute: async (args: any) => executeVideoGeneration(args, sctx),
    })

    ctx.logger?.info?.(`[${name}] registered 2 tools`)
  })

  ctx.logger?.info?.(`[${name}] loaded`)
}