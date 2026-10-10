/**
 * Tool definitions for Agnes AI image and video generation.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE HAS BOTH A DSL AND A COMPILER
 * ---------------------------------------------------------------------------
 * The host's `defineTool` (from `@deepseek-ai/dsh-tools`) does NOT accept raw
 * JSON Schema. It accepts a "property map" — one entry per parameter, each a
 * schema object that may carry its own `required: true` — and compiles that
 * into object-rooted JSON Schema itself, lifting those flags into a root-level
 * `required` array. Handing it a native `{ type: 'object', properties, ... }`
 * schema throws "parameters.type must be a value schema object".
 *
 * So the DSL is the authoring form, and it is what `defineTool` must receive.
 *
 * The danger is that the DSL is NOT valid JSON Schema. If it ever reaches a
 * provider unconverted, the request is rejected wholesale — WorkBuddy answers
 * HTTP 400 code 11129 ("工具定义不合规") and every model reply in the session
 * fails, not just the tool. That is exactly what happened when a silent
 * `require()` failure left an identity function in place of the real
 * `defineTool`.
 *
 * The guard against that is `compileParameters` below: this plugin compiles the
 * DSL itself, always, and validates the result before registering anything. The
 * compiled schema — not the DSL — is what the tool registry must ultimately
 * expose, and `assertAllToolSchemas()` proves that at load time.
 */
import { AGNES_IMAGE_MODEL_IDS, AGNES_IMAGE_SIZES, AGNES_RATIOS, AGNES_VIDEO_FLASH_SIZE, AGNES_VIDEO_MODEL_IDS, AGNES_VIDEO_SECONDS, AGNES_VIDEO_SIZES, } from './types.js';
// ============================================================================
// Compiler: DSL -> JSON Schema
// ============================================================================
/** Compile one DSL property into a JSON Schema node, dropping `required`. */
function compileProperty(property) {
    const { required: _required, items, properties, ...rest } = property;
    const node = { ...rest };
    if (items)
        node.items = compileProperty(items);
    if (properties) {
        const nested = {};
        for (const [key, child] of Object.entries(properties))
            nested[key] = compileProperty(child);
        node.properties = nested;
    }
    return node;
}
/**
 * Compile a DSL property map into object-rooted JSON Schema.
 *
 * This is the function whose absence caused the original outage, so it is
 * deliberately total: every parameter-level `required: true` becomes a member
 * of the root `required` array, and no property ever retains a `required` key.
 */
export function compileParameters(spec) {
    const properties = {};
    const required = [];
    for (const [key, property] of Object.entries(spec)) {
        properties[key] = compileProperty(property);
        if (property.required === true)
            required.push(key);
    }
    const schema = { type: 'object', properties };
    if (required.length > 0)
        schema.required = required;
    return schema;
}
// ============================================================================
// Validation: the shape the provider actually accepts
// ============================================================================
/**
 * Assert that a compiled schema is one the provider accepts.
 *
 * This checks the COMPILED form, because that is what reaches the wire. It is
 * the difference between one broken tool and a session where the model cannot
 * reply at all.
 */
export function assertValidCompiledSchema(toolName, schema) {
    if (schema.type !== 'object') {
        throw new Error(`tool "${toolName}": compiled schema must be object-rooted`);
    }
    if (!schema.properties || typeof schema.properties !== 'object') {
        throw new Error(`tool "${toolName}": compiled schema must declare properties`);
    }
    const declared = new Set(Object.keys(schema.properties));
    for (const [key, node] of Object.entries(schema.properties)) {
        if (!node || typeof node !== 'object') {
            throw new Error(`tool "${toolName}": property "${key}" must be a schema object`);
        }
        // The precise defect that produced HTTP 400 / code 11129.
        if (Object.hasOwn(node, 'required')) {
            throw new Error(`tool "${toolName}": property "${key}" still carries "required" after compilation — ` +
                'it must be lifted to the root-level required array');
        }
        if (Array.isArray(node.enum) && node.enum.length === 0) {
            throw new Error(`tool "${toolName}": property "${key}" has an empty enum`);
        }
    }
    if (schema.required !== undefined) {
        if (!Array.isArray(schema.required)) {
            throw new Error(`tool "${toolName}": compiled required must be an array`);
        }
        for (const key of schema.required) {
            if (!declared.has(key)) {
                throw new Error(`tool "${toolName}": required name "${key}" is not a declared property`);
            }
        }
    }
}
/**
 * Compile and validate every tool.
 *
 * Called during plugin load, before any registration: an invalid schema must
 * stop the plugin rather than poison every request in the session.
 *
 * @returns the compiled schemas, keyed by tool name.
 */
