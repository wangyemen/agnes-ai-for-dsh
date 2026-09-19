/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider configuration
 * 2. Registers image/video generation tools
 * 3. AUTO-detects Agnes URLs in ANY tool output and records them
 * 4. Persists generation records via a settings namespace
 * 5. Provides model catalog and API constants
 */
import z from '@deepseek-ai/schemastery';
import { defineTool } from '@deepseek-ai/dsh-tools';
export const name = 'agnes-ai-for-dsh';
export const AGNES_TEXT_MODELS = [
    {
        id: 'agnes-2.5-flash',
        name: 'Agnes 2.5 Flash',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '免费·多模态对话·编码优化',
        pricing: 'free',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-3.0-flash',
        name: 'Agnes 3.0 Flash',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '免费·新一代Agent编程模型',
        pricing: 'free',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-2.5-pro',
        name: 'Agnes 2.5 Pro',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '付费·高级推理·科学计算',
        pricing: 'paid',
        systemPromptUpdate: 'in-history',
    },
    {
        id: 'agnes-2.5-pro-beta',
        name: 'Agnes 2.5 Pro Beta',
        contextWindow: 524288,
        defaultMaxTokens: 65536,
        image: true,
        description: '付费·打榜模型',
        pricing: 'paid',
        systemPromptUpdate: 'in-history',
    },
];
export const AGNES_IMAGE_MODELS = [
    {
        id: 'agnes-image-2.1-flash',
        name: 'Agnes Image 2.1 Flash',
        image: true,
        description: '免费·文生图·图生图·多图合成',
        pricing: 'free',
    },
    {
        id: 'agnes-image-2.5-flash',
        name: 'Agnes Image 2.5 Flash',
        image: true,
        description: '免费·最新一代图像模型',
        pricing: 'free',
    },
];
export const AGNES_VIDEO_MODELS = [
    {
        id: 'agnes-video-v2.0',
        name: 'Agnes Video V2.0',
        image: false,
        description: '免费·文生视频·图生视频·关键帧动画',
        pricing: 'free',
    },
    {
        id: 'agnes-video-25-flash',
        name: 'Agnes Video 2.5 Flash',
        image: false,
        description: '免费·异步任务API·720P专享',
        pricing: 'free',
    },
    {
        id: 'agnes-video-25',
        name: 'Agnes Video 2.5',
        image: false,
        description: '付费·多分辨率·首尾帧控制',
        pricing: 'paid',
    },
];
export const AGNES_ALL_MODELS = [
    ...AGNES_TEXT_MODELS,
    ...AGNES_IMAGE_MODELS,
    ...AGNES_VIDEO_MODELS,
];
// ============================================================================
// Provider Configuration
// ============================================================================
export const AGNES_PROVIDER_ID = 'agnes-ai';
export const AGNES_API_KEY_ENV = 'AGNES_AI_API_KEY';
export const AGNES_SETTINGS_NS = 'llm-pi-ai';
export const AGNES_SETTINGS_PATH = ['providers', 'agnes-ai'];
/** China region API endpoint */
export const AGNES_BASE_URL_CN = 'https://api.agnes-ai.cn/v1';
/** Global/International region API endpoint */
export const AGNES_BASE_URL_GLOBAL = 'https://apihub.agnes-ai.com/v1';
/** Available regions for Agnes AI */
export const AGNES_REGIONS = {
    CN: 'cn',
    GLOBAL: 'global',
};
/** Get base URL based on region */
export function getAgnesBaseUrl(region = 'cn') {
    return region === 'global' ? AGNES_BASE_URL_GLOBAL : AGNES_BASE_URL_CN;
}
export const AGNES_PROVIDER_CONFIG = {
    displayName: 'Agnes AI',
    apiKeyEnv: AGNES_API_KEY_ENV,
    api: 'openai-completions',
    baseURL: AGNES_BASE_URL_CN,
    models: AGNES_TEXT_MODELS,
};
/** Settings namespace that stores the record list as a JSON string. */
export const AGNES_RECORDS_NS = 'agnes-generations';
const MAX_RECORDS = 500;
const RecordsSchema = z.object({
    data: z.string().default('[]'),
});
function makeRecordId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
// ============================================================================
// URL Detection helpers (用于 auto-detect pwsh/curl 输出中的 Agnes URL)
// ============================================================================
/** Agnes 输出 CDN 域名（图片）。 */
const AGNES_IMAGE_URL_PATTERN = 'https?://cos-platform-outputs\\.agnes-ai\\.cn/[^\\s"\'<>)\\]，。！？；：、]+\\.(?:png|jpg|jpeg|webp|gif)';
/** Agnes 输出 CDN 域名（视频）。 */
const AGNES_VIDEO_URL_PATTERN = 'https?://cos-platform-outputs\\.agnes-ai\\.cn/[^\\s"\'<>)\\]，。！？；：、]+\\.(?:mp4|webm|mov)';
function findAllUrls(text, pattern) {
    if (!text)
        return [];
    try {
        const re = new RegExp(pattern, 'gi');
        const out = new Set();
        let m;
        while ((m = re.exec(text)) !== null) {
            out.add(m[0]);
        }
        return [...out];
    }
    catch {
        return [];
    }
}
function findAgnesImageUrls(text) {
    return findAllUrls(text, AGNES_IMAGE_URL_PATTERN);
}
function findAgnesVideoUrls(text) {
    return findAllUrls(text, AGNES_VIDEO_URL_PATTERN);
}
/** 把任意值安全地序列化为字符串。 */
function stringifyArgs(args) {
    try {
        if (args === undefined || args === null)
            return '';
        if (typeof args === 'string')
            return args;
        return JSON.stringify(args);
    }
    catch {
        return '';
    }
}
/** 从工具 result 里收集所有文本片段。 */
function collectTextFromResult(result) {
    if (!result)
        return '';
    const parts = [];
    const content = result?.content;
    if (Array.isArray(content)) {
        for (const block of content) {
            if (typeof block === 'string')
                parts.push(block);
            else if (block && typeof block.text === 'string')
                parts.push(block.text);
        }
    }
    else if (typeof content === 'string') {
        parts.push(content);
    }
    if (typeof result?.text === 'string')
        parts.push(result.text);
    // 兜底：直接序列化 result
    if (parts.length === 0)
        parts.push(stringifyArgs(result));
    return parts.join('\n');
}
/**
 * 从 args/result 文本里尽量还原 prompt 与 model。
 * pwsh 里执行 curl 时，命令行和返回值里通常包含 `"model":"..."` 和 `"prompt":"..."`。
 */
