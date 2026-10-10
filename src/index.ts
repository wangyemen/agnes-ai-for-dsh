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

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'

import { generateImage, generateVideo } from './api.js'
import {
  AGNES_API_KEY_ENV,
  AGNES_BASE_URL_CN,
  AGNES_PROVIDER_ID,
  AGNES_SETTINGS_NS,
  AGNES_SETTINGS_PATH,
  getAgnesBaseUrl,
  type AgnesRegion,
} from './types.js'
import {
  AGNES_IMAGE_TOOL,
  AGNES_RECORD_TOOL,
  AGNES_VIDEO_TOOL,
  assertAllToolSchemas,
  compileParameters,
  type JsonSchemaNode,
} from './tools.js'

export const name = 'agnes-ai-for-dsh'

/** Settings namespace holding the generation history. */
export const AGNES_RECORDS_NS = 'agnes-generations'

/** Maximum records retained. */
const MAX_RECORDS = 200

// ============================================================================
// Tool result rendering
// ============================================================================

interface ToolResult {
  url?: string
  base64?: string
  ok?: boolean
  id?: string
  error?: string
}

function renderMediaResult(_args: unknown, value: ToolResult): Array<{ type: 'text'; text: string }> {
  if (value?.error) return [{ type: 'text', text: `Agnes error: ${value.error}` }]
  if (value?.url) return [{ type: 'text', text: `Result URL: ${value.url}` }]
  if (value?.base64) return [{ type: 'text', text: 'Result returned as inline base64 data.' }]
  return [{ type: 'text', text: 'No result.' }]
}

function renderRecordResult(_args: unknown, value: ToolResult): Array<{ type: 'text'; text: string }> {
  if (value?.ok) return [{ type: 'text', text: `Recorded as ${value.id ?? '(unknown id)'}` }]
  if (value?.error) return [{ type: 'text', text: `Record failed: ${value.error}` }]
  return [{ type: 'text', text: 'No result.' }]
}

/** Output schema shared by the two media tools. */
const MEDIA_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    url: { type: 'string' },
    base64: { type: 'string' },
    error: { type: 'string' },
  },
} as const

const RECORD_OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean' },
    id: { type: 'string' },
    error: { type: 'string' },
  },
} as const

// ============================================================================
// Optional host defineTool
// ============================================================================

type DefineTool = (spec: unknown) => unknown

let hostDefineTool: DefineTool | null = null

/**
 * Resolve the host `defineTool`, if present.
 *
 * The previous implementation called a bare `require(...)` inside an ESM
 * module. That throws `ReferenceError: require is not defined`, which a
 * surrounding try/catch silently swallowed, so a fallback was used without
 * anyone noticing. A dynamic `import()` is the correct spelling here and
 * cannot fail that way: either it resolves, or the catch is genuinely about
 * the package being absent.
 */
async function resolveHostDefineTool(): Promise<DefineTool | null> {
  try {
    const mod = (await import('@deepseek-ai/dsh-tools')) as { defineTool?: DefineTool }
    return typeof mod.defineTool === 'function' ? mod.defineTool : null
  } catch {
    return null
  }
}

// ============================================================================
// Records storage
// ============================================================================

export interface GenerationRecord {
  id: string
  type: 'image' | 'video'
  prompt: string
  model: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  url?: string
  size?: string
  ratio?: string
  seconds?: string
  error?: string
  progress?: number
  createdAt: number
  completedAt?: number
  source?: string
}

/** Shape of the persisted namespace value. */
const RecordsSchema = z.object({
  data: z.string().default('[]'),
})

interface RecordsScope {
  get(): { data?: string } | undefined
  update(patch: { data: string }): Promise<void>
}

// ============================================================================
// Plugin body
// ============================================================================

