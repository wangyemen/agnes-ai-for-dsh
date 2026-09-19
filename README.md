# Agnes AI Tools Plugin for DeepSeek Harness

English | [中文](README.zh.md)

## Overview

This plugin adds **tools** to the DSH agent for Agnes AI capabilities:

- **Image Generation**: Text-to-image, image-to-image
- **Video Generation**: Text-to-video, image-to-video

Image understanding is handled by the existing LLM providers (DeepSeek vision, etc.).

## Features

### Image Generation (`agnes_image_generation`)
- Text prompts → images
- Image editing and transformation
- Multiple sizes: 1K, 2K, 3K, 4K

### Video Generation (`agnes_video_generation`)
- Text prompts → videos
- Image animation
- Multiple resolutions

## Installation

```bash
# From GitHub (testing)
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"

# From npm (after published)
dsh plugin --profile web add agnes-ai-for-dsh
```

## Configuration

Set your Agnes AI API key:

```bash
export AGNES_API_KEY=your_api_key_here
```

## Usage

The agent will automatically have access to the new tools:
- `agnes_image_generation` - Generate images
- `agnes_video_generation` - Generate videos

Example conversation:
1. User: "Generate an image of a sunset over the ocean"
2. Agent: Uses `agnes_image_generation` tool to create the image
3. Agent: Returns the image URL to the user

## License

MIT