function extractPromptAndModel(argsText, resultText) {
    const combined = `${argsText}\n${resultText}`;
    let model = '';
    const mModel = combined.match(/"model"\s*:\s*"([^"]+)"/);
    if (mModel)
        model = mModel[1];
    if (!model) {
        const mModel2 = combined.match(/(agnes-(?:image|video)[\w.-]*)/i);
        if (mModel2)
            model = mModel2[1];
    }
    let prompt = '';
    const mPrompt = combined.match(/"prompt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (mPrompt) {
        try {
            prompt = JSON.parse(`"${mPrompt[1]}"`);
        }
        catch {
            prompt = mPrompt[1];
        }
    }
    return { prompt, model };
}
// ============================================================================
// Tool Definitions
// ============================================================================
export const AGNES_IMAGE_GENERATION_TOOL = {
    name: 'agnes_image_generation',
    description: [
        'Generate an image via the Agnes AI image API and return its URL.',
        '',
        'USE THIS TOOL whenever the user asks to create, draw, render, illustrate, or edit an image.',
        'DO NOT write pwsh/bash/curl commands that call the Agnes API yourself — this tool already',
        'handles the request, records the result in the UI, and surfaces errors properly.',
        '',
        'Args:',
        '- model (required): "agnes-image-2.5-flash" (newest, default) or "agnes-image-2.1-flash"',
        '- prompt (required): text description of the image',
        '- size (required): "1K" | "2K" | "3K" | "4K"',
        '- ratio (optional): "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "2:3" | "3:2" | "21:9"',
        '- image (optional): input image URL for image-to-image',
        '- return_base64 (optional): return a data URI instead of a URL',
        '',
        'Returns: { url } on success, or { error } on failure.',
    ].join('\n'),
    parameters: {
        model: {
            type: 'string',
            required: true,
            enum: AGNES_IMAGE_MODELS.map((m) => m.id),
            description: 'Image generation model to use',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'Text description of the image to generate',
        },
        size: {
            type: 'string',
            required: true,
            enum: ['1K', '2K', '3K', '4K'],
            description: 'Output image size',
        },
        ratio: {
            type: 'string',
            enum: ['1:1', '3:4', '4:3', '16:9', '9:16', '2:3', '3:2', '21:9'],
            description: 'Aspect ratio',
        },
        image: {
            type: 'string',
            description: 'Input image URL for image-to-image generation',
        },
        return_base64: {
            type: 'boolean',
            description: 'Return base64 encoded image instead of URL',
        },
    },
};
export const AGNES_VIDEO_GENERATION_TOOL = {
    name: 'agnes_video_generation',
    description: [
        'Generate a video via the Agnes AI video API and return its URL after async polling.',
        '',
        'USE THIS TOOL whenever the user asks to create, render, or animate a video.',
        'DO NOT write pwsh/bash/curl commands that call the Agnes API yourself — this tool already',
        'handles creation, polling, and result recording.',
        '',
        'Args:',
        '- model (required): "agnes-video-25-flash" (default) or others',
        '- prompt (required): text description of the video',
        '- seconds (optional): duration in seconds, default "5"',
        '- size (optional): "480P" | "720P" | "1080P" | "1K" | "2K"',
        '- aspect_ratio (optional): "16:9" | "9:16" | "1:1" | "4:3" | "3:4" | "21:9"',
        '- image (optional): input image URL for image-to-video',
        '',
        'Returns: { url } on success, or { error } on failure.',
    ].join('\n'),
    parameters: {
        model: {
            type: 'string',
            required: true,
            enum: AGNES_VIDEO_MODELS.map((m) => m.id),
            description: 'Video generation model to use',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'Text description of the video to generate',
        },
        seconds: {
            type: 'string',
            description: 'Video duration in seconds (default 5)',
        },
        size: {
            type: 'string',
            enum: ['480P', '720P', '1080P', '1K', '2K'],
            description: 'Video resolution',
        },
        aspect_ratio: {
            type: 'string',
            enum: ['16:9', '9:16', '1:1', '4:3', '3:4', '21:9'],
            description: 'Video aspect ratio',
        },
        image: {
            type: 'string',
            description: 'Input image URL for image-to-video generation',
        },
    },
};
/**
 * 记录登记工具（保留，作为模型愿意主动配合时的补充路径）。
 * 现在真正的 auto-detect 走 `tools/execute` hook，本工具主要用于：
 * - 模型明确希望登记一个已经不在当前 tool result 里的历史结果；
 * - 或者给想主动配合的模型一个显式入口。
 */
