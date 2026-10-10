# agnes-ai-for-dsh

[DeepSeek Harness](https://github.com/deepseek-ai/dsh) 的 Agnes AI 集成插件 ——
提供 LLM 供应商接入（多模态）、图像/视频生成工具，以及设置面板。

[English](README.md)

## 功能

| 组成 | 说明 |
| --- | --- |
| **供应商** | `agnes-ai`，通过 `llm-pi-ai` 适配器接入（OpenAI 兼容 Chat Completions） |
| **对话模型** | `agnes-2.5-flash`、`agnes-3.0-flash`、`agnes-2.5-pro`、`agnes-2.5-pro-beta`，均支持图像输入 |
| **工具** | `agnes_image_generation`、`agnes_video_generation`、`agnes_record_generation` |
| **设置面板** | 在「设置」中新增 **Agnes AI** 分区，展示实时配置与模型目录 |

## 安装

```bash
dsh plugin install agnes-ai-for-dsh
```

或在 profile 的 `package.json` 中加入依赖后重新安装：

```json
{
  "dependencies": {
    "agnes-ai-for-dsh": "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"
  }
}
```

然后把该 bundle 加入 `dsh.profile.bundles`，并重启 DSH。

## 配置

供应商已由 `cordis.patch.yml` 预声明，因此只需提供 API Key：

1. 打开 **设置 → 模型**。
2. 找到 **Agnes AI**，填入 API Key。
3. Key 由 DSH 凭据系统保存，引用名为 `AGNES_AI_API_KEY`。

默认使用中国站端点：

```
https://api.agnes-ai.cn/v1
```

如需国际站，把 `baseURL` 改为 `https://apihub.agnes-ai.com/v1` —— 可在
`cordis.patch.yml` 中修改，也可直接在「设置 → 模型」里改。

## 使用

启用后，模型即可调用两个媒体工具：

- **`agnes_image_generation`** —— 文生图、图生图、多图合成。参数：
  `model`、`prompt`、`size`（`1K`–`4K`）、可选 `ratio`、可选 `image`（输入图 URL）、
  可选 `return_base64`。
- **`agnes_video_generation`** —— 异步视频生成并自动轮询。参数：
  `model`、`prompt`，可选 `seconds`、`mode`、`size`、`aspect_ratio`
  以及各模式专属的媒体字段。

视频为异步任务：工具先创建任务，再轮询
`GET /agnesapi?video_id=…&model_name=…` 直至完成。`agnes-video-2.5-flash`
仅支持 `720P`；`agnes-video-2.5` 支持 `720P`、`1080P`、`1K`、`2K`。

## 维护者须知

### 工具 schema

宿主的 `defineTool` **不接受**原生 JSON Schema —— 它要求一种「属性表 DSL」，
每个条目可自带 `required: true`，由它自己编译成 object 为根的 JSON Schema。

该 DSL **不是合法 JSON Schema**。一旦未经转换就发给供应商，供应商会拒绝
**整个请求**（WorkBuddy 返回 HTTP 400，code 11129，「工具定义不合规」），
于是该会话的每一次模型回复都失败，而不只是那一个工具。这不是假设：
ESM 模块里的裸 `require()` 抛错被静默吞掉、由恒等 fallback 原样注册 DSL，
就是这样发生的一次真实事故。

防线在 `src/tools.ts`：

- `compileParameters()` 在本插件内完成编译，正确性不依赖宿主 helper。
- `assertValidCompiledSchema()` / `assertAllToolSchemas()` 在加载时校验
  **编译后**的形状，非法即抛错 —— 让错误在插件启动时暴露，而不是污染每个请求。
- 注册前会复查 `defineTool` 实际产出的参数，若原始 DSL 残留则拒绝注册。

`verify.mjs` 会用真实 `defineTool` 完整验证上述各点。

### 构建

```bash
npm install
npm run build
```

`lib/` 是提交进仓库的：本包从 git 安装，而消费方 profile 不会执行构建脚本。
**改动 `src/` 后务必先构建再提交**，否则发布的是过期的 `lib/`。

## 许可证

MIT
