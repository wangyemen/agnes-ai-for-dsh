/**
 * Agnes AI Image Generation Tool
 *
 * Generates images using Agnes AI's image generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */
/**
 * Generate an image using Agnes AI's API.
 */
export async function generateImage(options, config) {
    const { model, prompt, size, ratio, image, returnBase64 } = options;
    try {
        const requestBody = {
            model,
            prompt,
            size,
        };
        if (ratio) {
            requestBody.ratio = ratio;
        }
        if (image && image.length > 0) {
            requestBody.image = image;
        }
        if (returnBase64) {
            requestBody.return_base64 = true;
        }
        const response = await fetch(`${config.baseURL}/images/generations`, {
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
        if (data.data?.[0]) {
            return {
                success: true,
                imageUrl: data.data[0].url || undefined,
                base64Data: data.data[0].b64_json || undefined,
                revisedPrompt: data.data[0].revised_prompt || undefined,
            };
        }
        return { success: false, error: 'No image data in response' };
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
    }
}
//# sourceMappingURL=image.js.map