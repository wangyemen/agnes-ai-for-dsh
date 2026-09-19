/**
 * Agnes AI Tools Plugin for DeepSeek Harness
 * 
 * This plugin adds tools for image and video generation to the DSH agent.
 */

import { agnesImageTool } from './tools/image.js'
import { agnesVideoTool } from './tools/video.js'

export const name = 'agnes-ai-tools'

export const tools = [
  agnesImageTool,
  agnesVideoTool,
]

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)
  
  // Register tools
  for (const tool of tools) {
    ctx.tools?.register?.(tool)
  }
  
  ctx.logger?.info?.(`[${name}] registered ${tools.length} tools`)
}