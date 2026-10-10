/**
 * End-to-end check of the plugin's apply(): capture exactly what reaches
 * ctx.tools.register() and prove the schemas are the shape the provider
 * accepts.
 *
 * This mirrors the real registration path, including the guard that refuses
 * to register a schema carrying the raw DSL.
 */
import assert from 'node:assert/strict'

const plugin = await import('./lib/index.js')

const registered = []
const mockCtx = {
  get: () => undefined,
  reflect: { get: () => undefined },
  logger: { warn() {}, error() {}, info() {} },
  on() { return () => {} },
  effect() { return () => {} },
  inject(_deps, cb) { cb(mockCtx); return () => {} },
  tools: { register(def) { registered.push(def); return () => {} } },
}

const apply = plugin.apply ?? plugin.default?.apply
assert.equal(typeof apply, 'function', 'plugin must export apply()')
apply(mockCtx)

// Registration is async (it awaits the optional host helper).
await new Promise((r) => setTimeout(r, 60))

console.log('registered tools:', registered.length)
assert.ok(registered.length >= 2, `expected media tools, got ${registered.length}`)

let failed = 0
const check = (cond, msg) => { if (!cond) { failed++; console.log('  FAIL:', msg) } }

for (const def of registered) {
  const p = def.parameters
  console.log(`\n[tool] ${def.name}`)
  console.log('  parameters.type     :', p?.type)
  console.log('  parameters.required :', JSON.stringify(p?.required))
  console.log('  properties          :', Object.keys(p?.properties ?? {}).join(', '))
  console.log('  output.render       :', typeof def.output?.render)

  check(p && p.type === 'object', `${def.name}: must be object-rooted`)
  check(Array.isArray(p?.required), `${def.name}: required must be a root array`)
  for (const [k, node] of Object.entries(p.properties ?? {})) {
    check(!Object.hasOwn(node, 'required'), `${def.name}.${k}: no per-property required`)
  }
  for (const k of p.required ?? []) {
    check(Object.hasOwn(p.properties ?? {}, k), `${def.name}: required "${k}" must be declared`)
  }
  check(typeof def.description === 'string' && def.description.length > 0, `${def.name}: needs a description`)
  check(typeof def.execute === 'function', `${def.name}: needs execute`)
  check(def.output && typeof def.output.render === 'function', `${def.name}: needs output.render`)
}

// The raw DSL must never appear on any registered tool.
const serialized = JSON.stringify(registered.map((d) => d.parameters))
check(!/"required":true/.test(serialized), 'no raw-DSL "required":true may survive registration')
console.log('\nraw DSL leaked:', /"required":true/.test(serialized))

console.log(failed === 0 ? '\nALL PASS: registered schemas are valid' : `\n${failed} FAILED`)
process.exit(failed === 0 ? 0 : 1)
