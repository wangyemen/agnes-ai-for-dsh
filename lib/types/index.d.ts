/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Main entry point - exports all tools and configuration
 */

export { createAgnesAIPlugin, default } from './index.js';
export type { AgnesAIPluginConfig, AgnesAIModelConfig } from './index.js';

// Tool exports
export { agnesImageTool } from './tools/image.js';
export { agnesVideoTool } from './tools/video.js';
export type {
  AgnesImageToolConfig,
  AgnesImageGenerationOptions,
  AgnesImageGenerationResult,
  AgnesVideoToolConfig,
  AgnesVideoGenerationOptions,
  AgnesVideoTask,
  AgnesVideoResult,
} from './tools/index.js';

// Type exports
export type {
  AgnesModel,
  AgnesEndpoint,
  ImageSize,
  ImageRatio,
  VideoMode,
  VideoResolution,
  VideoRatio,
  AgnesImageRequest,
  AgnesImageResponse,
  AgnesVideoRequest,
  AgnesVideoTaskResponse,
  AgnesVideoResultResponse,
  AgnesChatRequest,
  AgnesChatResponse,
} from './types.js';
