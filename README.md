# Agnes AI Plugin for DeepSeek Harness

English | [中文](README.zh.md)

## Overview

This plugin integrates [Agnes AI](https://agnes-ai.cn) capabilities into the DeepSeek Harness platform, providing:

### Text Models (对话/推理)
| Model | Price | Description |
|-------|-------|-------------|
| `agnes-2.5-flash` | **Free** | Multimodal chat, code optimization, agent workflows |
| `agnes-3.0-flash` | **Free** | Next-gen Agent coding model, enhanced tool calling |
| `agnes-2.5-pro` | **Paid** | Advanced reasoning, scientific computing, long context |
| `agnes-2.5-pro-beta` | **Paid** | Benchmark model, Artificial Analysis rated |

### Image Generation Models (生图)
| Model | Price | Description |
|-------|-------|-------------|
| `agnes-image-2.1-flash` | **Free** | Text-to-image, image-to-image, multi-image synthesis |
| `agnes-image-2.5-flash` | **Free** | Latest generation, surpasses 2.1 in all aspects |

### Video Generation Models (生视频)
| Model | Price | Description |
|-------|-------|-------------|
| `agnes-video-v2.0` | **Free** | Text-to-video, image-to-video, keyframe animation |
| `agnes-video-25-flash` | **Free** | Async task API, 720P only |
| `agnes-video-25` | **Paid** | Multiple resolutions, first/last frame control |

## Features

- **Paid Model Confirmation**: When selecting a paid model, the plugin will prompt for confirmation before use
- **Default Free Models**: Free models are selected by default
- **Multi-endpoint Support**: China API (`api.agnes-ai.cn`) and Global API (`apihub.agnes-ai.com`)
- **GUI Settings Panel**: Configure Agnes AI through the web interface

## Installation

### Method 1: Using DSH Plugin Command

```bash
# For Web GUI (recommended)
dsh plugin --profile web add agnes-ai-for-dsh

# For headless CLI mode
dsh plugin --profile headless add agnes-ai-for-dsh
```

### Method 2: Manual Installation

Add to your profile's `package.json`:

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

## Configuration

### Environment Variables

```bash
export AGNES_API_KEY=your_api_key_here
```

### Settings Page

After installing the plugin, go to **Settings → Models** in the DSH web GUI to:
1. Enter your API key
2. Select which models to enable
3. Choose between China and Global endpoints

## API Endpoints

| Endpoint | Base URL |
|----------|----------|
| China API | `https://api.agnes-ai.cn/v1` |
| Global API | `https://apihub.agnes-ai.com/v1` |

## Model Details

### Text Models

All text models support:
- OpenAI-compatible Chat Completions API
- Image input (multimodal)
- Tool calling
- Streaming responses
- Thinking mode
- 512K context window

### Image Models

Support:
- Text-to-image generation
- Image-to-image transformation
- Multi-image composition
- Sizes: 1K, 2K, 3K, 4K
- Ratios: 1:1, 16:9, 9:16, etc.
- URL or Base64 output

### Video Models

Support:
- Text-to-video generation
- Image-to-video animation
- Keyframe animation
- Async task-based API
- Resolutions: 480p, 720p, 1080p, 1K, 2K

## Pricing Summary

| Category | Models | Price |
|----------|--------|-------|
| Text | 2.5 Flash, 3.0 Flash | **Free** |
| Text | 2.5 Pro, 2.5 Pro Beta | Paid (~¥0.35/M input, ~¥1.00/M output) |
| Image | 2.1 Flash, 2.5 Flash | **Free** |
| Video | V2.0, 2.5 Flash | **Free** |
| Video | 2.5 | Paid (¥0.15-0.35/second) |

## API Documentation

For complete API documentation, visit the Agnes AI platform:
- China: https://platform.agnes-ai.cn/
- Global: https://platform.agnes-ai.com/

## License

MIT
