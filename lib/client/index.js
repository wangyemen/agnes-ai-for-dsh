"use strict";
/**
 * Agnes AI client plugin — the settings panel.
 *
 * This is a DSH client bundle entry. It self-registers through the browser
 * module table, so it must call `window.__ModuleLoader__.load({ id, factory })`.
 *
 * Provider detection reads the live configuration from the generated Remote
 * namespace `remote.settings` (see `readProviderConfig`). A previous version
 * read a `settingsScope` service that does not exist in DSH 0.2.0-rc.2, so the
 * lookup always returned undefined and the panel claimed "not configured" no
 * matter what the user had set up.
 */
const moduleLoader = globalThis.__ModuleLoader__;
moduleLoader.load({
    id: 'agnes-ai-for-dsh',
    factory: (require) => {
        const exports = {};
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        // ------------------------------------------------------------------
        // React, from the browser module table
        // ------------------------------------------------------------------
        let React = null;
        let jsx = null;
        let jsxs = null;
        try {
            React = require('react');
            const runtime = require('react/jsx-runtime');
            jsx = runtime.jsx;
            jsxs = runtime.jsxs;
        }
        catch (error) {
            console.error('[agnes-ai-for-dsh] failed to load React:', error);
        }
        // ------------------------------------------------------------------
        // Constants
        // ------------------------------------------------------------------
        const PROVIDER_ID = 'agnes-ai';
        const SETTINGS_NS = 'llm-pi-ai';
        const RECORDS_NS = 'agnes-generations';
        const API_KEY_ENV = 'AGNES_AI_API_KEY';
        const CHAT_MODELS = [
            { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash', note: '免费·多模态·编码优化', free: true },
            { id: 'agnes-3.0-flash', name: 'Agnes 3.0 Flash', note: '免费·新一代 Agent 编程', free: true },
            { id: 'agnes-2.5-pro', name: 'Agnes 2.5 Pro', note: '付费·高级推理', free: false },
            { id: 'agnes-2.5-pro-beta', name: 'Agnes 2.5 Pro Beta', note: '付费·打榜模型', free: false },
        ];
        const IMAGE_MODELS = [
            { id: 'agnes-image-2.1-flash', name: 'Agnes Image 2.1 Flash', note: '文生图·图生图·多图合成', free: true },
            { id: 'agnes-image-2.5-flash', name: 'Agnes Image 2.5 Flash', note: '最新一代图像模型', free: true },
        ];
        const VIDEO_MODELS = [
            { id: 'agnes-video-2.5-flash', name: 'Agnes Video 2.5 Flash', note: '异步任务·720P', free: true },
            { id: 'agnes-video-2.5', name: 'Agnes Video 2.5', note: '多分辨率·首尾帧·参考', free: false },
        ];
        const C = {
            cardBg: 'rgba(255,255,255,0.03)',
            cardBorder: 'rgba(255,255,255,0.08)',
            textPrimary: 'var(--dsw-alias-label-primary, #e8e8ea)',
            textSecondary: 'var(--dsw-alias-label-secondary, #9a9aa0)',
            textMuted: 'var(--dsw-alias-label-tertiary, #6a6a72)',
            radius: 10,
            radiusSm: 6,
            font: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        };
        // ------------------------------------------------------------------
        // Small presentational pieces
        // ------------------------------------------------------------------
        function Badge(props) {
            const tone = props.tone ?? 'default';
            const tones = {
                default: { bg: 'rgba(255,255,255,0.06)', fg: C.textSecondary },
                green: { bg: 'rgba(34,197,94,0.14)', fg: '#7ee2a8' },
                amber: { bg: 'rgba(245,158,11,0.14)', fg: '#f6c05c' },
                blue: { bg: 'rgba(74,140,255,0.16)', fg: '#8fb6ff' },
            };
            const t = tones[tone] ?? tones.default;
            return jsx('span', {
                style: {
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.6,
                    background: t.bg,
                    color: t.fg,
                    whiteSpace: 'nowrap',
                },
                children: props.children,
            });
        }
        function InfoRow(props) {
            return jsxs('div', {
                style: { display: 'flex', gap: 10, fontSize: 12, lineHeight: 1.9 },
                children: [
                    jsx('span', { style: { color: C.textMuted, minWidth: 132 }, children: props.label }),
                    jsx('span', {
                        style: {
                            color: C.textSecondary,
                            fontFamily: props.mono ? 'ui-monospace, SFMono-Regular, monospace' : C.font,
                            wordBreak: 'break-all',
                        },
                        children: props.value,
                    }),
                ],
            });
        }
        function Section(props) {
            return jsxs('div', {
                style: { marginTop: 18 },
                children: [
                    jsxs('div', {
                        style: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 },
                        children: [
                            jsx('div', { style: { fontSize: 13, fontWeight: 600, color: C.textPrimary }, children: props.title }),
                            props.subtitle
                                ? jsx('div', { style: { fontSize: 11, color: C.textMuted }, children: props.subtitle })
                                : null,
                        ],
                    }),
                    props.children,
                ],
            });
        }
        function ModelRow(props) {
            const { model, configured } = props;
            return jsxs('div', {
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '6px 10px',
                    border: `1px solid ${C.cardBorder}`,
                    background: C.cardBg,
                    borderRadius: C.radiusSm,
                    marginBottom: 4,
                },
                children: [
                    jsxs('div', {
                        style: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 },
                        children: [
                            jsxs('div', {
                                style: { display: 'flex', alignItems: 'center', gap: 6 },
                                children: [
                                    jsx('span', { style: { fontSize: 12, color: C.textPrimary }, children: model.name }),
                                    model.free
                                        ? jsx(Badge, { tone: 'green', children: '免费' })
                                        : jsx(Badge, { tone: 'amber', children: '付费' }),
                                ],
                            }),
                            jsxs('div', {
                                style: {
                                    fontSize: 10,
                                    color: C.textMuted,
                                    fontFamily: 'ui-monospace, monospace',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                                children: [model.id, ' · ', model.note],
                            }),
                        ],
                    }),
                    jsx(Badge, {
                        tone: configured ? 'green' : 'default',
                        children: configured ? '已启用' : '未加入配置',
                    }),
                ],
            });
        }
        // ------------------------------------------------------------------
        // Live configuration access
        // ------------------------------------------------------------------
        /**
         * The Remote namespace service.
         *
         * Remote namespaces are registered under the flat name `remote.<ns>`
         * (`remoteServiceKey()` composes it), so `remote.settings` is itself a
         * service name. Both readings are attempted rather than assuming the
         * nested property resolves.
         */
        function getRemoteSettings(ctx) {
            try {
                const flat = ctx?.reflect?.get?.('remote.settings', false);
                if (flat)
                    return flat;
            }
            catch {
                /* fall through to the nested form */
            }
            try {
                return ctx?.reflect?.get?.('remote', false)?.settings ?? null;
            }
            catch {
                return null;
            }
        }
        /** Pull the agnes-ai provider block out of a namespace value. */
        function providerBlockOf(value) {
            const provider = value?.providers?.[PROVIDER_ID];
            return provider && typeof provider === 'object' ? provider : null;
        }
        /**
         * Read the live provider configuration.
         *
         * @returns the provider block and the namespace it came from, or null when
         *   no configuration declares the provider.
         */
        async function readProviderConfig(ctx) {
            const settings = getRemoteSettings(ctx);
            if (!settings || typeof settings.describe !== 'function')
                return null;
            try {
                const result = await settings.describe();
                // Unary Remote calls resolve to { ok, value } and never reject for a
                // carrier problem, so the branch is checked rather than relied on.
                const view = result && result.ok === true ? result.value : null;
                const namespaces = Array.isArray(view?.namespaces) ? view.namespaces : [];
                const exact = namespaces.find((row) => row?.ns === SETTINGS_NS);
                const fromExact = providerBlockOf(exact?.value);
                if (fromExact)
                    return { config: fromExact, ns: SETTINGS_NS };
                // Fall back to whichever namespace really declares agnes-ai.
                for (const row of namespaces) {
                    const hit = providerBlockOf(row?.value);
                    if (hit)
                        return { config: hit, ns: String(row?.ns ?? '') };
                }
                return null;
            }
            catch (error) {
                console.warn('[agnes-ai-for-dsh] reading remote settings failed:', error);
                return null;
            }
        }
        // ------------------------------------------------------------------
        // Generation records
        // ------------------------------------------------------------------
        function readRecords(ctx) {
            try {
                const settings = getRemoteSettings(ctx);
                if (!settings)
                    return [];
                // Records live in their own namespace; describe() returns them all.
                return [];
            }
            catch {
                return [];
            }
        }
        // ------------------------------------------------------------------
        // Panel
        // ------------------------------------------------------------------
        function AgnesPanel() {
            if (!React) {
                return jsx('div', { style: { padding: 16 }, children: 'React unavailable' });
            }
            const ctx = AgnesPanel.__ctx;
            const [state, setState] = React.useState({
                status: 'loading',
                config: null,
                ns: '',
            });
            const requestRef = React.useRef(0);
            React.useEffect(() => {
                let alive = true;
                const load = () => {
                    const ticket = ++requestRef.current;
                    readProviderConfig(ctx)
                        .then((hit) => {
                        if (!alive || ticket !== requestRef.current)
                            return;
                        setState(hit
                            ? { status: 'ready', config: hit.config, ns: hit.ns }
                            : { status: 'missing', config: null, ns: '' });
                    })
                        .catch(() => {
                        if (!alive || ticket !== requestRef.current)
                            return;
                        setState({ status: 'missing', config: null, ns: '' });
                    });
                };
                load();
                // Settings writes and reconnects both invalidate the remote values.
                const disposers = [];
                try {
                    const remote = ctx?.reflect?.get?.('remote', false);
                    if (remote && typeof remote.$on === 'function') {
                        disposers.push(remote.$on('settings/document-updated', load));
                    }
                }
                catch {
                    /* optional */
                }
                try {
                    if (typeof ctx?.on === 'function') {
                        disposers.push(ctx.on('connection/reset', load));
                    }
                }
                catch {
                    /* optional */
                }
                return () => {
                    alive = false;
                    for (const dispose of disposers) {
                        try {
                            if (typeof dispose === 'function')
                                dispose();
                        }
                        catch {
                            /* ignore */
                        }
                    }
                };
            }, []);
            // While the asynchronous read is in flight, assert nothing: claiming
            // "not configured" here would flash a wrong message at users who have
            // configured the provider correctly.
            if (state.status === 'loading') {
                return jsxs('div', {
                    style: { padding: 20, fontFamily: C.font, color: C.textPrimary },
                    children: [
                        jsx('div', { style: { fontSize: 16, fontWeight: 700 }, children: 'Agnes AI' }),
                        jsx('div', {
                            style: { marginTop: 8, fontSize: 12, color: C.textMuted },
                            children: '正在读取配置…',
                        }),
                    ],
                });
            }
            if (!state.config) {
                return jsxs('div', {
                    style: {
                        padding: 20,
                        fontFamily: C.font,
                        color: C.textPrimary,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                    },
                    children: [
                        jsxs('div', {
                            style: { display: 'flex', alignItems: 'center', gap: 8 },
                            children: [
                                jsx('div', { style: { fontSize: 16, fontWeight: 700 }, children: 'Agnes AI' }),
                                jsx(Badge, { tone: 'amber', children: '未配置' }),
                            ],
                        }),
                        jsx('div', {
                            style: {
                                border: `1px solid ${C.cardBorder}`,
                                background: C.cardBg,
                                borderRadius: C.radius,
                                padding: 16,
                                fontSize: 13,
                                lineHeight: 1.8,
                                color: C.textSecondary,
                            },
                            children: '尚未检测到 Agnes AI 配置。请前往「模型」设置中添加 agnes-ai provider，' +
                                '或编辑插件目录下的 cordis.patch.yml。',
                        }),
                    ],
                });
            }
            const configured = Array.isArray(state.config.models) ? state.config.models : [];
            const configuredIds = new Set(configured.map((m) => String(m?.id)));
            const baseURL = String(state.config.baseURL ?? '(未配置)');
            const displayName = String(state.config.displayName ?? 'Agnes AI');
            const apiKeyEnv = String(state.config.apiKeyEnv ?? API_KEY_ENV);
            const declaresKey = Boolean(state.config.apiKeyEnv);
            const missing = [...CHAT_MODELS, ...IMAGE_MODELS, ...VIDEO_MODELS].filter((m) => !configuredIds.has(m.id));
            return jsxs('div', {
                style: {
                    padding: 20,
                    fontFamily: C.font,
                    color: C.textPrimary,
                    display: 'flex',
                    flexDirection: 'column',
                },
                children: [
                    jsxs('div', {
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
                        children: [
                            jsx('div', { style: { fontSize: 16, fontWeight: 700 }, children: displayName }),
                            jsx(Badge, {
                                tone: declaresKey ? 'green' : 'amber',
                                children: declaresKey ? '已声明 API Key' : '未声明 API Key',
                            }),
                        ],
                    }),
                    jsxs('div', {
                        style: {
                            marginTop: 12,
                            border: `1px solid ${C.cardBorder}`,
                            background: C.cardBg,
                            borderRadius: C.radius,
                            padding: '10px 14px',
                        },
                        children: [
                            jsx(InfoRow, { label: 'API Base URL', value: baseURL, mono: true }),
                            jsx(InfoRow, { label: 'API Key 环境变量', value: apiKeyEnv, mono: true }),
                            jsx(InfoRow, { label: '配置来源', value: state.ns || SETTINGS_NS, mono: true }),
                            jsx(InfoRow, {
                                label: '已加载模型',
                                value: `${configuredIds.size} 个`,
                            }),
                            jsx(InfoRow, { label: '生成工具', value: 'agnes_image_generation / agnes_video_generation' }),
                        ],
                    }),
                    jsx(Section, {
                        title: '文本模型',
                        subtitle: '对话 · 编码 · 工具调用',
                        children: jsx('div', {
                            children: CHAT_MODELS.map((m) => jsx(ModelRow, { model: m, configured: configuredIds.has(m.id) }, m.id)),
                        }),
                    }),
                    jsx(Section, {
                        title: '图像模型',
                        subtitle: '文生图 · 图生图 · 多图合成',
                        children: jsx('div', {
                            children: IMAGE_MODELS.map((m) => jsx(ModelRow, { model: m, configured: configuredIds.has(m.id) }, m.id)),
                        }),
                    }),
                    jsx(Section, {
                        title: '视频模型',
                        subtitle: '文生视频 · 首尾帧 · 异步任务',
                        children: jsx('div', {
                            children: VIDEO_MODELS.map((m) => jsx(ModelRow, { model: m, configured: configuredIds.has(m.id) }, m.id)),
                        }),
                    }),
                    missing.length > 0
                        ? jsx(Section, {
                            title: '未加入配置的模型',
                            subtitle: '在「模型」设置中启用后即可选用',
                            children: jsx('div', {
                                style: { fontSize: 11, color: C.textMuted, lineHeight: 1.8 },
                                children: missing.map((m) => m.id).join('、'),
                            }),
                        })
                        : null,
                ],
            });
        }
        // ------------------------------------------------------------------
        // Registration
        // ------------------------------------------------------------------
        function apply(ctx) {
            ;
            AgnesPanel.__ctx = ctx;
            if (!ctx?.slots?.inject || !ctx?.slots?.register)
                return;
            ctx.slots.inject('settings.section', () => ctx.slots.register({
                name: 'settings.section',
                id: 'agnes-ai',
                order: 50,
                label: () => 'Agnes AI',
            }, AgnesPanel));
        }
        exports.name = 'agnes-ai-for-dsh-client';
        // `slots` is required; nothing else is, so a runtime that lacks an optional
        // service still loads the plugin instead of leaving it pending forever.
        exports.inject = ['slots'];
        exports.apply = apply;
        exports.CHAT_MODELS = CHAT_MODELS;
        exports.IMAGE_MODELS = IMAGE_MODELS;
        exports.VIDEO_MODELS = VIDEO_MODELS;
        exports.readProviderConfig = readProviderConfig;
        return exports;
    },
});
//# sourceMappingURL=index.js.map