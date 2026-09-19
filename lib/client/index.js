/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides GUI settings panel for configuring Agnes AI.
 */
export const name = 'agnes-ai-for-dsh-client';
// Model definitions
export const FREE_TEXT_MODELS = [
    { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash', image: true },
    { id: 'agnes-3.0-flash', name: 'Agnes 3.0 Flash', image: true },
];
export const PAID_TEXT_MODELS = [
    { id: 'agnes-2.5-pro', name: 'Agnes 2.5 Pro', image: true },
];
export const IMAGE_MODELS = [
    { id: 'agnes-image-2.5-flash', name: 'Agnes Image 2.5 Flash' },
];
export const VIDEO_MODELS = [
    { id: 'agnes-video-25-flash', name: 'Agnes Video 2.5 Flash' },
];
export function apply(ctx) {
    ctx.logger?.info?.(`[${name}] loading`);
    // Log setup instructions
    ctx.logger?.info?.(`[${name}] To configure:`);
    ctx.logger?.info?.(`[${name}] 1. Settings → Models → Add Provider`);
    ctx.logger?.info?.(`[${name}] 2. Provider ID: agnes-ai`);
    ctx.logger?.info?.(`[${name}] 3. Base URL: https://api.agnes-ai.cn/v1`);
    ctx.logger?.info?.(`[${name}] loaded`);
}
//# sourceMappingURL=index.js.map