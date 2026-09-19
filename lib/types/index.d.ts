import type { Context } from '@deepseek-ai/cordis';
import { Schema } from '@deepseek-ai/cordis';
/**
 * 插件名称，必须与 package.json 里的 name 保持可读一致。
 * DSH loader 通过 name 定位插件。
 */
export declare const name = "agnes-ai-for-dsh";
/**
 * 声明依赖的服务。tools 服务就绪后才会调用 apply，
 * 服务消失时插件会自动卸载。
 */
export declare const inject: string[];
/**
 * 插件配置 Schema。
 * 所有可配置项都在这里声明，profile 可以覆盖默认值。
 */
export declare const Config: any;
export type Config = Schema.Infer<typeof Config>;
/**
 * 插件入口。DSH 加载时会调用这个函数并传入上下文。
 */
export declare function apply(ctx: Context, config: Config): void;
