/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider configuration
 * 2. Registers image/video generation tools
 * 3. Provides model catalog and API constants
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "agnes-ai-for-dsh";
export interface AgnesModelEntry {
    id: string;
    name: string;
    contextWindow?: number;
    defaultMaxTokens?: number;
    image?: boolean;
    description?: string;
    pricing?: 'free' | 'paid';
    reasoningEfforts?: Record<string, unknown>;
    systemPromptUpdate?: string;
}
export declare const AGNES_TEXT_MODELS: AgnesModelEntry[];
export declare const AGNES_IMAGE_MODELS: AgnesModelEntry[];
export declare const AGNES_VIDEO_MODELS: AgnesModelEntry[];
export declare const AGNES_ALL_MODELS: AgnesModelEntry[];
export declare const AGNES_PROVIDER_ID = "agnes-ai";
export declare const AGNES_API_KEY_ENV = "AGNES_AI_API_KEY";
export declare const AGNES_SETTINGS_NS = "llm-pi-ai";
export declare const AGNES_SETTINGS_PATH: string[];
/** China region API endpoint */
export declare const AGNES_BASE_URL_CN = "https://api.agnes-ai.cn/v1";
/** Global/International region API endpoint */
export declare const AGNES_BASE_URL_GLOBAL = "https://apihub.agnes-ai.com/v1";
/** Available regions for Agnes AI */
export declare const AGNES_REGIONS: {
    readonly CN: "cn";
    readonly GLOBAL: "global";
};
export type AgnesRegion = typeof AGNES_REGIONS[keyof typeof AGNES_REGIONS];
/** Get base URL based on region */
export declare function getAgnesBaseUrl(region?: AgnesRegion): string;
export declare const AGNES_PROVIDER_CONFIG: {
    displayName: string;
    apiKeyEnv: string;
    api: "openai-completions";
    baseURL: string;
    models: AgnesModelEntry[];
};
export declare const AGNES_IMAGE_GENERATION_TOOL: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            model: {
                type: string;
                enum: string[];
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                enum: string[];
                description: string;
            };
            ratio: {
                type: string;
                enum: string[];
                description: string;
            };
            image: {
                type: string;
                description: string;
            };
            return_base64: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const AGNES_VIDEO_GENERATION_TOOL: {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            model: {
                type: string;
                enum: string[];
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            seconds: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                enum: string[];
                description: string;
            };
            aspect_ratio: {
                type: string;
                enum: string[];
                description: string;
            };
            image: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare const AGNES_TOOLS: ({
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            model: {
                type: string;
                enum: string[];
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                enum: string[];
                description: string;
            };
            ratio: {
                type: string;
                enum: string[];
                description: string;
            };
            image: {
                type: string;
                description: string;
            };
            return_base64: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: {
            model: {
                type: string;
                enum: string[];
                description: string;
            };
            prompt: {
                type: string;
                description: string;
            };
            seconds: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                enum: string[];
                description: string;
            };
            aspect_ratio: {
                type: string;
                enum: string[];
                description: string;
            };
            image: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
})[];
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map