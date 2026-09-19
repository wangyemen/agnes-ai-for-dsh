/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides:
 * 1. A dedicated Agnes AI settings panel in the DSH sidebar
 * 2. Detection of whether the agnes-ai provider is configured
 * 3. Display of configured models and their status
 * 4. Quick-add guidance for new users
 */
export interface AgnesModelInfo {
    id: string;
    name: string;
    description: string;
    isFree: boolean;
    category: 'text' | 'image' | 'video';
    supportsImageInput?: boolean;
    contextWindow?: number;
    maxTokens?: number;
}
export interface AgnesProviderState {
    exists: boolean;
    hasApiKey: boolean;
    models: AgnesModelInfo[];
    error?: string;
}
export declare const AGNES_MODELS: AgnesModelInfo[];
/**
 * Check if the agnes-ai provider is registered in the LLM adapter list.
 * This runs on the host side where we have access to ctx.llm.
 */
export declare function checkProviderExists(ctx: any): boolean;
/**
 * Get the full provider state including API key status and configured models.
 */
export declare function getProviderState(ctx: any): Promise<AgnesProviderState>;
/**
 * Read the current llm-pi-ai settings to check if agnes-ai provider is configured.
 */
export declare function readAgnesSettings(ctx: any): Promise<{
    configured: boolean;
    hasApiKey: boolean;
    models: string[];
}>;
export declare const name = "agnes-ai-for-dsh-client";
export declare function apply(ctx: any): void;
//# sourceMappingURL=index.d.ts.map