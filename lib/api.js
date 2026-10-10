/**
 * Agnes AI API clients.
 *
 * These are plain async functions with no host dependency, so they can be
 * unit-tested and reused. Contracts follow ../API/*.md exactly.
 */
import { AGNES_IMAGE_SIZES, AGNES_RATIOS, AGNES_VIDEO_FLASH_SIZE, AGNES_VIDEO_MODES, AGNES_VIDEO_SIZES, getAgnesOrigin, } from './types.js';
// ============================================================================
// Shared helpers
// ============================================================================
/** Extract a human-readable message from an Agnes error payload. */
function errorMessageFrom(body, status) {
    try {
        const json = JSON.parse(body);
        return json.error?.message ?? json.message ?? `HTTP ${status}`;
    }
    catch {
        return body.trim().length > 0 ? body.trim().slice(0, 500) : `HTTP ${status}`;
    }
}
/** POST JSON and return the parsed body, or a human-readable error string. */
async function postJson(url, config, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            return { ok: false, error: errorMessageFrom(await response.text(), response.status) };
        }
        return { ok: true, data: (await response.json()) };
    }
    catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
}
/**
 * Generate or edit an image.
 *
 * Two documented rules are load-bearing:
 *  - `response_format` must live inside `extra_body`; at the top level it is
 *    explicitly rejected.
 *  - text-to-image uses top-level `return_base64`; image-to-image uses
 *    `extra_body.response_format: "b64_json"`.
 */
export async function generateImage(options, config) {
    const { model, prompt, size, ratio, image, returnBase64 } = options;
    const hasInputImages = Array.isArray(image) && image.length > 0;
    const body = { model, prompt, size };
    if (ratio)
        body.ratio = ratio;
    const extraBody = {};
    if (hasInputImages)
        extraBody.image = image;
    if (returnBase64) {
        if (hasInputImages)
            extraBody.response_format = 'b64_json';
        else
            body.return_base64 = true;
    }
    else {
        extraBody.response_format = 'url';
    }
    if (Object.keys(extraBody).length > 0)
        body.extra_body = extraBody;
    const outcome = await postJson(`${config.baseURL}/images/generations`, config, body);
    if (!outcome.ok)
        return { error: outcome.error };
    const first = outcome.data.data?.[0];
    if (!first)
        return { error: 'Agnes API returned no image data.' };
    const result = {};
    if (first.url)
        result.url = first.url;
    if (first.b64_json)
        result.base64 = first.b64_json;
    if (first.revised_prompt)
        result.revisedPrompt = first.revised_prompt;
    if (!result.url && !result.base64)
        return { error: 'Agnes API returned neither a URL nor base64 data.' };
    return result;
}
/** Infer the mode when the caller did not state one. */
function resolveMode(options) {
    if (options.mode && AGNES_VIDEO_MODES.includes(options.mode)) {
        return options.mode;
    }
    if (options.firstFrame || options.lastFrame)
        return 'keyframe';
    if (options.images?.length || options.audios?.length)
        return 'reference';
    return 'text';
}
/**
 * Build the create-task body.
 *
 * Mode determines which media fields are legal, and the API rejects a request
 * that carries a field the mode forbids — so fields are emitted per mode
 * rather than "whenever present".
 */
function buildVideoBody(options, mode) {
    const body = {
        model: options.model,
        prompt: options.prompt,
        mode,
        // Flash accepts only 720P; anything else is a documented HTTP 400.
        size: options.model === 'agnes-video-2.5-flash' ? AGNES_VIDEO_FLASH_SIZE : options.size ?? '720P',
    };
    if (options.seconds)
        body.seconds = options.seconds;
    if (options.aspectRatio)
        body.aspect_ratio = options.aspectRatio;
    if (mode === 'keyframe') {
        if (options.firstFrame)
            body.first_frame = options.firstFrame;
        if (options.lastFrame)
            body.last_frame = options.lastFrame;
    }
    else if (mode === 'reference') {
        if (options.images?.length)
            body.images = options.images;
        if (options.audios?.length)
            body.audios = options.audios;
    }
    return body;
}
/**
 * Create a video task and poll until it settles.
 *
 * Polling always sends `model_name`: the bare `video_id` form is documented as
 * valid only for `mode: "text"`, so including the model is the form that works
 * for every mode.
 */
export async function generateVideo(options, config) {
    const mode = resolveMode(options);
    const body = buildVideoBody(options, mode);
    const created = await postJson(`${config.baseURL}/videos`, config, body);
    if (!created.ok)
        return { error: `Video task creation failed: ${created.error}` };
    const videoId = created.data.video_id ?? created.data.id ?? created.data.task_id;
    if (!videoId)
        return { error: 'Agnes API returned no video_id for the created task.' };
    options.onProgress?.(5, 'queued');
    const origin = getAgnesOrigin(config.baseURL);
    const pollUrl = `${origin}/agnesapi?video_id=${encodeURIComponent(videoId)}` +
        `&model_name=${encodeURIComponent(options.model)}`;
    const interval = options.pollIntervalMs ?? 2000;
    const maxAttempts = options.maxAttempts ?? 90;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, interval));
        let payload;
        try {
            // The key travels in a header, never in the query string.
            const response = await fetch(pollUrl, {
                headers: { Authorization: `Bearer ${config.apiKey}` },
            });
            // Transient failures (429, 5xx, network) are retried, not reported.
            if (!response.ok)
                continue;
            payload = (await response.json());
        }
        catch {
            continue;
        }
        const status = payload.status;
        if (status === 'completed' || status === 'succeeded' || status === 'success') {
            const url = payload.url ?? payload.metadata?.url;
            if (!url)
                return { error: 'Video completed but the API returned no URL.', videoId };
            return { url, videoId };
        }
        if (status === 'failed' || status === 'error') {
            const raw = payload.error;
            const detail = (typeof raw === 'string' ? raw : raw?.message) ??
                payload.message ??
                'unknown error';
            return { error: `Video generation failed: ${detail}`, videoId };
        }
        const serverProgress = typeof payload.progress === 'number' ? payload.progress : null;
        if (serverProgress !== null) {
            options.onProgress?.(Math.max(5, Math.min(95, serverProgress)), status);
        }
        else {
            options.onProgress?.(Math.min(95, 5 + Math.floor(((attempt + 1) / maxAttempts) * 90)), status);
        }
    }
    return { error: 'Video generation timed out while polling.', videoId };
}
// ============================================================================
// Exported option enums (used by tool schemas and the client panel)
// ============================================================================
export const IMAGE_SIZE_CHOICES = [...AGNES_IMAGE_SIZES];
export const RATIO_CHOICES = [...AGNES_RATIOS];
export const VIDEO_SIZE_CHOICES = [...AGNES_VIDEO_SIZES];
//# sourceMappingURL=api.js.map