export function assertAllToolSchemas(tools = AGNES_TOOLS) {
    const compiled = {};
    for (const tool of tools) {
        const schema = compileParameters(tool.parameters);
        assertValidCompiledSchema(tool.name, schema);
        compiled[tool.name] = schema;
    }
    return compiled;
}
// ============================================================================
// Image generation
// ============================================================================
export const AGNES_IMAGE_TOOL = {
    name: 'agnes_image_generation',
    description: [
        'Generate or edit an image with the Agnes AI image API.',
        '',
        'Use this whenever the user asks to create, draw, render, illustrate or edit an image.',
        'Do not shell out to curl for the Agnes API — this tool performs the request and',
        'reports the resulting URL, or a readable error.',
        '',
        'Parameter notes:',
        '- model: an image model id; "agnes-image-2.5-flash" is the newest.',
        '- prompt: the image description, or the edit instruction when images are given.',
        '- size: output tier, "1K" through "4K".',
        '- ratio: optional aspect ratio, defaults to 1:1.',
        '- image: optional input image URLs for image-to-image or multi-image editing.',
        '- return_base64: return inline base64 instead of a hosted URL (text-to-image only).',
        '',
        'Returns { url } or { base64 }; { error } on failure.',
    ].join('\n'),
    parameters: {
        model: {
            type: 'string',
            required: true,
            enum: AGNES_IMAGE_MODEL_IDS,
            description: 'Image model id to use.',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'Text description of the image, or the edit instruction when images are supplied.',
        },
        size: {
            type: 'string',
            required: true,
            enum: [...AGNES_IMAGE_SIZES],
            description: 'Output size tier.',
        },
        ratio: {
            type: 'string',
            enum: [...AGNES_RATIOS],
            description: 'Aspect ratio. Defaults to 1:1.',
        },
        image: {
            type: 'array',
            items: { type: 'string' },
            description: 'Input image URLs for image-to-image or multi-image editing.',
        },
        return_base64: {
            type: 'boolean',
            description: 'Return base64 data instead of a hosted URL (text-to-image only).',
        },
    },
};
// ============================================================================
// Video generation
// ============================================================================
export const AGNES_VIDEO_TOOL = {
    name: 'agnes_video_generation',
    description: [
        'Generate a video with the Agnes AI video API and return its URL once the async task settles.',
        '',
        'Use this whenever the user asks to create, render or animate a video.',
        'Do not shell out to curl for the Agnes API — this tool creates the task and polls it.',
        '',
        'Parameter notes:',
        '- model: "agnes-video-2.5-flash" (720P only) or "agnes-video-2.5".',
        '- prompt: the video description.',
        '- seconds: duration as a string, "4" through "12"; defaults to "5".',
        '- mode: "text" by default. Use "keyframe" with first_frame/last_frame, or "reference"',
        '  with images/audios. Each mode forbids the other modes\' media fields.',
        `- size: "720P" for Flash; "720P" | "1080P" | "1K" | "2K" for 2.5.`,
        '',
        'Returns { url }, or { error } on failure.',
    ].join('\n'),
    parameters: {
        model: {
            type: 'string',
            required: true,
            enum: AGNES_VIDEO_MODEL_IDS,
            description: 'Video model id to use.',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'Text description of the video.',
        },
        seconds: {
            type: 'string',
            enum: [...AGNES_VIDEO_SECONDS],
            description: 'Duration in seconds. Defaults to 5.',
        },
        mode: {
            type: 'string',
            enum: ['text', 'keyframe', 'reference'],
            description: 'Generation mode. Defaults to text.',
        },
        size: {
            type: 'string',
            enum: [...AGNES_VIDEO_SIZES],
            description: `Resolution. agnes-video-2.5-flash accepts only ${AGNES_VIDEO_FLASH_SIZE}.`,
        },
        aspect_ratio: {
            type: 'string',
            enum: [...AGNES_RATIOS],
            description: 'Aspect ratio. Defaults to 16:9.',
        },
        first_frame: {
            type: 'string',
            description: 'keyframe mode: first frame image URL.',
        },
        last_frame: {
            type: 'string',
            description: 'keyframe mode: last frame image URL.',
        },
        images: {
            type: 'array',
            items: { type: 'string' },
            description: 'reference mode: reference image URLs.',
        },
        audios: {
            type: 'array',
            items: { type: 'string' },
            description: 'reference mode: reference audio URLs.',
        },
    },
};
// ============================================================================
// Recording a finished generation
// ============================================================================
export const AGNES_RECORD_TOOL = {
    name: 'agnes_record_generation',
    description: [
        'Record one finished Agnes AI generation (image or video) into the user-visible history.',
        '',
        'Call this once per item, but only for items produced outside the',
        'agnes_image_generation / agnes_video_generation tools, which record themselves.',
        'It generates nothing and never calls the Agnes API; it stores metadata only.',
        '',
        'Returns { ok: true, id }, or { ok: false, error } on failure.',
    ].join('\n'),
    parameters: {
        type: {
            type: 'string',
            required: true,
            enum: ['image', 'video'],
            description: 'Kind of item being recorded.',
        },
        prompt: {
            type: 'string',
            required: true,
            description: 'Prompt used to produce the item.',
        },
        model: {
            type: 'string',
            required: true,
            description: 'Agnes model id that produced the item.',
        },
        url: {
            type: 'string',
            required: true,
            description: 'Result URL returned by the Agnes API.',
        },
        size: {
            type: 'string',
            description: 'Output size or resolution, for example "1K" or "720P".',
        },
        ratio: {
            type: 'string',
            description: 'Aspect ratio, for example "16:9".',
        },
        seconds: {
            type: 'string',
            description: 'Video duration in seconds, for example "5".',
        },
    },
};
/** All tools this plugin contributes. */
export const AGNES_TOOLS = [
    AGNES_IMAGE_TOOL,
    AGNES_VIDEO_TOOL,
    AGNES_RECORD_TOOL,
];
//# sourceMappingURL=tools.js.map