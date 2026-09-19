/**
 * Agnes AI client exports for DSH
 *
 * Re-exports model information for use by the settings panel.
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
] as const;

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
export const ALL_TEXT_MODELS = [...FREE_TEXT_MODELS, ...PAID_TEXT_MODELS] as const;

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
] as const;

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
] as const;

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
// Types
// ============================================================================

export interface AgnesModelInfo {
  id: string;
  name: string;
  description: string;
  isFree?: boolean;
  category?: 'text' | 'image' | 'video';
  contextWindow?: number;
  maxTokens?: number;
  supportsImage?: boolean;
  pricing?: Record<string, string>;
}

export interface AgnesProviderConfig {
  displayName: string;
  baseURL: string;
  models: AgnesModelInfo[];
}
