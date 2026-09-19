import { Schema } from '@deepseek-ai/cordis';
/**
 * 插件名称，必须与 package.json 里的 name 保持可读一致。
 * DSH loader 通过 name 定位插件。
 */
export const name = 'agnes-ai-for-dsh';
/**
 * 声明依赖的服务。tools 服务就绪后才会调用 apply，
 * 服务消失时插件会自动卸载。
 */
export const inject = ['tools', 'settings', 'credentials'];
/**
 * 插件配置 Schema。
 * 所有可配置项都在这里声明，profile 可以覆盖默认值。
 */
export const Config = Schema.object({
    apiKeyEnv: Schema.string().default('AGNES_AI_API_KEY'),
    baseURL: Schema.string().default('https://api.agnes-ai.cn/v1'),
    requirePaidConfirmation: Schema.boolean().default(true),
});
/**
 * 插件入口。DSH 加载时会调用这个函数并传入上下文。
 */
export function apply(ctx, config) {
    ctx.logger?.info?.(`[${name}] plugin loaded (baseURL=${config.baseURL}, apiKeyEnv=${config.apiKeyEnv})`);
    // -------------------------------------------------------------------------
    // 在这里注册你的能力：
    //
    // 1. 如果要在设置页暴露 UI，用 ctx.settings.register(...)
    // 2. 如果要注册工具，用 ctx.tools.register(defineTool({ ... }))
    // 3. 如果要注册凭证引用，用 ctx.credentials.register(...)
    //
    // 注意：LLM provider 的注册是通过 cordis.patch.yml 注入
    //       @deepseek-ai/dsh-llm-pi-ai 的配置来完成的，不在这里写。
    // -------------------------------------------------------------------------
    // 示例：注册一个占位的设置面板（如果暂时没有 UI，可以删掉这一段）
    // ctx.settings.register({
    //   id: 'agnes-ai-settings',
    //   title: 'Agnes AI',
    //   schema: Config,
    // })
}
