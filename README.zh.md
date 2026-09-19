# DeepSeek Harness 用 Agnes AI 工具插件

[English](README.md) | 中文

## 概述

本插件为 DSH 代理添加 Agnes AI 的**工具**：

- **图像生成**: 文生图、图生图
- **视频生成**: 文生视频、图生视频

图像理解由现有的 LLM 提供商（DeepSeek vision 等）处理。

## 功能特性

### 图像生成 (`agnes_image_generation`)
- 文本提示 → 图像
- 图像编辑和变换
- 多种尺寸：1K, 2K, 3K, 4K

### 视频生成 (`agnes_video_generation`)
- 文本提示 → 视频
- 图像动画
- 多种分辨率

## 安装

```bash
# 从 GitHub（测试用）
dsh plugin --profile web add "git+https://github.com/wangyemen/agnes-ai-for-dsh.git"

# 从 npm（发布后）
dsh plugin --profile web add agnes-ai-for-dsh
```

## 配置

设置 Agnes AI API Key：

```bash
export AGNES_API_KEY=你的API密钥
```

## 使用方式

代理将自动获得以下新工具：
- `agnes_image_generation` - 生成图像
- `agnes_video_generation` - 生成视频

示例对话：
1. 用户："生成一张夕阳下大海的图像"
2. 代理：使用 `agnes_image_generation` 工具创建图像
3. 代理：将图像 URL 返回给用户

## 许可证

MIT