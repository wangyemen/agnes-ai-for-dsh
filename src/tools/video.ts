/**
 * Agnes AI Video Generation Tool
 *
 * Generates videos using Agnes AI's video generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */

export interface AgnesVideoToolConfig {
  apiKey: string
  /** Base URL for Agnes AI API. Use https://api.agnes-ai.cn/v1 for China or https://apihub.agnes-ai.com/v1 for Global */
  baseURL: string
}

export interface AgnesVideoGenerationOptions {
  model: string
  prompt: string
  /** 字符串 `"4"`–`"12"`，默认 `"5"` */
  seconds?: string
  /** `text` | `keyframe` | `reference` */
  mode?: 'text' | 'keyframe' | 'reference'
  /** Flash 仅支持 `720P` */
  size?: '720P' | '1080P' | '1K' | '2K'
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9'
  /** `keyframe` 模式首帧 */
  firstFrame?: string
  /** `keyframe` 模式尾帧 */
  lastFrame?: string
  /** `reference` 模式参考图片 */
  images?: string[]
  /** `reference` 模式参考音频 */
  audios?: string[]
  seed?: number
}

export interface AgnesVideoTaskResponse {
  success: boolean
  taskId?: string
  videoId?: string
  status?: 'queued' | 'in_progress' | 'completed' | 'failed'
  videoUrl?: string
  progress?: number
  error?: string
}

/**
 * Create a video generation task using Agnes AI's API.
 * Video generation is async - returns a task ID for polling.
 */
export async function generateVideo(
  options: AgnesVideoGenerationOptions,
  config: AgnesVideoToolConfig,
): Promise<AgnesVideoTaskResponse> {
  const { model, prompt, seconds, mode, size, aspectRatio, firstFrame, lastFrame, images, audios, seed } = options;

  try {
    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      mode: mode ?? (firstFrame || lastFrame ? 'keyframe' : 'text'),
    };

    if (seconds) {
      requestBody.seconds = seconds;
    }

    // Flash 固定 720P，其他档位会被服务端以 400 拒绝。
    requestBody.size = model === 'agnes-video-2.5-flash' ? '720P' : size ?? '720P';

    if (aspectRatio) {
      requestBody.aspect_ratio = aspectRatio;
    }

    if (firstFrame) requestBody.first_frame = firstFrame;
    if (lastFrame) requestBody.last_frame = lastFrame;
    if (images?.length) requestBody.images = images;
    if (audios?.length) requestBody.audios = audios;
    if (typeof seed === 'number') requestBody.seed = seed;

    const response = await fetch(`${config.baseURL}/videos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // Use raw error
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();

    if (data.video_id || data.task_id) {
      return {
        success: true,
        taskId: data.task_id || data.id,
        videoId: data.video_id,
        status: data.status,
        progress: data.progress,
        // 顶层 `url` 是 2.5 系列的地址字段。
        videoUrl: data.url ?? data.metadata?.url,
      };
    }

    return { success: false, error: 'Invalid response format' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Poll for video generation completion.
 *
 * 官方推荐 `GET /agnesapi?video_id=<VIDEO_ID>&model_name=<MODEL>`：它适用于
 * `text`、`keyframe`、`reference` 全部模式；不带 `model_name` 的纯 `video_id`
 * 查询仅适用于 `mode: "text"`。所以这里总是带上 model。
 */
export async function pollVideoStatus(
  videoId: string,
  config: AgnesVideoToolConfig,
  model: string,
  pollIntervalMs = 2000,
  maxAttempts = 90,
): Promise<AgnesVideoTaskResponse> {
  const origin = config.baseURL.replace(/\/v1\/?$/, '');

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    try {
      const url =
        `${origin}/agnesapi?video_id=${encodeURIComponent(videoId)}` +
        `&model_name=${encodeURIComponent(model)}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${config.apiKey}` },
      });

      if (!response.ok) {
        // 429 / 网络抖动：退避后重试，不要当成失败。
        continue;
      }

      const data = await response.json();

      if (data.status === 'completed') {
        return {
          success: true,
          taskId: data.task_id || data.id,
          videoUrl: data.url ?? data.metadata?.url,
          status: 'completed',
        };
      }

      if (data.status === 'failed') {
        const message =
          (data.error && (data.error.message || JSON.stringify(data.error))) ||
          'Video generation failed';
        return {
          success: false,
          taskId: data.task_id || data.id,
          status: 'failed',
          error: message,
        };
      }

      // 仍未完成 —— 继续下一次轮询（旧实现在这里就 return 了，等于从不轮询）。
    } catch {
      // 网络抖动，继续下一次轮询
    }
  }

  return {
    success: false,
    taskId: videoId,
    error: 'Video generation timed out',
  };
}
