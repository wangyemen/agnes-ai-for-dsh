# DeepSeek Harness 用 Agnes AI 插件

[English](README.md) | 中文

## 概述

本插件将 [Agnes AI](https://agnes-ai.cn) 的能力集成到 DeepSeek Harness 平台，提供：

### 文本模型 (对话/推理)
| 模型 | 价格 | 说明 |
|------|------|------|
| `agnes-2.5-flash` | **免费** | 多模态对话·编码优化·智能体工作流 |
| `agnes-3.0-flash` | **免费** | 新一代Agent编程模型·工具调用强化 |
| `agnes-2.5-pro` | **付费** | 高级推理·科学计算·长上下文分析 |
| `agnes-2.5-pro-beta` | **付费** | 打榜模型·Artificial Analysis评测 |

### 图像生成模型 (生图)
| 模型 | 价格 | 说明 |
|------|------|------|
| `agnes-image-2.1-flash` | **免费** | 文生图·图生图·多图合成 |
| `agnes-image-2.5-flash` | **免费** | 最新一代图像模型·全面超越2.1版本 |

### 视频生成模型 (生视频)
| 模型 | 价格 | 说明 |
|------|------|------|
| `agnes-video-v2.0` | **免费** | 文生视频·图生视频·关键帧动画 |
| `agnes-video-25-flash` | **免费** | 异步任务API·720P专享 |
| `agnes-video-25` | **付费** | 多分辨率·首尾帧控制·多模态参考 |

## 功能特性

- **付费模型确认**: 选择付费模型时会提示用户确认
- **默认免费模型**: 免费模型默认选中
- **多端点支持**: 中国版 API (`api.agnes-ai.cn`) 和国际版 API (`apihub.agnes-ai.com`)
- **GUI 设置面板**: 通过 Web 界面配置 Agnes AI

## 安装

### 方法一：使用 DSH 插件命令

```bash
# Web GUI（推荐）
dsh plugin --profile web add agnes-ai-for-dsh

# 命令行无界面模式
dsh plugin --profile headless add agnes-ai-for-dsh
```

### 方法二：手动安装

添加到 profile 的 `package.json`：

```json
{
  "name": "my-profile",
  "private": true,
  "dsh": {
    "profile": {
      "bundles": ["@deepseek-ai/dsh-base", "agnes-ai-for-dsh"]
    }
  },
  "dependencies": {
    "agnes-ai-for-dsh": "file:./path/to/agnes-ai-for-dsh"
  }
}
```

## 配置

### 环境变量

```bash
export AGNES_API_KEY=your_api_key_here
```

### 设置页面

安装插件后，在 DSH Web GUI 的 **设置 → 模型** 中：
1. 输入 API Key
2. 选择要启用的模型
3. 选择中国版或国际版端点

## API 端点

| 端点 | 基础 URL |
|------|----------|
| 中国版 API | `https://api.agnes-ai.cn/v1` |
| 国际版 API | `https://apihub.agnes-ai.com/v1` |

## 模型详情

### 文本模型

所有文本模型支持：
- OpenAI 兼容的 Chat Completions API
- 图像输入（多模态）
- 工具调用
- 流式响应
- 思考模式
- 512K 上下文窗口

### 图像模型

支持：
- 文生图生成
- 图生图变换
- 多图合成
- 尺寸：1K, 2K, 3K, 4K
- 宽高比：1:1, 16:9, 9:16 等
- URL 或 Base64 输出

### 视频模型

支持：
- 文生视频生成
- 图生视频动画
- 关键帧动画
- 异步任务 API
- 分辨率：480p, 720p, 1080p, 1K, 2K

## 定价汇总

| 类别 | 模型 | 价格 |
|------|------|------|
| 文本 | 2.5 Flash, 3.0 Flash | **免费** |
| 文本 | 2.5 Pro, 2.5 Pro Beta | 付费（约 ¥0.35/M 输入，¥1.00/M 输出） |
| 图像 | 2.1 Flash, 2.5 Flash | **免费** |
| 视频 | V2.0, 2.5 Flash | **免费** |
| 视频 | 2.5 | 付费（¥0.15-0.35/秒） |

## API 文档

完整 API 文档请前往 Agnes AI 平台查看：
- 中国站：https://platform.agnes-ai.cn/
- 国际站：https://platform.agnes-ai.com/

## 许可证

MIT
