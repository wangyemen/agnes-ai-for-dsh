/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Main entry point - exports all public APIs
 */

// Core plugin
export { createAgnesAIPlugin, default } from './index.js';
export type { AgnesAIPluginConfig } from './index.js';

// Types
export type {
  AgnesModel,
  TextModel,
  ImageModel,
  VideoModel,
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
  AgnesChatRequest,
  AgnesChatResponse,
  AgnesModelPricing,
} from './types.js';

// Client/GUI exports
export { agnesAISettingsPlugin } from './client/index.js';
export type { AgnesModelInfo, AgnesProviderConfig } from './client/index.js';
