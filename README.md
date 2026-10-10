# agnes-ai-for-dsh

Agnes AI integration for [DeepSeek Harness](https://github.com/deepseek-ai/dsh) —
an LLM provider with multimodal support, image/video generation tools, and a
settings panel.

[中文说明](README.zh.md)

## What it provides

| Piece | Description |
| --- | --- |
| **Provider** | `agnes-ai`, registered with the `llm-pi-ai` adapter (OpenAI-compatible Chat Completions) |
| **Chat models** | `agnes-2.5-flash`, `agnes-3.0-flash`, `agnes-2.5-pro`, `agnes-2.5-pro-beta` — all accept image input |
| **Tools** | `agnes_image_generation`, `agnes_video_generation`, `agnes_record_generation` |
| **Settings panel** | An **Agnes AI** section in Settings listing the live configuration and the model catalogue |

## Install

```bash
dsh plugin install agnes-ai-for-dsh
```

Or add it to a profile's `package.json` and reinstall:

```json
{
  "dependencies": {
    "agnes-ai-for-dsh": "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"
  }
}
```

Then add the bundle to `dsh.profile.bundles` and restart DSH.

## Configure

The provider is pre-declared by `cordis.patch.yml`, so the only required step is
the API key:

1. Open **Settings → Models**.
2. Find **Agnes AI** and enter your API key.
3. The key is stored by DSH's credential system under `AGNES_AI_API_KEY`.

The default endpoint is the China region:

```
https://api.agnes-ai.cn/v1
```

To use the Global endpoint, change `baseURL` to
`https://apihub.agnes-ai.com/v1` either in `cordis.patch.yml` or directly in
Settings → Models.

## Usage

Once enabled, the two media tools are available to the model:

- **`agnes_image_generation`** — text-to-image, image-to-image and multi-image
  editing. Parameters: `model`, `prompt`, `size` (`1K`–`4K`), optional `ratio`,
  optional `image` (input URLs), optional `return_base64`.
- **`agnes_video_generation`** — asynchronous video generation with polling.
  Parameters: `model`, `prompt`, optional `seconds`, `mode`, `size`,
  `aspect_ratio`, and the mode-specific media fields.

Video generation is asynchronous: the tool creates a task and then polls
`GET /agnesapi?video_id=…&model_name=…` until it settles. `agnes-video-2.5-flash`
accepts only `720P`; `agnes-video-2.5` accepts `720P`, `1080P`, `1K` and `2K`.

## Notes for maintainers

### Tool schemas

The host's `defineTool` does **not** accept raw JSON Schema — it requires a
property-map DSL whose entries may carry their own `required: true`, and it
compiles that into object-rooted JSON Schema itself.

That DSL is not valid JSON Schema. If it ever reaches a provider unconverted, the
provider rejects the **entire request** (WorkBuddy returns HTTP 400, code 11129,
"工具定义不合规"), so every model reply in the session fails — not merely the one
tool. This is not hypothetical: it is exactly what happened when a bare
`require()` threw inside an ESM module and a silent identity fallback registered
the raw DSL.

The defence is in `src/tools.ts`:

- `compileParameters()` compiles the DSL here, so the plugin does not depend on
  the host helper for correctness.
- `assertValidCompiledSchema()` / `assertAllToolSchemas()` verify the **compiled**
  form at load and throw on the invalid shape, so a mistake stops the plugin
  instead of poisoning every request.
- Registration re-checks the parameters `defineTool` actually produced and
  refuses to register if the raw DSL survived.

`verify.mjs` exercises all of this against the real `defineTool`.

### Build

```bash
npm install
npm run build
```

`lib/` is committed, because the package installs from git and the consuming
profile does not run build scripts. **Rebuild before committing any `src/`
change**, or the stale `lib/` is what ships.

## License

MIT
