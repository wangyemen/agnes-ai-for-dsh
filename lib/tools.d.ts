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
/** One parameter in the authoring DSL. */
export interface DslProperty {
    type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    /** `true` marks the parameter required; it is lifted to the root on compile. */
    required?: true;
    description?: string;
    enum?: readonly string[];
    items?: DslProperty;
    properties?: Record<string, DslProperty>;
    additionalProperties?: boolean;
}
/** A tool's parameter specification, in the authoring DSL. */
export type DslParameters = Record<string, DslProperty>;
/** A compiled, object-rooted JSON Schema node. */
export interface JsonSchemaNode {
    type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
    description?: string;
    enum?: readonly string[];
    items?: JsonSchemaNode;
    properties?: Record<string, JsonSchemaNode>;
    required?: readonly string[];
    additionalProperties?: boolean;
}
export interface AgnesToolDefinition {
    name: string;
    description: string;
    /** Authoring form, passed to `defineTool`. */
    parameters: DslParameters;
}
/**
 * Compile a DSL property map into object-rooted JSON Schema.
 *
 * This is the function whose absence caused the original outage, so it is
 * deliberately total: every parameter-level `required: true` becomes a member
 * of the root `required` array, and no property ever retains a `required` key.
 */
export declare function compileParameters(spec: DslParameters): JsonSchemaNode;
/**
 * Assert that a compiled schema is one the provider accepts.
 *
 * This checks the COMPILED form, because that is what reaches the wire. It is
 * the difference between one broken tool and a session where the model cannot
 * reply at all.
 */
export declare function assertValidCompiledSchema(toolName: string, schema: JsonSchemaNode): void;
/**
 * Compile and validate every tool.
 *
 * Called during plugin load, before any registration: an invalid schema must
 * stop the plugin rather than poison every request in the session.
 *
 * @returns the compiled schemas, keyed by tool name.
 */
export declare function assertAllToolSchemas(tools?: readonly AgnesToolDefinition[]): Record<string, JsonSchemaNode>;
export declare const AGNES_IMAGE_TOOL: AgnesToolDefinition;
export declare const AGNES_VIDEO_TOOL: AgnesToolDefinition;
export declare const AGNES_RECORD_TOOL: AgnesToolDefinition;
/** All tools this plugin contributes. */
export declare const AGNES_TOOLS: AgnesToolDefinition[];
//# sourceMappingURL=tools.d.ts.map