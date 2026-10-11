/**
 * Invoke each tool through the real registration path and prove the value it
 * returns is lossless JSON.
 *
 * This guards the failure
 *   tool "agnes_image_generation" returned invalid output: value is not lossless JSON
 * which is what an `undefined` property in the returned object produces: the
 * registry snapshots the value with snapshotJsonValue(), that walk rejects the
 * whole object, and the call fails even though the tool body succeeded.
 *
 * The natural spelling `{ url: x, base64: y }` hits this whenever one of the
 * two is absent — which is the normal case for an image result.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// The same walker the tool registry uses.
let snapshotJsonValue
try {
  ;({ snapshotJsonValue } = require('@deepseek-ai/dsh-util-values'))
} catch {
  snapshotJsonValue = null
}
console.log('snapshotJsonValue available:', typeof snapshotJsonValue)

const plugin = await import('./lib/index.js')

let failed = 0
const check = (cond, msg) => { if (!cond) { failed++; console.log('  FAIL:', msg) } }

// ---------- 1. the helper drops undefined ----------
console.log('\n=== toolResult drops undefined ===')
const cases = [
  [{ url: 'https://x/a.png', base64: undefined }, { url: 'https://x/a.png' }],
  [{ base64: 'AAA', url: undefined }, { base64: 'AAA' }],
  [{ error: 'boom', url: undefined }, { error: 'boom' }],
  [{ ok: true, id: 'abc' }, { ok: true, id: 'abc' }],
]
for (const [input, expected] of cases) {
  const got = plugin.toolResult(input)
  const ok = JSON.stringify(got) === JSON.stringify(expected)
  console.log(`  ${ok ? 'OK ' : 'BAD'} ${JSON.stringify(input)} -> ${JSON.stringify(got)}`)
  check(ok, `toolResult(${JSON.stringify(input)})`)
  check(!Object.values(got).some((v) => v === undefined), 'no undefined may survive')
}

// ---------- 2. drive apply() and capture the registered tools ----------
console.log('\n=== invoke registered tools ===')
const registered = new Map()
const mockCtx = {
  get: () => undefined,
  reflect: { get: () => undefined },
  logger: { warn() {}, error() {}, info() {} },
  on() { return () => {} },
  effect() { return () => {} },
  inject(_d, cb) { cb(mockCtx); return () => {} },
  tools: { register(def) { registered.set(def.name, def); return () => {} } },
}
plugin.apply(mockCtx)
await new Promise((r) => setTimeout(r, 80))

console.log('  registered:', [...registered.keys()].join(', '))
check(registered.size === 3, `expected 3 tools, got ${registered.size}`)

// The record tool needs no credentials, so call it for real.
const record = registered.get('agnes_record_generation')
check(record !== undefined, 'record tool must be registered')
if (record) {
  const value = await record.execute(
    { type: 'image', prompt: 'a cat', model: 'agnes-image-2.5-flash', url: 'https://x/a.png' },
    {},
  )
  console.log('  record ->', JSON.stringify(value))
  check(typeof value === 'object' && value !== null, 'record must return an object')
  check(
    !Object.values(value).some((v) => v === undefined),
    'record result must not contain undefined',
  )
  if (snapshotJsonValue) {
    check(snapshotJsonValue(value) !== undefined, 'record result must be lossless JSON')
    console.log('  record lossless:', snapshotJsonValue(value) !== undefined)
  }
}

// The media tools need credentials; call them WITHOUT a key so they take the
// early-return branch. Valid arguments are required: defineTool validates them
// against the schema before the body runs, which is itself worth proving.
const noKeyArgs = {
  agnes_image_generation: { model: 'agnes-image-2.5-flash', prompt: 'y', size: '1K' },
  agnes_video_generation: { model: 'agnes-video-2.5-flash', prompt: 'y' },
}
for (const [name, args] of Object.entries(noKeyArgs)) {
  const tool = registered.get(name)
  if (!tool) continue
  const value = await tool.execute(args, {})
  console.log(`  ${name} (no key) ->`, JSON.stringify(value))
  check(typeof value === 'object' && value !== null, `${name} must return an object`)
  check(
    !Object.values(value).some((v) => v === undefined),
    `${name} result must not contain undefined`,
  )
  check(typeof value.error === 'string', `${name} should report the missing key as an error`)
  if (snapshotJsonValue) {
    check(snapshotJsonValue(value) !== undefined, `${name} result must be lossless JSON`)
  }
}

// Argument validation must reject an out-of-enum value before the body runs.
console.log('\n=== defineTool validates arguments ===')
const imageTool = registered.get('agnes_image_generation')
if (imageTool) {
  let rejected = false
  try {
    await imageTool.execute({ model: 'not-a-model', prompt: 'y', size: '1K' }, {})
  } catch (e) {
    rejected = e?.code === 'INVALID_ARGS' || /INVALID_ARGS|invalid arguments/.test(String(e?.message))
  }
  console.log('  bad enum rejected:', rejected)
  check(rejected, 'an out-of-enum model must be rejected with INVALID_ARGS')
}

// ---------- 3. the failure mode is real (control) ----------
console.log('\n=== control: the old shape really is rejected ===')
if (snapshotJsonValue) {
  const oldShape = { url: 'https://x/a.png', base64: undefined }
  const rejected = snapshotJsonValue(oldShape) === undefined
  console.log('  { url, base64: undefined } rejected:', rejected)
  check(rejected, 'the old shape must be rejected, which is why toolResult exists')
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
