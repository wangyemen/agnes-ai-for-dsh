/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Integrates Agnes AI's text, image, and video generation capabilities
 * into the DeepSeek Harness platform.
 *
 * LLM provider configuration is handled by cordis.patch.yml.
 * This entry point registers the settings panel loader entry.
 */

import type { Context } from '@deepseek-ai/cordis'

export const name = 'agnes-ai-for-dsh'

export const inject = ['settings', 'credentials'] as const

export function apply(ctx: Context): void {
  ctx.logger?.info?.(`[${name}] plugin loaded`)
}
