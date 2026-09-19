# Agnes AI Plugin for DeepSeek Harness

English | [中文](README.zh.md)

## Overview

This plugin integrates [Agnes AI](https://agnes-ai.cn) into DeepSeek Harness as both:
1. **LLM Provider** - with multimodal support (image understanding)
2. **Tools** - for image and video generation

## Features

### LLM Provider (agnes-ai)
- Multimodal chat with image understanding
- Multiple models: Flash (free), Pro (paid)
- OpenAI-compatible API
- Streaming responses
- Thinking mode support

### Tools
- `agnes_image_generation` - Generate images
- `agnes_video_generation` - Generate videos

## Installation

```bash
# From GitHub (testing)
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"

# From npm (after published)
dsh plugin --profile web add agnes-ai-for-dsh
```

## Configuration

### 1. Set API Key

```bash
export AGNES_API_KEY=your_api_key_here
```

### 2. Add Provider in Settings

Go to **Settings → Models** and add a new provider:

- **Provider ID**: `agnes-ai`
- **Display Name**: `Agnes AI`
- **API**: `openai-completions`
- **Base URL**: `https://api.agnes-ai.cn/v1`
- **Models**:
  - `agnes-2.5-flash` (Free, multimodal)
  - `agnes-3.0-flash` (Free, multimodal)
  - `agnes-2.5-pro` (Paid, multimodal)
  - `agnes-image-2.5-flash` (Free, image generation)
  - `agnes-video-25-flash` (Free, video generation)

### 3. Enable Multimodal

Make sure to check the **"Image"** option for text models to enable image understanding.

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

## API Documentation

Visit the Agnes AI platform for API docs:
- China: https://platform.agnes-ai.cn/
- Global: https://platform.agnes-ai.com/

## License

MIT