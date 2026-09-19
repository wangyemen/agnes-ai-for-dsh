/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides GUI settings panel for configuring Agnes AI.
 */
export declare const name = "agnes-ai-for-dsh-client";
export declare const FREE_TEXT_MODELS: readonly [{
    readonly id: 'agnes-2.5-flash';
    readonly name: 'Agnes 2.5 Flash';
    readonly image: true;
}, {
    readonly id: 'agnes-3.0-flash';
    readonly name: 'Agnes 3.0 Flash';
    readonly image: true;
}];
export declare const PAID_TEXT_MODELS: readonly [{
    readonly id: 'agnes-2.5-pro';
    readonly name: 'Agnes 2.5 Pro';
    readonly image: true;
}];
export declare const IMAGE_MODELS: readonly [{
    readonly id: 'agnes-image-2.5-flash';
    readonly name: 'Agnes Image 2.5 Flash';
}];
export declare const VIDEO_MODELS: readonly [{
    readonly id: 'agnes-video-25-flash';
    readonly name: 'Agnes Video 2.5 Flash';
}];
export declare function apply(ctx: any): void;
//# sourceMappingURL=index.d.ts.map