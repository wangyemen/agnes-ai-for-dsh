/**
 * Agnes AI Video Generation Tool
 *
 * Generates videos using Agnes AI's video generation models.
 */
import { createTool } from '@deepseek-ai/cordis';
export const agnesVideoTool = createTool({
    name: 'agnes_video_generation',
    description: `Generate videos using Agnes AI.
  
Supports text-to-video and image-to-video generation.
Returns a video URL after generation completes.

Parameters:
- prompt: Text description of the video
- image: Input image URL for image-to-video (optional)
- seconds: Video duration in seconds (default: 5)
- size: Resolution (480P, 720P, 1080P)
- aspect_ratio: Video aspect ratio (16:9, 9:16, 1:1)`,
    inputSchema: {
        type: 'object',
        properties: {
            prompt: { type: 'string', description: 'Text prompt for video generation' },
            image: { type: 'string', description: 'Input image URL for image-to-video' },
            seconds: { type: 'number', description: 'Video duration in seconds' },
            size: { type: 'string', enum: ['480P', '720P', '1080P'], description: 'Resolution' },
            aspect_ratio: { type: 'string', enum: ['16:9', '9:16', '1:1'], description: 'Aspect ratio' }
        },
        required: ['prompt']
    },
    async execute(args, ctx) {
        const apiKey = process.env.AGNES_API_KEY || ctx?.credentials?.get?.('agnes')?.apiKey;
        if (!apiKey) {
            return { error: 'AGNES_API_KEY not configured. Please set the environment variable.' };
        }
        try {
            const response = await fetch('https://api.agnes-ai.cn/v1/videos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'agnes-video-25-flash',
                    prompt: args.prompt,
                    seconds: args.seconds?.toString() || '5',
                    size: args.size || '720P',
                    aspect_ratio: args.aspect_ratio || '16:9'
                })
            });
            const data = await response.json();
            if (data.video_id) {
                return {
                    success: true,
                    video_id: data.video_id,
                    task_id: data.task_id,
                    message: `Video generation started. Video ID: ${data.video_id}. Use this ID to check status.`
                };
            }
            return { error: 'Failed to create video task', data };
        }
        catch (error) {
            return { error: error.message };
        }
    }
});
//# sourceMappingURL=video.js.map