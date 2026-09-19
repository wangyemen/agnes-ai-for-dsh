/**
 * Agnes AI Settings Panel for DSH Web GUI
 * 
 * Provides a settings panel for configuring Agnes AI models,
 * with paid model confirmation dialogs.
 */

import { defineClientPlugin } from '@deepseek-ai/cordis';

// ============================================================================
// Model Configuration
// ============================================================================

/** Free text models - available without confirmation */
const FREE_TEXT_MODELS = [
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
const PAID_TEXT_MODELS = [
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

/** Free image models */
const FREE_IMAGE_MODELS = [
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
const FREE_VIDEO_MODELS = [
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
const PAID_VIDEO_MODELS = [
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
// Plugin Definition
// ============================================================================

export const agnesAISettingsPlugin = defineClientPlugin({
  id: 'agnes-ai-settings',
  name: 'agnes-ai-for-dsh',
  
  /**
   * Register the Agnes AI provider configuration
   * This will be picked up by the dsh-llm-pi-ai adapter
   */
  setup(ctx) {
    // Provider configuration for pi-ai adapter
    const providerConfig = {
      displayName: 'Agnes AI',
      api: 'openai-completions' as const,
      baseURL: ctx.config?.baseURL || 'https://api.agnes-ai.cn/v1',
      models: [
        ...FREE_TEXT_MODELS,
        ...PAID_TEXT_MODELS,
      ],
    };

    // Expose models through the LLM service
    ctx.llm?.registerProvider('agnes', providerConfig);
    
    // Return cleanup function
    return () => {
      ctx.llm?.unregisterProvider('agnes');
    };
  },
});

// ============================================================================
// Exported Types
// ============================================================================

export interface AgnesModelInfo {
  id: string;
  name: string;
  description: string;
  isFree: boolean;
  category: 'text' | 'image' | 'video';
  contextWindow?: number;
  maxTokens?: number;
  supportsImage?: boolean;
  pricing?: Record<string, string>;
}

export interface AgnesProviderConfig {
  displayName: string;
  api: 'openai-completions';
  baseURL: string;
  models: AgnesModelInfo[];
}
