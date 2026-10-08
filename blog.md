# 给 DeepSeek Harness 加一套生图生视频能力

## 背景

DeepSeek Harness 是一个运行在本地的 AI 助手框架，底层用的是 DeepSeek 自家的模型。DeepSeek 的模型很强，但有一个局限——它们只能处理文本和代码，不支持图像和视频的生成。

如果你想让 DSH 里的 agent 能够画图、生成视频，就需要额外的工具。市面上有不少生成模型，我注意到 [Agnes AI](https://agnes-ai.cn) 提供了一套比较完整的方案：免费的多模态对话模型、图像生成、视频生成，而且 API 是 OpenAI 兼容的。

所以我做了这个插件：**agnes-ai-for-dsh**，把 Agnes AI 的能力直接接入 DSH。

## 插件做了什么

插件在三个层面扩展了 DSH：

**1. LLM Provider**

DSH 默认支持 DeepSeek 自己的模型。这个插件通过 Cordis 框架注册了一个 `agnes-ai` provider，用户可以在设置里切换到 `agnes-2.5-flash` 或 `agnes-3.0-flash`（都是免费的）来用多模态对话，或者用 Pro 版本做更强的推理。

**2. 生图工具**

注册了 `agnes_image_generation` 工具。agent 在对话中如果被要求生成图片，就会自动调用这个工具，而不是自己去写 curl 命令。工具接收提示词、模型、尺寸、宽高比等参数，调 Agnes API，然后把结果 URL 返回给 agent，同时把这次生成记录到 DSH 的设置存储里。

**3. 生视频工具**

和图像一样，注册了 `agnes_video_generation` 工具。视频生成是异步的：先 `POST /v1/videos` 拿到 `video_id`，再轮询 `GET /agnesapi?video_id=...&model_name=...` 直到 `status` 变成 `completed`（最多约 3 分钟），最后从响应的顶层 `url` 取视频地址。

需要说明的是，Agnes 的视频模型在这期间换代了：最早的 `agnes-video-v2.0` 已被官方下线，现在的模型 ID 是 `agnes-video-2.5-flash`（限时免费，仅支持 720P）和 `agnes-video-2.5`（付费，支持 720P/1080P/1K/2K）。顺带一提，官方文档里的 ID 带小数点（`2.5`），写成 `25` 会 400 —— 这个坑我踩过。另外一个坑是完成后的视频地址：v2.0 时代在 `metadata.url`，2.5 系列改到了顶层 `url`。

**4. 自动检测**

有时候 agent 会绕过工具，直接用 PowerShell + curl 调用 Agnes API。插件注册了一个 `tools/execute` 钩子，监听所有工具执行，从输出里识别 Agnes 的 CDN 域名并自动记录到生成历史里。

这里有个细节值得记一笔：Agnes 的 CDN 域名换过。图片走的是 `cos-platform-outputs.agnes-ai.cn`，而旧版 v2.0 的文档里视频示例用的是 `platform-outputs.agnes-ai.space`。如果只白名单其中一个，换域名之后整条自动检测链路会静默失效——不报错，就是不记录。所以两个域名都保留在匹配规则里。

**5. GUI 设置面板**

在 DSH 的设置侧边栏加了一个 "Agnes AI" 入口。进去可以看到：
- 当前是否已配置 provider
- API Key 状态
- 所有可用模型列表（文本/图像/视频分三类）
- 之前的生成记录，支持预览、删除和分页

## 技术细节

### 为什么用 Cordis

DSH 的插件架构基于 Cordis 框架。Cordis 提供了一套完整的类型系统和生命周期管理，插件需要实现 `apply(ctx)` 函数，通过 `ctx.inject(['tools', 'settings'])` 拿到工具注册器和设置存储，然后按需注册。

这个项目的核心结构：
- `src/index.ts` — 插件入口，注册 provider、工具和钩子
- `src/client/index.ts` — React 组件，渲染设置面板
- `src/tools/image.ts` / `src/tools/video.ts` — 工具的实现逻辑
- `src/types.ts` — TypeScript 类型定义

### OpenAI 兼容的好处

Agnes AI 的 API 格式和 OpenAI 一致，这意味着：
- 图像生成走 `/images/generations` 端点，请求体和响应格式都和 OpenAI 对齐
- 视频生成虽然不在标准 OpenAI 规范里，但也用了类似的 `extra_body` 传参方式
- 多模态对话直接复用 OpenAI Chat Completions API

不用为每个能力单独写适配层，大大减少了代码量。

### 异步轮询的处理

视频生成最麻烦的地方在于它是异步的。API 返回 `video_id` 后，需要定期查询任务状态。我的实现里：
- 每 2 秒轮询一次
- 最多尝试 90 次（约 3 分钟）
- 进度通过 `onProgress` 回调更新到记录里
- 网络抖动时自动重试，不中断

### 历史记录的设计

生成记录存在 DSH 的 settings namespace 里（`agnes-generations`），格式是 JSON 数组。每条记录包含 id、类型、提示词、模型、状态、URL、创建时间等字段。面板里分页展示（每页 4 条），支持删除。

## 安装和使用

```bash
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"
```

首次安装需要在 `pnpm-workspace.yaml` 的 `allowBuilds` 里加上插件地址（pnpm 的安全机制会拦截未授权的构建脚本）。然后在 DSH 设置里配置 API Key 就行，不需要手动设环境变量。

## 实际效果

配好之后，在 DSH 里选一个 Agnes AI 的模型（比如 `agnes-2.5-flash`），然后直接对 agent 说：

- "画一只在月球上喝咖啡的猫"
- "生成一个 5 秒的夕阳视频"

agent 会自动调用对应的生成工具，结果会显示在对话里，同时记录到设置面板的生成历史中。如果想换回 DeepSeek 原生模型，直接在设置里切换就行，不影响其他功能。

## 总结

这个插件本质上是在 DSH 的插件体系里，把 Agnes AI 的几项能力（对话、生图、生视频）包装成原生可用的工具。DeepSeek 的模型负责理解和决策，Agnes AI 负责产出图像和视频——两者配合，弥补了 DeepSeek 原生不支持多媒体生成的短板。

代码在 [github.com/wangyemen/agnes-ai-for-dsh](https://github.com/wangyemen/agnes-ai-for-dsh)，有问题可以提 issue。
