# DeepSeek Harness 用 Agnes AI 插件

[English](README.md) | 中文

## 概述

本插件将 [Agnes AI](https://agnes-ai.cn) 集成到 DeepSeek Harness，作为：
1. **LLM 提供商** - 支持多模态（图像理解）
2. **工具** - 图像和视频生成

## 功能特性

### LLM 提供商 (agnes-ai)
- 多模态对话，支持图像理解
- 多种模型：Flash（免费）、Pro（付费）
- OpenAI 兼容 API
- 流式响应
- 思考模式支持

### 工具
- `agnes_image_generation` - 生成图像
- `agnes_video_generation` - 生成视频

## 安装

```bash
# 从 GitHub（测试用）
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"

# 从 npm（发布后）
dsh plugin --profile web add agnes-ai-for-dsh
```

## 配置

### 1. 设置 API Key

```bash
export AGNES_API_KEY=你的API密钥
```

### 2. 在设置中添加提供商

进入 **设置 → 模型**，添加新提供商：

- **提供商 ID**: `agnes-ai`
- **显示名称**: `Agnes AI`
- **API**: `openai-completions`
- **基础 URL**: `https://api.agnes-ai.cn/v1`
- **模型**:
  - `agnes-2.5-flash`（免费，多模态）
  - `agnes-3.0-flash`（免费，多模态）
  - `agnes-2.5-pro`（付费，多模态）
  - `agnes-image-2.5-flash`（免费，图像生成）
  - `agnes-video-25-flash`（免费，视频生成）

### 3. 启用多模态

确保为文本模型勾选**"图像"**选项以启用图像理解。

## 使用方式

### 带图像理解的文本对话

1. 选择 Agnes AI 模型（如 `agnes-2.5-flash`）
2. 在对话中上传图片
3. 询问关于图像的问题

### 生成图像

代理可以使用 `agnes_image_generation` 工具：
- 用户："生成一张夕阳的图片"
- 代理：调用 `agnes_image_generation` 工具
- 代理：返回图像 URL

### 生成视频

代理可以使用 `agnes_video_generation` 工具：
- 用户："生成一个猫走路的视频"
- 代理：调用 `agnes_video_generation` 工具
- 代理：返回视频任务 ID

## API 文档

访问 Agnes AI 平台查看 API 文档：
- 中国站：https://platform.agnes-ai.cn/
- 国际站：https://platform.agnes-ai.com/

## 许可证

MIT