/**
 * Agnes AI Types - Complete model catalog and API types
 */

// ============================================================================
// Model Categories
// ============================================================================

/** Text models that are free to use */
export const TEXT_FREE_MODELS = ['agnes-2.5-flash', 'agnes-3.0-flash'] as const;
export type TextFreeModel = typeof TEXT_FREE_MODELS[number];

/** Text models that require payment */
export const TEXT_PAID_MODELS = ['agnes-2.5-pro', 'agnes-2.5-pro-beta'] as const;
export type TextPaidModel = typeof TEXT_PAID_MODELS[number];

/** All text models */
export const TEXT_MODELS = [...TEXT_FREE_MODELS, ...TEXT_PAID_MODELS] as const;
export type TextModel = typeof TEXT_MODELS[number];

/** Image generation models (all free) */
export const IMAGE_MODELS = ['agnes-image-2.1-flash', 'agnes-image-2.5-flash'] as const;
export type ImageModel = typeof IMAGE_MODELS[number];

/** Video generation models */
export const VIDEO_FREE_MODELS = ['agnes-video-v2.0', 'agnes-video-25-flash'] as const;
export type VideoFreeModel = typeof VIDEO_FREE_MODELS[number];

export const VIDEO_PAID_MODELS = ['agnes-video-25'] as const;
export type VideoPaidModel = typeof VIDEO_PAID_MODELS[number];

export const VIDEO_MODELS = [...VIDEO_FREE_MODELS, ...VIDEO_PAID_MODELS] as const;
export type VideoModel = typeof VIDEO_MODELS[number];

/** All Agnes AI models */
export const AGNES_MODELS = [...TEXT_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS] as const;
export type AgnesModel = typeof AGNES_MODELS[number];

// ============================================================================
// API Endpoints
// ============================================================================

export const AGNES_ENDPOINTS = {
  CHINA: 'https://api.agnes-ai.cn/v1',
  GLOBAL: 'https://apihub.agnes-ai.com/v1',
} as const;

export type AgnesEndpoint = typeof AGNES_ENDPOINTS[keyof typeof AGNES_ENDPOINTS];

// ============================================================================
// Image Generation Types
// ============================================================================

export const IMAGE_SIZES = ['1K', '2K', '3K', '4K'] as const;
export type ImageSize = typeof IMAGE_SIZES[number];

export const IMAGE_RATIOS = ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'] as const;
export type ImageRatio = typeof IMAGE_RATIOS[number];

export interface AgnesImageRequest {
  model: ImageModel;
  prompt: string;
  size: ImageSize;
  ratio?: ImageRatio;
  image?: string[];
  return_base64?: boolean;
  extra_body?: {
    response_format?: 'url' | 'b64_json';
    image?: string[];
  };
}

export interface AgnesImageResponse {
  created: number;
  data: Array<{
    url: string | null;
    b64_json: string | null;
    revised_prompt: string | null;
  }>;
}

// ============================================================================
// Video Generation Types
// ============================================================================

export const VIDEO_MODES = ['ti2vid', 'keyframes', 'text', 'reference'] as const;
export type VideoMode = typeof VIDEO_MODES[number];

export const VIDEO_RESOLUTIONS = ['480p', '720p', '1080p', '1K', '2K'] as const;
export type VideoResolution = typeof VIDEO_RESOLUTIONS[number];

export const VIDEO_RATIOS = ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'] as const;
export type VideoRatio = typeof VIDEO_RATIOS[number];

export interface AgnesVideoRequest {
  model: VideoModel;
  prompt: string;
  seconds?: string;
  mode?: VideoMode;
  size?: VideoResolution;
  aspect_ratio?: VideoRatio;
  image?: string;
  num_frames?: number;
  frame_rate?: number;
  seed?: number;
  negative_prompt?: string;
  extra_body?: {
    image?: string[];
    mode?: VideoMode;
    videos?: string[];
    audios?: string[];
  };
}

export interface AgnesVideoTaskResponse {
  id: string;
  task_id: string;
  video_id: string;
  object: string;
  model: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  created_at: number;
  completed_at?: number;
  seconds: string;
  size: string;
  metadata?: {
    size_mapping?: {
      adjusted: boolean;
      height: number;
      width: number;
      ratio: VideoRatio;
      resolution: VideoResolution;
      requested_height?: number;
      requested_width?: number;
      message?: string;
    };
    url: string;
  };
  error?: null | object;
}

// ============================================================================
// Chat/Text Types (OpenAI-compatible)
// ============================================================================

export interface AgnesChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: { url: string };
  }>;
}

export interface AgnesChatRequest {
  model: TextModel;
  messages: AgnesChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<object>;
  tool_choice?: string | object;
  chat_template_kwargs?: {
    enable_thinking?: boolean;
  };
  thinking?: {
    type: 'enabled';
    budget_tokens?: number;
  };
}

export interface AgnesChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================================
// Pricing Information
// ============================================================================

export interface AgnesModelPricing {
  /** Model ID */
  id: string;
  /** Display name */
  name: string;
  /** Whether this model is free */
  isFree: boolean;
  /** Category: 'text' | 'image' | 'video' */
  category: 'text' | 'image' | 'video';
  /** Description in Chinese */
  description: string;
  /** Context window size in tokens (text models only) */
  contextWindow?: number;
  /** Maximum output tokens (text models only) */
  maxTokens?: number;
  /** Supports image input (text models only) */
  supportsImageInput?: boolean;
  /** Pricing info for paid models */
  pricing?: {
    inputCacheHit?: string;
    input?: string;
    output?: string;
    perSecond?: string;
    perImage?: string;
    perFrame?: string;
  };
}

/** Complete pricing catalog */
export const AGNES_MODEL_PRICING: AgnesModelPricing[] = [
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
    id: 'agnes-video-v2.0',
    name: 'Agnes Video V2.0',
    isFree: true,
    category: 'video',
    description: '免费·文生视频·图生视频·关键帧动画',
  },
  {
    id: 'agnes-video-25-flash',
    name: 'Agnes Video 2.5 Flash',
    isFree: true,
    category: 'video',
    description: '免费·异步任务API·720P专享',
  },
  // Video Models - Paid
  {
    id: 'agnes-video-25',
    name: 'Agnes Video 2.5',
    isFree: false,
    category: 'video',
    description: '付费·多分辨率·首尾帧控制·多模态参考',
    pricing: {
      '720P': '¥0.15/秒',
      '1080P': '¥0.25/秒',
      '1K': '¥0.35/秒',
      '2K': '¥0.35/秒',
    },
  },
];
