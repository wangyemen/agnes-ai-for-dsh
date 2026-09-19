/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Integrates Agnes AI's text, image, and video generation capabilities
 * into the DeepSeek Harness platform.
 * 
 * Features:
 * - Text generation via agnes-2.5-flash, agnes-3.0-flash, agnes-2.5-pro, agnes-2.5-pro-beta
 * - Image generation via agnes-image-2.1-flash, agnes-image-2.5-flash
 * - Video generation via agnes-video-v2.0, agnes-video-25, agnes-video-25-flash
 * 
 * Pricing policy:
 * - Free models are selected by default
 * - Paid models require user confirmation before use
 */

import { createPlugin } from '@deepseek-ai/cordis';

// ============================================================================
// Model Categories
// ============================================================================

/**
 * Agnes AI text models - Free tier (default)
 */
export const AGNES_TEXT_FREE_MODELS = [
  {
    id: 'agnes-2.5-flash',
    name: 'Agnes 2.5 Flash',
    description: '免费·多模态对话·编码优化·智能体工作流',
    contextWindow: 524288,
    maxTokens: 65536,
    image: true,
    isFree: true,
  },
  {
    id: 'agnes-3.0-flash',
    name: 'Agnes 3.0 Flash',
    description: '免费·新一代Agent编程模型·工具调用强化',
    contextWindow: 524288,
    maxTokens: 65536,
    image: true,
    isFree: true,
  },
] as const;

/**
 * Agnes AI text models - Paid tier (requires confirmation)
 */
export const AGNES_TEXT_PAID_MODELS = [
  {
    id: 'agnes-2.5-pro',
    name: 'Agnes 2.5 Pro',
    description: '付费·高级推理·科学计算·长上下文分析',
    contextWindow: 524288,
    maxTokens: 65536,
    image: true,
    isFree: false,
    pricing: 'paid' as const,
  },
  {
    id: 'agnes-2.5-pro-beta',
    name: 'Agnes 2.5 Pro Beta',
    description: '付费·打榜模型·Artificial Analysis评测',
    contextWindow: 524288,
    maxTokens: 65536,
    image: true,
    isFree: false,
    pricing: 'paid' as const,
  },
] as const;

/**
 * Agnes AI image generation models - Free tier
 */
export const AGNES_IMAGE_FREE_MODELS = [
  {
    id: 'agnes-image-2.1-flash',
    name: 'Agnes Image 2.1 Flash',
    description: '免费·文生图·图生图·多图合成·高信息密度优化',
    isFree: true,
  },
  {
    id: 'agnes-image-2.5-flash',
    name: 'Agnes Image 2.5 Flash',
    description: '免费·最新一代图像模型·全面超越2.1版本',
    isFree: true,
  },
] as const;

/**
 * Agnes AI video generation models
 */
export const AGNES_VIDEO_FREE_MODELS = [
  {
    id: 'agnes-video-v2.0',
    name: 'Agnes Video V2.0',
    description: '免费·文生视频·图生视频·关键帧动画',
    isFree: true,
  },
  {
    id: 'agnes-video-25-flash',
    name: 'Agnes Video 2.5 Flash',
    description: '免费·异步任务API·720P专享',
    isFree: true,
  },
] as const;

export const AGNES_VIDEO_PAID_MODELS = [
  {
    id: 'agnes-video-25',
    name: 'Agnes Video 2.5',
    description: '付费·多分辨率·首尾帧控制·多模态参考',
    isFree: false,
    pricing: 'paid' as const,
  },
] as const;

// ============================================================================
// Configuration Interface
// ============================================================================

export interface AgnesAIPluginConfig {
  /** API key environment variable name (default: AGNES_API_KEY) */
  apiKeyEnv?: string;
  /** Base URL for China API (default: https://api.agnes-ai.cn/v1) */
  chinaBaseURL?: string;
  /** Base URL for Global API (default: https://apihub.agnes-ai.com/v1) */
  globalBaseURL?: string;
  /** Which endpoint to use by default */
  defaultEndpoint?: 'china' | 'global';
  /** Whether to require confirmation for paid models */
  requirePaidConfirmation?: boolean;
}

// ============================================================================
// Plugin Creation
// ============================================================================

/**
 * Create the Agnes AI plugin for DSH
 */
export function createAgnesAIPlugin(config: AgnesAIPluginConfig = {}) {
  const {
    apiKeyEnv = 'AGNES_API_KEY',
    chinaBaseURL = 'https://api.agnes-ai.cn/v1',
    globalBaseURL = 'https://apihub.agnes-ai.com/v1',
    defaultEndpoint = 'china',
    requirePaidConfirmation = true,
  } = config;

  const baseURL = defaultEndpoint === 'global' ? globalBaseURL : chinaBaseURL;

  return createPlugin({
    id: 'agnes-ai',
    name: 'agnes-ai-for-dsh',
    config: {
      apiKeyEnv,
      baseURL,
      requirePaidConfirmation,
    },
  });
}

/**
 * Default export - creates the plugin with sensible defaults
 */
export default createAgnesAIPlugin;