export function apply(ctx: Context): void {
  // Validate before anything registers. A malformed schema does not break one
  // tool — the provider rejects every request in the session — so refuse to
  // load rather than poison the model.
  const compiledSchemas = assertAllToolSchemas()

  ctx.inject(['tools'], (sctx: any) => {
    // ------------------------------------------------------------------
    // Records store (optional: not every runtime mounts `settings`)
    // ------------------------------------------------------------------
    let recordsScope: RecordsScope | null = null
    try {
      const settings = sctx.reflect?.get?.('settings', false) ?? null
      if (settings && typeof settings.register === 'function') {
        recordsScope = settings.register(AGNES_RECORDS_NS, RecordsSchema) as RecordsScope
      }
    } catch (err) {
      console.warn('[agnes-ai-for-dsh] settings unavailable; generation records disabled:', err)
    }

    function loadRecords(): GenerationRecord[] {
      if (!recordsScope) return []
      try {
        const value = recordsScope.get()
        const parsed = JSON.parse(value?.data ?? '[]') as unknown
        return Array.isArray(parsed) ? (parsed as GenerationRecord[]) : []
      } catch {
        return []
      }
    }

    async function saveRecords(records: GenerationRecord[]): Promise<void> {
      if (!recordsScope) return
      try {
        await recordsScope.update({ data: JSON.stringify(records) })
      } catch (err) {
        console.warn('[agnes-ai-for-dsh] failed to save generation records:', err)
      }
    }

    async function addRecord(record: GenerationRecord): Promise<void> {
      const all = loadRecords()
      // The same URL is only ever recorded once.
      if (record.url && all.some((r) => r.url === record.url)) return
      all.unshift(record)
      if (all.length > MAX_RECORDS) all.length = MAX_RECORDS
      await saveRecords(all)
    }

    async function patchRecord(id: string, patch: Partial<GenerationRecord>): Promise<void> {
      const all = loadRecords()
      const index = all.findIndex((r) => r.id === id)
      if (index < 0) return
      all[index] = { ...all[index], ...patch }
      await saveRecords(all)
    }

    // ------------------------------------------------------------------
    // Credential + config resolution
    // ------------------------------------------------------------------
    async function resolveApiKey(): Promise<string | null> {
      try {
        const credentials = sctx.reflect?.get?.('credentials', false) ?? null
        if (!credentials) return null
        if (typeof credentials.resolve === 'function') {
          const resolved = await credentials.resolve(AGNES_API_KEY_ENV)
          if (typeof resolved === 'string') return resolved
          if (resolved && typeof resolved.value === 'string') return resolved.value
        }
        if (typeof credentials.readRecord === 'function') {
          const record = await credentials.readRecord(AGNES_API_KEY_ENV)
          const secret = record?.secret ?? record?.value
          if (typeof secret === 'string') return secret
        }
        return null
      } catch (err) {
        console.warn('[agnes-ai-for-dsh] failed to resolve the Agnes API key:', err)
        return null
      }
    }

    /** Read the configured base URL from the live provider block. */
    function resolveBaseUrl(): string {
      try {
        const settings = sctx.reflect?.get?.('settings', false) ?? null
        if (!settings || typeof settings.describe !== 'function') return AGNES_BASE_URL_CN
        const namespaces = settings.describe({ redactSecrets: true }) as Array<{
          ns?: string
          value?: unknown
        }>
        const llm = namespaces.find((n) => n.ns === AGNES_SETTINGS_NS)
        let node: any = llm?.value
        for (const key of AGNES_SETTINGS_PATH) {
          node = node && typeof node === 'object' ? node[key] : undefined
        }
        const baseURL = node?.baseURL
        return typeof baseURL === 'string' && baseURL.length > 0 ? baseURL : AGNES_BASE_URL_CN
      } catch {
        return AGNES_BASE_URL_CN
      }
    }

    async function clientConfig(): Promise<{ apiKey: string; baseURL: string } | { error: string }> {
      const apiKey = await resolveApiKey()
      if (!apiKey) {
        return {
          error:
            'No Agnes API key found. Add it under Settings -> Models ' +
            `(credential "${AGNES_API_KEY_ENV}").`,
        }
      }
      return { apiKey, baseURL: resolveBaseUrl() }
    }

    // ------------------------------------------------------------------
    // Tool registration
    // ------------------------------------------------------------------
    void (async () => {
      const defineTool = await resolveHostDefineTool()
      hostDefineTool = defineTool

      /**
       * Turn a DSL tool spec into a registry-ready definition.
       *
       * The DSL is what `defineTool` requires; it is NOT valid JSON Schema, so
       * it must never reach the registry unconverted. `defineTool` performs that
       * conversion, but this plugin does not take that on faith: the parameters
       * actually produced are re-checked, and a mismatch refuses to register.
       *
       * That check is what stops a silent helper failure — the exact cause of a
       * past outage, where a bare `require()` threw inside an ESM module and an
       * identity fallback registered the raw DSL — from putting an invalid
       * schema on the wire and breaking every request in the session.
       */
      const build = (spec: Record<string, unknown>): Record<string, unknown> => {
        const name = String(spec.name)
        const expected = compiledSchemas[name]
        if (!expected) throw new Error(`tool "${name}": no compiled schema`)

        const built = (defineTool ? defineTool(spec) : { ...spec, parameters: expected }) as {
          parameters?: JsonSchemaNode
          properties?: unknown
        }

        const produced = built?.parameters
        const illegal = Object.entries(produced?.properties ?? {})
          .filter(([, node]) => node && typeof node === 'object' && Object.hasOwn(node, 'required'))
          .map(([key]) => key)

        if (produced?.type !== 'object' || illegal.length > 0) {
          throw new Error(
            `tool "${name}": refusing to register — the produced parameters are not ` +
              'object-rooted JSON Schema' +
              (illegal.length > 0
                ? ` (per-property "required" survived on: ${illegal.join(', ')})`
                : ''),
          )
        }
        return built as unknown as Record<string, unknown>
      }

      const registered: string[] = []

      try {
        sctx.tools.register(
          build({
            name: AGNES_IMAGE_TOOL.name,
            description: AGNES_IMAGE_TOOL.description,
            parameters: AGNES_IMAGE_TOOL.parameters,
            output: { schema: MEDIA_OUTPUT_SCHEMA, render: renderMediaResult },
            execute: async (args: Record<string, unknown>) => {
              const config = await clientConfig()
              if ('error' in config) return { error: config.error }

              const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
              await addRecord({
                id,
                type: 'image',
                prompt: String(args.prompt ?? ''),
                model: String(args.model ?? 'agnes-image-2.5-flash'),
                status: 'pending',
                size: typeof args.size === 'string' ? args.size : undefined,
                ratio: typeof args.ratio === 'string' ? args.ratio : undefined,
                createdAt: Date.now(),
                source: AGNES_IMAGE_TOOL.name,
              })

              const result = await generateImage(
                {
                  model: String(args.model),
                  prompt: String(args.prompt),
                  size: String(args.size),
                  ratio: typeof args.ratio === 'string' ? args.ratio : undefined,
                  image: Array.isArray(args.image) ? (args.image as string[]) : undefined,
                  returnBase64: args.return_base64 === true,
                },
                config,
              )

              if (result.error) {
                await patchRecord(id, { status: 'failed', error: result.error })
                return { error: result.error }
              }
              await patchRecord(id, {
                status: 'completed',
                url: result.url,
                completedAt: Date.now(),
              })
              return { url: result.url, base64: result.base64 }
            },
          }),
        )
        registered.push(AGNES_IMAGE_TOOL.name)
      } catch (err) {
        console.error(`[agnes-ai-for-dsh] failed to register ${AGNES_IMAGE_TOOL.name}:`, err)
      }

      try {
        sctx.tools.register(
          build({
            name: AGNES_VIDEO_TOOL.name,
            description: AGNES_VIDEO_TOOL.description,
            parameters: AGNES_VIDEO_TOOL.parameters,
            output: { schema: MEDIA_OUTPUT_SCHEMA, render: renderMediaResult },
            execute: async (args: Record<string, unknown>) => {
              const config = await clientConfig()
              if ('error' in config) return { error: config.error }

              const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
              await addRecord({
                id,
                type: 'video',
                prompt: String(args.prompt ?? ''),
                model: String(args.model ?? 'agnes-video-2.5-flash'),
                status: 'pending',
                size: typeof args.size === 'string' ? args.size : undefined,
                seconds: typeof args.seconds === 'string' ? args.seconds : undefined,
                createdAt: Date.now(),
                source: AGNES_VIDEO_TOOL.name,
              })

              const result = await generateVideo(
                {
                  model: String(args.model),
                  prompt: String(args.prompt),
                  seconds: typeof args.seconds === 'string' ? args.seconds : undefined,
                  mode: typeof args.mode === 'string' ? (args.mode as never) : undefined,
                  size: typeof args.size === 'string' ? args.size : undefined,
                  aspectRatio:
                    typeof args.aspect_ratio === 'string' ? args.aspect_ratio : undefined,
                  firstFrame: typeof args.first_frame === 'string' ? args.first_frame : undefined,
                  lastFrame: typeof args.last_frame === 'string' ? args.last_frame : undefined,
                  images: Array.isArray(args.images) ? (args.images as string[]) : undefined,
                  audios: Array.isArray(args.audios) ? (args.audios as string[]) : undefined,
                  onProgress: (progress) => {
                    void patchRecord(id, { progress, status: 'processing' })
                  },
                },
                config,
              )

              if (result.error) {
                await patchRecord(id, { status: 'failed', error: result.error })
                return { error: result.error }
              }
              await patchRecord(id, {
                status: 'completed',
                url: result.url,
                completedAt: Date.now(),
              })
              return { url: result.url }
            },
          }),
        )
        registered.push(AGNES_VIDEO_TOOL.name)
      } catch (err) {
        console.error(`[agnes-ai-for-dsh] failed to register ${AGNES_VIDEO_TOOL.name}:`, err)
      }

      try {
        sctx.tools.register(
          build({
            name: AGNES_RECORD_TOOL.name,
            description: AGNES_RECORD_TOOL.description,
            parameters: AGNES_RECORD_TOOL.parameters,
            output: { schema: RECORD_OUTPUT_SCHEMA, render: renderRecordResult },
            execute: async (args: Record<string, unknown>) => {
              const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
              await addRecord({
                id,
                type: args.type === 'video' ? 'video' : 'image',
                prompt: String(args.prompt ?? ''),
                model: String(args.model ?? ''),
                status: 'completed',
                url: typeof args.url === 'string' ? args.url : undefined,
                size: typeof args.size === 'string' ? args.size : undefined,
                ratio: typeof args.ratio === 'string' ? args.ratio : undefined,
                seconds: typeof args.seconds === 'string' ? args.seconds : undefined,
                createdAt: Date.now(),
                completedAt: Date.now(),
                source: AGNES_RECORD_TOOL.name,
              })
              return { ok: true, id }
            },
          }),
        )
        registered.push(AGNES_RECORD_TOOL.name)
      } catch (err) {
        console.error(`[agnes-ai-for-dsh] failed to register ${AGNES_RECORD_TOOL.name}:`, err)
      }

      if (registered.length > 0) {
        console.log(`[agnes-ai-for-dsh] registered tools: ${registered.join(', ')}`)
      }
    })()
  })
}

// ============================================================================
// Re-exports for tests and the settings panel
// ============================================================================

export {
  AGNES_IMAGE_TOOL,
  AGNES_VIDEO_TOOL,
  AGNES_RECORD_TOOL,
  AGNES_TOOLS,
  assertAllToolSchemas,
  assertValidCompiledSchema,
  compileParameters,
} from './tools.js'
export * from './types.js'
export { generateImage, generateVideo } from './api.js'

/** Provider route this plugin configures. */
export const providerId = AGNES_PROVIDER_ID

/** Region helper kept for symmetry with the client half. */
export function baseUrlFor(region: AgnesRegion): string {
  return getAgnesBaseUrl(region)
}

/** Whether the host `defineTool` helper was reachable. */
export function hasHostDefineTool(): boolean {
  return hostDefineTool !== null
}
