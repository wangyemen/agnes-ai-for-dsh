/**
 * Agnes AI Video Generation Tool
 *
 * Generates videos using Agnes AI's video generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */
/**
 * Create a video generation task using Agnes AI's API.
 * Video generation is async - returns a task ID for polling.
 */
export async function generateVideo(options, config) {
    const { model, prompt, seconds, mode, size, aspectRatio, image, negativePrompt } = options;
    try {
        const requestBody = {
            model,
            prompt,
        };
        if (seconds) {
            requestBody.seconds = seconds;
        }
        if (mode) {
            requestBody.mode = mode;
        }
        if (size) {
            requestBody.size = size;
        }
        if (aspectRatio) {
            requestBody.aspect_ratio = aspectRatio;
        }
        if (image) {
            requestBody.image = image;
        }
        if (negativePrompt) {
            requestBody.negative_prompt = negativePrompt;
        }
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
            }
            catch {
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
                videoUrl: data.metadata?.url,
            };
        }
        return { success: false, error: 'Invalid response format' };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
}
/**
 * Poll for video generation completion.
 * Returns the final video URL when complete.
 */
export async function pollVideoStatus(taskId, config, pollIntervalMs = 3000, maxAttempts = 60) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
        try {
            const response = await fetch(`${config.baseURL}/videos/${taskId}`, {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
            });
            if (!response.ok) {
                continue;
            }
            const data = await response.json();
            if (data.status === 'completed') {
                return {
                    success: true,
                    taskId,
                    videoUrl: data.metadata?.url,
                    status: 'completed',
                };
            }
            if (data.status === 'failed') {
                return {
                    success: false,
                    taskId,
                    status: 'failed',
                    error: data.error ? JSON.stringify(data.error) : 'Video generation failed',
                };
            }
            // Still in progress
            return {
                success: true,
                taskId,
                status: data.status,
                progress: data.progress,
            };
        }
        catch {
            // Retry
        }
    }
    return {
        success: false,
        taskId,
        error: 'Video generation timed out',
    };
}
//# sourceMappingURL=video.js.map