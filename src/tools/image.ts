/**
 * Agnes AI Image Generation Tool
 * 
 * Generates images using Agnes AI's image generation models.
 */

import { createTool } from '@deepseek-ai/cordis'

export const agnesImageTool = createTool({
  name: 'agnes_image_generation',
  description: `Generate images using Agnes AI.
  
Supports text-to-image and image-to-image generation.
Returns an image URL that can be displayed.

Parameters:
- prompt: Text description of the image to generate
- size: Image size (1K, 2K, 3K, 4K)
- ratio: Aspect ratio (1:1, 16:9, 9:16, etc.)
- image: Input image URL for image-to-image (optional)`,
  inputSchema: {
    type: 'object',
    properties: {
      prompt: { type: 'string', description: 'Text prompt for image generation' },
      size: { type: 'string', enum: ['1K', '2K', '3K', '4K'], description: 'Output size' },
      ratio: { type: 'string', enum: ['1:1', '16:9', '9:16', '4:3', '3:4'], description: 'Aspect ratio' },
      image: { type: 'string', description: 'Input image URL for image-to-image' }
    },
    required: ['prompt', 'size']
  },
  async execute(args: any, ctx: any) {
    const apiKey = process.env.AGNES_API_KEY || ctx?.credentials?.get?.('agnes')?.apiKey
    
    if (!apiKey) {
      return { error: 'AGNES_API_KEY not configured. Please set the environment variable.' }
    }

    try {
      const response = await fetch('https://api.agnes-ai.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'agnes-image-2.5-flash',
          prompt: args.prompt,
          size: args.size,
          ratio: args.ratio || '1:1'
        })
      })

      const data = await response.json()
      
      if (data.data?.[0]?.url) {
        return {
          success: true,
          image_url: data.data[0].url,
          message: `Image generated successfully: ${data.data[0].url}`
        }
      }
      
      return { error: 'Failed to generate image', data }
    } catch (error: any) {
      return { error: error.message }
    }
  }
})