export const AGNES_RECORD_GENERATION_TOOL = {
    name: 'agnes_record_generation',
    description: [
        'Record one completed Agnes AI generation (image or video) into the user-facing history.',
        '',
        'WHEN TO CALL:',
        '- Immediately after ANY image or video was produced via the Agnes AI API,',
        '  regardless of HOW you produced it.',
        '- Call it once per generated item.',
        '',
        'WHAT IT DOES:',
        '- Does NOT generate anything and does NOT call the Agnes API.',
        '- Only stores metadata { type, prompt, model, url, size?, ratio?, seconds? } so the user',
        '  can browse past results in the Agnes AI settings panel.',
        '',
        'Args:',
        '- type (required): "image" | "video"',
        '- prompt (required): the text prompt used for the generation',
        '- model (required): the model ID, e.g. "agnes-image-2.5-flash"',
        '- url (required): the result URL returned by the Agnes API',
        '- size (optional): e.g. "1K" / "2K" / "720P"',
        '- ratio (optional): e.g. "16:9" / "1:1"',
        '- seconds (optional): video duration, e.g. "5"',
        '',
        'Returns: { ok: true, id } on success, or { ok: false, error } on failure.',
    ].join('\n'),
    parameters: {
        type: {
            type: 'string',
            required: true,
            enum: ['image', 'video'],
            description: 'The kind of item being recorded',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'The prompt that was used to generate the item',
        },
        model: {
            type: 'string',
            required: true,
            description: 'The Agnes model ID that produced the item',
        },
        url: {
            type: 'string',
            required: true,
            description: 'The result URL returned by the Agnes API',
        },
        size: {
            type: 'string',
            description: 'Output size / resolution, e.g. "1K" or "720P"',
        },
        ratio: {
            type: 'string',
            description: 'Aspect ratio, e.g. "16:9"',
        },
        seconds: {
            type: 'string',
            description: 'Video duration in seconds, e.g. "5"',
        },
    },
};
export const AGNES_TOOLS = [
    AGNES_IMAGE_GENERATION_TOOL,
    AGNES_VIDEO_GENERATION_TOOL,
    AGNES_RECORD_GENERATION_TOOL,
];
// ============================================================================
// Shared output spec for tools
// ============================================================================
const IMAGE_VIDEO_OUTPUT_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        url: { type: 'string' },
        error: { type: 'string' },
    },
};
function renderImageVideoResult(_args, value) {
    if (value?.error)
        return [{ type: 'text', text: `Agnes error: ${value.error}` }];
    if (value?.url)
        return [{ type: 'text', text: `Result URL: ${value.url}` }];
    return [{ type: 'text', text: 'No result.' }];
}
const RECORD_OUTPUT_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    properties: {
        ok: { type: 'boolean' },
        id: { type: 'string' },
        error: { type: 'string' },
    },
};
function renderRecordResult(_args, value) {
    if (value?.ok)
        return [{ type: 'text', text: `Recorded as ${value.id}` }];
    if (value?.error)
        return [{ type: 'text', text: `Record failed: ${value.error}` }];
    return [{ type: 'text', text: 'No result.' }];
}
// ============================================================================
// API Key Resolution
// ============================================================================
async function resolveAgnesApiKey(ctx) {
    try {
        const credentials = ctx.get('credentials');
        if (!credentials)
            return null;
        const ref = AGNES_API_KEY_ENV;
        if (typeof credentials.resolve === 'function') {
            const result = await credentials.resolve([ref]);
            const v = result?.[ref] ?? result?.values?.[ref];
            if (typeof v === 'string')
                return v;
            if (v && typeof v === 'object' && typeof v.value === 'string')
                return v.value;
        }
        if (typeof credentials.get === 'function') {
            const result = await credentials.get(ref);
            if (typeof result === 'string')
                return result;
            if (result && typeof result.value === 'string')
                return result.value;
        }
        if (typeof credentials.describe === 'function') {
            const result = await credentials.describe([ref]);
            const v = result?.value?.[ref]?.value;
            if (typeof v === 'string')
                return v;
        }
        return null;
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('[agnes-ai-for-dsh] resolveAgnesApiKey failed:', err);
        return null;
    }
}
// ============================================================================
// Tool Implementations (HTTP calls)
// ============================================================================
async function executeImageGeneration(args, ctx) {
    const apiKey = await resolveAgnesApiKey(ctx);
    if (!apiKey) {
        return {
            error: `Agnes API key not configured. Please set ${AGNES_API_KEY_ENV} in Settings → Credentials.`,
        };
    }
    const body = {
        model: args.model || 'agnes-image-2.5-flash',
        prompt: args.prompt,
        size: args.size || '1K',
    };
    if (args.ratio)
        body.ratio = args.ratio;
    if (args.image)
        body.image = [args.image];
    if (args.return_base64)
        body.response_format = 'b64_json';
    try {
        const resp = await fetch(`${AGNES_BASE_URL_CN}/images/generations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            const text = await resp.text();
            return { error: `Agnes Image API error (${resp.status}): ${text}` };
        }
        const data = await resp.json();
        const item = data?.data?.[0] ?? data?.data ?? data;
        if (!item)
            return { error: 'Agnes API returned no image data.' };
        const url = item?.url;
        const b64 = item?.b64_json;
        if (url)
            return { url };
        if (b64)
            return { url: `data:image/png;base64,${b64}` };
        return { error: 'Agnes API returned no URL or b64_json.' };
    }
    catch (err) {
        return { error: `Network error: ${err.message || String(err)}` };
    }
}
async function executeVideoGeneration(args, ctx, onProgress) {
    const apiKey = await resolveAgnesApiKey(ctx);
    if (!apiKey) {
        return {
            error: `Agnes API key not configured. Please set ${AGNES_API_KEY_ENV} in Settings → Credentials.`,
        };
    }
    const modelName = args.model || 'agnes-video-25-flash';
    const body = {
        model: modelName,
        prompt: args.prompt,
        seconds: args.seconds || '5',
        size: args.size || '720P',
        aspect_ratio: args.aspect_ratio || '16:9',
        mode: args.image ? 'image' : 'text',
    };
    if (args.image)
        body.image = args.image;
    let videoId = null;
    try {
        const resp = await fetch(`${AGNES_BASE_URL_CN}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!resp.ok) {
            const text = await resp.text();
            return { error: `Agnes Video create error (${resp.status}): ${text}` };
        }
        const data = await resp.json();
        videoId = data?.video_id ?? data?.id ?? data?.data?.video_id ?? null;
        if (!videoId)
            return { error: 'Agnes API did not return a video_id.' };
        await onProgress?.(10, 'processing');
    }
    catch (err) {
        return { error: `Network error during video create: ${err.message || String(err)}` };
    }
    const maxAttempts = 90;
    const pollIntervalMs = 2000;
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
        const progress = Math.min(95, 10 + Math.floor(((i + 1) / maxAttempts) * 85));
        try {
            const resp = await fetch(`https://api.agnes-ai.cn/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=${encodeURIComponent(modelName)}`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
            if (!resp.ok)
                continue;
            const data = await resp.json();
            const status = data?.status;
            if (status === 'completed' || status === 'succeeded' || status === 'success') {
                const url = data?.metadata?.url ?? data?.url ?? data?.video_url;
                if (!url)
                    return { error: 'Video completed but no URL returned.' };
                return { url };
            }
            if (status === 'failed' || status === 'error') {
                return { error: `Video generation failed: ${data?.error || data?.message || 'unknown'}` };
            }
            await onProgress?.(progress, 'processing');
        }
        catch {
            // 网络抖动，继续下一次轮询
        }
    }
    return { error: 'Video generation timed out after ~3 minutes.' };
}
// ============================================================================
// Plugin Entry Point
// ============================================================================
export function apply(ctx) {
    // eslint-disable-next-line no-console
    console.error('[agnes-ai-for-dsh] apply() invoked');
    ctx.inject(['tools', 'settings'], (sctx) => {
        // eslint-disable-next-line no-console
        console.error('[agnes-ai-for-dsh] inject callback fired');
        // ---- 注册 records settings namespace ----
        let recordsScope = null;
        try {
            recordsScope = sctx.settings.register(AGNES_RECORDS_NS, RecordsSchema);
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] register OK');
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] register FAILED:', err);
        }
        function loadRecords() {
            if (!recordsScope)
                return [];
            try {
                const value = recordsScope.get();
                if (!value || typeof value.data !== 'string')
                    return [];
                const arr = JSON.parse(value.data || '[]');
                return Array.isArray(arr) ? arr : [];
            }
            catch {
                return [];
            }
        }
        async function saveRecords(records) {
            if (!recordsScope)
                return;
            try {
                await recordsScope.update({ data: JSON.stringify(records) });
            }
            catch (err) {
                // eslint-disable-next-line no-console
                console.error('[agnes-ai-for-dsh] saveRecords failed:', err);
            }
        }
        async function addRecord(record) {
            const all = loadRecords();
            // 去重：同一 URL 只登记一次（仅当 URL 已设置时）
            if (record.url && all.some((r) => r.url === record.url))
                return;
            all.unshift(record);
            if (all.length > MAX_RECORDS)
                all.length = MAX_RECORDS;
            await saveRecords(all);
        }
        async function patchRecord(id, patch) {
            const all = loadRecords();
            const idx = all.findIndex((r) => r.id === id);
            if (idx < 0)
                return;
            all[idx] = { ...all[idx], ...patch };
            await saveRecords(all);
        }
        // ========================================================================
        // AUTO-DETECT: 监听所有工具执行，从输出里提取 Agnes URL 并登记
        // ========================================================================
        //
        // 模型有时会绕过我们的工具，直接用 pwsh + curl 调 Agnes API。
        // 这个 hook 不依赖模型选择，只要工具结果里出现 Agnes URL，就自动记录。
        try {
            ctx.on('tools/execute', async (exec, next) => {
                const result = await next();
                try {
                    const toolName = String(exec?.name ??
                        exec?.tool?.name ??
                        exec?.definition?.name ??
                        '');
                    // 我们自己的生成工具已在内部登记，跳过，避免重复
                    if (toolName === AGNES_IMAGE_GENERATION_TOOL.name ||
                        toolName === AGNES_VIDEO_GENERATION_TOOL.name) {
                        return result;
                    }
                    const argsText = stringifyArgs(exec?.args ?? exec?.parameters ?? exec?.input);
                    const resultText = collectTextFromResult(result);
                    const combined = `${argsText}\n${resultText}`;
                    if (combined.includes('cos-platform-outputs.agnes-ai.cn')) {
                        // eslint-disable-next-line no-console
                        console.error('[agnes-ai-for-dsh] DEBUG argsText:', argsText.slice(0, 2000));
                        // eslint-disable-next-line no-console
                        console.error('[agnes-ai-for-dsh] DEBUG resultText:', resultText.slice(0, 2000));
                    }
                    const imageUrls = findAgnesImageUrls(combined);
                    const videoUrls = findAgnesVideoUrls(combined);
                    if (imageUrls.length === 0 && videoUrls.length === 0)
                        return result;
                    const { prompt, model } = extractPromptAndModel(argsText, resultText);
                    // eslint-disable-next-line no-console
                    console.error(`[agnes-ai-for-dsh] auto-detect from tool "${toolName}": ` +
                        `${imageUrls.length} image(s), ${videoUrls.length} video(s)`);
                    for (const url of imageUrls) {
                        await addRecord({
                            id: makeRecordId(),
                            type: 'image',
                            prompt,
                            model: model || 'agnes-image-2.5-flash',
                            status: 'completed',
                            url,
                            createdAt: Date.now(),
                            completedAt: Date.now(),
                            source: toolName || 'auto',
                        });
                    }
                    for (const url of videoUrls) {
                        await addRecord({
                            id: makeRecordId(),
                            type: 'video',
                            prompt,
                            model: model || 'agnes-video-25-flash',
                            status: 'completed',
                            url,
                            createdAt: Date.now(),
                            completedAt: Date.now(),
                            source: toolName || 'auto',
                        });
                    }
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai-for-dsh] auto-detect failed:', err);
                }
                return result;
            });
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] tools/execute hook registered');
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] tools/execute hook FAILED:', err);
        }
        // ---- 图片生成工具 ----
        try {
            sctx.tools.register(defineTool({
                name: AGNES_IMAGE_GENERATION_TOOL.name,
                description: AGNES_IMAGE_GENERATION_TOOL.description,
                parameters: AGNES_IMAGE_GENERATION_TOOL.parameters,
                output: {
                    schema: IMAGE_VIDEO_OUTPUT_SCHEMA,
                    render: renderImageVideoResult,
                },
                presentCall: (args) => ({
                    card: 'generic',
                    title: `Agnes 图片：${String(args?.prompt || '').slice(0, 60)}`,
                    kind: 'other',
                    rawInput: args,
                }),
                execute: async (args, exec) => {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai-for-dsh] image tool execute called, args =', args);
                    const id = makeRecordId();
                    await addRecord({
                        id,
                        type: 'image',
                        prompt: args.prompt || '',
                        model: args.model || 'agnes-image-2.5-flash',
                        status: 'pending',
                        size: args.size,
                        ratio: args.ratio,
                        createdAt: Date.now(),
                        source: 'agnes_image_generation',
                    });
                    try {
                        const result = await executeImageGeneration(args, exec?.ctx ?? sctx);
                        if (result?.url) {
                            await patchRecord(id, { status: 'completed', url: result.url, completedAt: Date.now() });
                        }
                        else {
                            await patchRecord(id, { status: 'failed', error: result?.error || 'unknown' });
                        }
                        return result;
                    }
                    catch (err) {
                        await patchRecord(id, { status: 'failed', error: err?.message || String(err) });
                        throw err;
                    }
                },
            }));
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] image tool registered');
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] image tool FAILED:', err);
        }
        // ---- 视频生成工具 ----
        try {
            sctx.tools.register(defineTool({
                name: AGNES_VIDEO_GENERATION_TOOL.name,
                description: AGNES_VIDEO_GENERATION_TOOL.description,
                parameters: AGNES_VIDEO_GENERATION_TOOL.parameters,
                output: {
                    schema: IMAGE_VIDEO_OUTPUT_SCHEMA,
                    render: renderImageVideoResult,
                },
                presentCall: (args) => ({
                    card: 'generic',
                    title: `Agnes 视频：${String(args?.prompt || '').slice(0, 60)}`,
                    kind: 'other',
                    rawInput: args,
                }),
                execute: async (args, exec) => {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai-for-dsh] video tool execute called, args =', args);
                    const id = makeRecordId();
                    await addRecord({
                        id,
                        type: 'video',
                        prompt: args.prompt || '',
                        model: args.model || 'agnes-video-25-flash',
                        status: 'pending',
                        size: args.size,
                        seconds: args.seconds,
                        createdAt: Date.now(),
                        source: 'agnes_video_generation',
                    });
                    try {
                        const result = await executeVideoGeneration(args, exec?.ctx ?? sctx, async (progress, status) => {
                            await patchRecord(id, { progress, status: status });
                        });
                        if (result?.url) {
                            await patchRecord(id, { status: 'completed', url: result.url, progress: 100, completedAt: Date.now() });
                        }
                        else {
                            await patchRecord(id, { status: 'failed', error: result?.error || 'unknown' });
                        }
                        return result;
                    }
                    catch (err) {
                        await patchRecord(id, { status: 'failed', error: err?.message || String(err) });
                        throw err;
                    }
                },
            }));
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] video tool registered');
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] video tool FAILED:', err);
        }
        // ---- 记录登记工具（保留作为显式路径） ----
        try {
            sctx.tools.register(defineTool({
                name: AGNES_RECORD_GENERATION_TOOL.name,
                description: AGNES_RECORD_GENERATION_TOOL.description,
                parameters: AGNES_RECORD_GENERATION_TOOL.parameters,
                output: {
                    schema: RECORD_OUTPUT_SCHEMA,
                    render: renderRecordResult,
                },
                presentCall: (args) => ({
                    card: 'generic',
                    title: `记录生成：${String(args?.type || '')} · ${String(args?.prompt || '').slice(0, 40)}`,
                    kind: 'other',
                    rawInput: args,
                }),
                execute: async (args) => {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai-for-dsh] record tool execute called, args =', args);
                    try {
                        const id = makeRecordId();
                        await addRecord({
                            id,
                            type: args.type === 'video' ? 'video' : 'image',
                            prompt: args.prompt || '',
                            model: args.model || '',
                            status: 'completed',
                            url: args.url,
                            size: args.size,
                            ratio: args.ratio,
                            seconds: args.seconds,
                            createdAt: Date.now(),
                            completedAt: Date.now(),
                            source: 'agnes_record_generation',
                        });
                        return { ok: true, id };
                    }
                    catch (err) {
                        return { ok: false, error: err?.message || String(err) };
                    }
                },
            }));
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] record tool registered');
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh] record tool FAILED:', err);
        }
    });
}
//# sourceMappingURL=index.js.map