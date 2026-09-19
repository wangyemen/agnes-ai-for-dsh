# DeepSeek Harness 用 Agnes AI 插件

[English](README.md) | 中文

## 概述

本插件将 [Agnes AI](https://agnes-ai.cn) 集成到 DeepSeek Harness，作为：
1. **LLM 提供商** - 支持多模态（图像理解）
2. **工具** - 图像和视频生成
3. **GUI 设置面板** - DSH 设置中的 Agnes AI 专属侧边栏

## 功能特性

### LLM 提供商 (agnes-ai)
- 多模态对话，支持图像理解
- 多种模型：Flash（免费）、Pro（付费）
- OpenAI 兼容 API (`openai-completions`)
- 流式响应
- 思考模式支持

### 图像生成
- `agnes_image_generation` 工具，支持文生图和图生图
- 模型：agnes-image-2.1-flash, agnes-image-2.5-flash

### 视频生成
- `agnes_video_generation` 工具，支持文生视频和图生视频
- 异步任务生成，支持轮询查询
- 模型：agnes-video-v2.0, agnes-video-25-flash, agnes-video-25

### GUI 设置面板
- DSH 设置侧边栏中的 **Agnes AI 按钮**
- 自动检测 `agnes-ai` 提供商配置状态
- 显示已配置的模型及其状态
- 为新用户提供添加指南

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

或通过 DSH 凭证系统设置。

### 2. 添加提供商（自动或手动）

**自动（通过插件）：**
插件通过 `cordis.patch.yml` 自动注入 `agnes-ai` 提供商配置。

**手动：**
进入 **设置 → 模型**，添加新提供商：
- **提供商 ID**: `agnes-ai`
- **显示名称**: `Agnes AI`
- **API**: `openai-completions`
- **基础 URL**: `https://api.agnes-ai.cn/v1`（中国站）或 `https://apihub.agnes-ai.com/v1`（国际站）
- **模型**:
  - `agnes-2.5-flash`（免费，多模态）
  - `agnes-3.0-flash`（免费，多模态）
  - `agnes-2.5-pro`（付费，多模态）
  - `agnes-image-2.5-flash`（免费，图像生成）
  - `agnes-video-25-flash`（免费，视频生成）

### 3. 使用 Agnes AI 设置面板

1. 点击设置侧边栏中的 **Agnes AI** 按钮
2. 如果未配置，将看到添加提供商的引导
3. 如果已配置，将看到：
   - 提供商状态（已配置/未配置）
   - API Key 状态
   - 所有可用模型列表
   - 模型分类（文本/图像/视频）

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

## 模型目录

### 文本模型（多模态）
| 模型 | 价格 | 上下文 | 最大输出 | 图像输入 |
|------|------|--------|----------|----------|
| agnes-2.5-flash | 免费 | 512K | 64K | 是 |
| agnes-3.0-flash | 免费 | 512K | 64K | 是 |
| agnes-2.5-pro | 付费 | 512K | 64K | 是 |
| agnes-2.5-pro-beta | 付费 | 512K | 64K | 是 |

### 图像模型
| 模型 | 价格 | 描述 |
|------|------|------|
| agnes-image-2.1-flash | 免费 | 文生图·图生图 |
| agnes-image-2.5-flash | 免费 | 最新一代 |

### 视频模型
| 模型 | 价格 | 描述 |
|------|------|------|
| agnes-video-v2.0 | 免费 | 文生视频·图生视频 |
| agnes-video-25-flash | 免费 | 异步API，720P |
| agnes-video-25 | 付费 | 多分辨率 |

## API 文档

访问 Agnes AI 平台查看 API 文档：
- 中国站：https://platform.agnes-ai.cn/
- 国际站：https://platform.agnes-ai.com/

## 许可证

MIT
