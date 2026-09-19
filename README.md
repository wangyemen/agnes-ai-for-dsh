# Agnes AI Plugin for DeepSeek Harness

English | [中文](README.zh.md)

## Overview

This plugin integrates [Agnes AI](https://agnes-ai.cn) into DeepSeek Harness as both:
1. **LLM Provider** - with multimodal support (image understanding)
2. **Tools** - for image and video generation
3. **GUI Settings Panel** - dedicated Agnes AI section in DSH settings

## Features

### LLM Provider (agnes-ai)
- Multimodal chat with image understanding
- Multiple models: Flash (free), Pro (paid)
- OpenAI-compatible API (`openai-completions`)
- Streaming responses
- Thinking mode support

### Image Generation
- `agnes_image_generation` tool for text-to-image and image-to-image
- Models: agnes-image-2.1-flash, agnes-image-2.5-flash

### Video Generation
- `agnes_video_generation` tool for text-to-video and image-to-video
- Async task-based generation with polling support
- Models: agnes-video-v2.0, agnes-video-25-flash, agnes-video-25

### GUI Settings Panel
- **Agnes AI button** in the DSH settings sidebar
- Automatic detection of `agnes-ai` provider configuration
- Shows configured models and their status
- Guidance for new users to add the provider

## Installation

```bash
# From GitHub (testing)
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"

# From npm (after published)
dsh plugin --profile web add agnes-ai-for-dsh
```

## Configuration

### Quick Start (Recommended)

The plugin automatically injects the `agnes-ai` provider configuration. You only need to:

1. Go to **Settings → Models**
2. Find **Agnes AI** in the provider list
3. Enter your API Key in the **API Key** field
4. Click **Save**

That's it! The API key is saved through DSH's built-in credentials system.

### Manual Configuration

If you prefer to set up manually:

**Provider Settings:**
- **Provider ID**: `agnes-ai`
- **Display Name**: `Agnes AI`
- **API**: `openai-completions`
- **Base URL**: `https://api.agnes-ai.cn/v1` (China) or `https://apihub.agnes-ai.com/v1` (Global)
- **Models**:
  - `agnes-2.5-flash` (Free, multimodal)
  - `agnes-3.0-flash` (Free, multimodal)
  - `agnes-2.5-pro` (Paid, multimodal)
  - `agnes-image-2.5-flash` (Free, image generation)
  - `agnes-video-25-flash` (Free, video generation)

**API Key:** Enter your Agnes AI API key in the provider's API Key field. It will be saved securely by DSH.

### 3. Using the Agnes AI Settings Panel

1. Click the **Agnes AI** button in the settings sidebar
2. If not configured, you'll see guidance to add the provider
3. If configured, you'll see:
   - Provider status (configured/not configured)
   - API key status
   - List of all available models
   - Model categories (text/image/video)

## Usage

### Text Chat with Image Understanding

1. Select an Agnes AI model (e.g., `agnes-2.5-flash`)
2. Upload an image in the chat
3. Ask questions about the image

### Generate Images

The agent can use the `agnes_image_generation` tool:
- User: "Generate an image of a sunset"
- Agent: Calls `agnes_image_generation` tool
- Agent: Returns the image URL

### Generate Videos

The agent can use the `agnes_video_generation` tool:
- User: "Generate a video of a cat walking"
- Agent: Calls `agnes_video_generation` tool
- Agent: Returns the video task ID

## Model Catalog

### Text Models (Multimodal)
| Model | Price | Context | Max Output | Image Input |
|-------|-------|---------|------------|-------------|
| agnes-2.5-flash | Free | 512K | 64K | Yes |
| agnes-3.0-flash | Free | 512K | 64K | Yes |
| agnes-2.5-pro | Paid | 512K | 64K | Yes |
| agnes-2.5-pro-beta | Paid | 512K | 64K | Yes |

### Image Models
| Model | Price | Description |
|-------|-------|-------------|
| agnes-image-2.1-flash | Free | Text/Image to image |
| agnes-image-2.5-flash | Free | Latest generation |

### Video Models
| Model | Price | Description |
|-------|-------|-------------|
| agnes-video-v2.0 | Free | Text/Image to video |
| agnes-video-25-flash | Free | Async API, 720P |
| agnes-video-25 | Paid | Multi-resolution |

## API Documentation

Visit the Agnes AI platform for API docs:
- China: https://platform.agnes-ai.cn/
- Global: https://platform.agnes-ai.com/

## License

MIT
