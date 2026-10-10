/**
 * Verify the rewritten tool schemas against the rule that broke the previous
 * version, plus the constraint discovered while writing this one.
 *
 * Two facts drive the design:
 *  1. `defineTool` REQUIRES the property-map DSL; it throws on raw JSON Schema.
 *  2. The DSL is not valid JSON Schema. If it reaches a provider unconverted,
 *     the whole request is rejected (HTTP 400 code 11129, "工具定义不合规") and
 *     every model reply in the session fails — not just the one tool.
 *
 * So: author in the DSL, compile here, and assert the COMPILED form is valid.
 */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const plugin = await import('./lib/index.js')
const { AGNES_TOOLS, assertAllToolSchemas, compileParameters } = plugin

let failed = 0
const check = (cond, msg) => { if (!cond) { failed++; console.log('  FAIL:', msg) } }

// ---------- 1. compileParameters produces valid JSON Schema ----------
console.log('=== compiled schemas ===')
const compiled = compileParameters(AGNES_TOOLS[0].parameters)
console.log('  image tool compiled:', JSON.stringify(compiled).slice(0, 200))
check(compiled.type === 'object', 'compiled root must be object-rooted')
check(Array.isArray(compiled.required), 'compiled required must be a root array')
for (const [k, node] of Object.entries(compiled.properties)) {
  check(!Object.hasOwn(node, 'required'), `compiled ${k} must not keep per-property required`)
}
console.log('  no per-property required:', !/"required":true/.test(JSON.stringify(compiled)))

// ---------- 2. the plugin's own guard ----------
console.log('\n=== plugin self-validation ===')
let guardOk = true
try { assertAllToolSchemas() } catch (e) { guardOk = false; console.log('  threw:', e.message) }
check(guardOk, 'assertAllToolSchemas() must pass for the shipped tools')
console.log('  assertAllToolSchemas() passed:', guardOk)

// ---------- 3. the guard must reject the broken shape ----------
console.log('\n=== guard rejects a bad compiled schema ===')
let rejected = false
try {
  const bad = compileParameters({ a: { type: 'string', required: true } })
  // simulate a regression: put the flag back on the property
  bad.properties.a.required = true
  plugin.assertValidCompiledSchema('bad', bad)
} catch { rejected = true }
check(rejected, 'guard must reject a surviving per-property "required"')
console.log('  rejected:', rejected)

// ---------- 4. through the REAL host defineTool (DSL in) ----------
console.log('\n=== through the real host defineTool ===')
let defineTool = null
try { defineTool = require('@deepseek-ai/dsh-tools')?.defineTool ?? null } catch {}
console.log('  defineTool reachable:', typeof defineTool)

const OUTPUT = { type: 'object', additionalProperties: false, properties: { url: { type: 'string' } } }
const render = () => []

if (defineTool) {
  for (const t of AGNES_TOOLS) {
    let built
    try {
      built = defineTool({
        name: t.name, description: t.description, parameters: t.parameters,
        output: { schema: OUTPUT, render }, execute: async () => ({}),
      })
    } catch (e) {
      failed++
      console.log(`  FAIL: ${t.name} threw: ${e.message}`)
      continue
    }
    const p = built.parameters
    const illegal = Object.entries(p.properties ?? {}).filter(([, n]) => 'required' in n).map(([k]) => k)
    const expected = compileParameters(t.parameters)
    const sameRequired =
      JSON.stringify([...(p.required ?? [])].sort()) ===
      JSON.stringify([...(expected.required ?? [])].sort())
    const ok = p.type === 'object' && illegal.length === 0 && sameRequired
    console.log(`  ${ok ? 'OK ' : 'BAD'} ${built.name}: type=${p.type} required=${JSON.stringify(p.required)} illegal=${JSON.stringify(illegal)}`)
    check(ok, `${t.name}: defineTool output must be valid and match the compiled schema`)

    // prove raw JSON Schema is rejected (documents why the DSL exists)
  }
  let rawRejected = false
  try {
    defineTool({ name: 'raw', description: 'd', parameters: compiled, output: { schema: OUTPUT, render }, execute: async () => ({}) })
  } catch { rawRejected = true }
  console.log('  raw JSON Schema rejected by defineTool:', rawRejected)
}

// ---------- 5. expected required sets ----------
console.log('\n=== required sets ===')
const expectedRequired = {
  agnes_image_generation: ['model', 'prompt', 'size'],
  agnes_video_generation: ['model', 'prompt'],
  agnes_record_generation: ['type', 'prompt', 'model', 'url'],
}
for (const t of AGNES_TOOLS) {
  const c = compileParameters(t.parameters)
  const got = [...(c.required ?? [])].sort()
  const want = [...expectedRequired[t.name]].sort()
  const ok = JSON.stringify(got) === JSON.stringify(want)
  console.log(`  ${ok ? 'OK ' : 'BAD'} ${t.name}: ${JSON.stringify(got)}`)
  check(ok, `${t.name}: required set`)
}

console.log(failed === 0 ? '\nALL PASS' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
