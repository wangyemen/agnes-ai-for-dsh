/**
 * Agnes AI Settings Panel for DSH Web GUI
 *
 * Provides a settings panel for configuring Agnes AI models,
 * with paid model confirmation dialogs.
 */
export declare const agnesAISettingsPlugin: any;
export interface AgnesModelInfo {
    id: string;
    name: string;
    description: string;
    isFree: boolean;
    category: 'text' | 'image' | 'video';
    contextWindow?: number;
    maxTokens?: number;
    supportsImage?: boolean;
    pricing?: Record<string, string>;
}
export interface AgnesProviderConfig {
    displayName: string;
    api: 'openai-completions';
    baseURL: string;
    models: AgnesModelInfo[];
}
