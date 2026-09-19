/**
 * Agnes AI Plugin for DeepSeek Harness
 * 
 * Host-side plugin that registers Agnes AI settings.
 */

export const name = 'agnes-ai-for-dsh'

export function apply(ctx: any): void {
  ctx.logger?.info?.(`[${name}] loading`)
  
  // Settings namespace will be registered by the client plugin
  // This host plugin just provides the configuration patch
  
  ctx.logger?.info?.(`[${name}] loaded`)
}