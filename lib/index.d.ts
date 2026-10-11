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
/**
 * Build a tool result containing only defined values.
 *
 * A tool's return value must be lossless JSON. An `undefined` property is NOT
 * lossless: the registry snapshots the value with `snapshotJsonValue`, which
 * rejects the whole object, and the call fails with
 * `tool "<name>" returned invalid output: value is not lossless JSON`.
 *
 * That makes the natural spelling `return { url: result.url, base64: result.base64 }`
 * a bug whenever either field is absent — which is the normal case, since a
 * result is a URL or base64 data, never both.
 *
 * Every tool result therefore goes through this helper, so no future edit can
 * reintroduce an `undefined` by spreading optional fields into a literal.
 *
 * Exported so `verify-output.mjs` can test it directly.
 */
export declare function toolResult<T extends Record<string, unknown>>(fields: T): Record<string, unknown>;
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