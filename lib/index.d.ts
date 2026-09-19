/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider
 * 2. Sets up settings namespace for client configuration
 */
import { Schema } from '@deepseek-ai/cordis';
export declare const name = "agnes-ai-for-dsh";
export declare const Config: any;
export type Config = Schema.Infer<typeof Config>;
export declare function apply(ctx: any, config: Config): void;
/**
 * Agnes AI provider configuration template
 */
export declare const AGNES_AI_PROVIDER_CONFIG: {
    displayName: string;
    apiKeyEnv: string;
    api: 'openai-completions';
    baseURL: string;
    models: ({
        id: string;
        name: string;
        contextWindow: number;
        maxTokens: number;
        image: boolean;
        description: string;
    } | {
        contextWindow?: undefined;
        maxTokens?: undefined;
        id: string;
        name: string;
        image: boolean;
        description: string;
    })[];
};
//# sourceMappingURL=index.d.ts.map