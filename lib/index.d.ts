/**
 * Agnes AI Plugin for DeepSeek Harness
 *
 * Host-side plugin that:
 * 1. Registers the Agnes AI LLM provider configuration
 * 2. Registers image/video generation tools
 * 3. AUTO-detects Agnes URLs in ANY tool output and records them
 * 4. Persists generation records via a settings namespace
 * 5. Provides model catalog and API constants
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
export interface GenerationRecord {
    id: string;
    type: 'image' | 'video';
    prompt: string;
    model: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
    url?: string;
    error?: string;
    size?: string;
    ratio?: string;
    seconds?: string;
    createdAt: number;
    completedAt?: number;
    /** 记录来源工具名（用于诊断 auto-detect 是否生效） */
    source?: string;
}
/** Settings namespace that stores the record list as a JSON string. */
export declare const AGNES_RECORDS_NS = "agnes-generations";
export declare const AGNES_IMAGE_GENERATION_TOOL: {
    name: string;
    description: string;
    parameters: {
        model: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        size: {
            type: string;
            required: boolean;
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
};
export declare const AGNES_VIDEO_GENERATION_TOOL: {
    name: string;
    description: string;
    parameters: {
        model: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
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
};
/**
 * 记录登记工具（保留，作为模型愿意主动配合时的补充路径）。
 * 现在真正的 auto-detect 走 `tools/execute` hook，本工具主要用于：
 * - 模型明确希望登记一个已经不在当前 tool result 里的历史结果；
 * - 或者给想主动配合的模型一个显式入口。
 */
export declare const AGNES_RECORD_GENERATION_TOOL: {
    name: string;
    description: string;
    parameters: {
        type: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        model: {
            type: string;
            required: boolean;
            description: string;
        };
        url: {
            type: string;
            required: boolean;
            description: string;
        };
        size: {
            type: string;
            description: string;
        };
        ratio: {
            type: string;
            description: string;
        };
        seconds: {
            type: string;
            description: string;
        };
    };
};
export declare const AGNES_TOOLS: ({
    name: string;
    description: string;
    parameters: {
        model: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        size: {
            type: string;
            required: boolean;
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
} | {
    name: string;
    description: string;
    parameters: {
        model: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
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
} | {
    name: string;
    description: string;
    parameters: {
        type: {
            type: string;
            required: boolean;
            enum: string[];
            description: string;
        };
        prompt: {
            type: string;
            required: boolean;
            description: string;
        };
        model: {
            type: string;
            required: boolean;
            description: string;
        };
        url: {
            type: string;
            required: boolean;
            description: string;
        };
        size: {
            type: string;
            description: string;
        };
        ratio: {
            type: string;
            description: string;
        };
        seconds: {
            type: string;
            description: string;
        };
    };
})[];
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map