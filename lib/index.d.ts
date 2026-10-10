/**
 * Agnes AI plugin — host half.
 *
 * Responsibilities:
 *  1. Register the agnes_image_generation / agnes_video_generation tools.
 *  2. Persist generation records so the settings panel can list them.
 *
 * Design notes:
 *  - Every tool schema is native JSON Schema (see `tools.ts`). The schemas are
 *    validated at load; an invalid one would make the provider reject every
 *    request in the session, so it fails loudly here instead.
 *  - `@deepseek-ai/dsh-tools` is a host-provided package with many optional
 *    peers, so it is imported dynamically. Its `defineTool` is preferred when
 *    reachable, purely for its argument validation and result rendering; the
 *    schemas are correct without it.
 */
import type { Context } from '@deepseek-ai/cordis';
import { type AgnesRegion } from './types.js';
export declare const name = "agnes-ai-for-dsh";
/** Settings namespace holding the generation history. */
export declare const AGNES_RECORDS_NS = "agnes-generations";
export interface GenerationRecord {
    id: string;
    type: 'image' | 'video';
    prompt: string;
    model: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    url?: string;
    size?: string;
    ratio?: string;
    seconds?: string;
    error?: string;
    progress?: number;
    createdAt: number;
    completedAt?: number;
    source?: string;
}
export declare function apply(ctx: Context): void;
export { AGNES_IMAGE_TOOL, AGNES_VIDEO_TOOL, AGNES_RECORD_TOOL, AGNES_TOOLS, assertAllToolSchemas, assertValidCompiledSchema, compileParameters, } from './tools.js';
export * from './types.js';
export { generateImage, generateVideo } from './api.js';
/** Provider route this plugin configures. */
export declare const providerId = "agnes-ai";
/** Region helper kept for symmetry with the client half. */
export declare function baseUrlFor(region: AgnesRegion): string;
/** Whether the host `defineTool` helper was reachable. */
export declare function hasHostDefineTool(): boolean;
//# sourceMappingURL=index.d.ts.map