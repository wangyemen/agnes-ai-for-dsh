"use strict";
/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides:
 * 1. A dedicated Agnes AI settings panel in the DSH sidebar
 * 2. Detection of whether the agnes-ai provider is configured
 * 3. Display of configured models and their status
 * 4. Generation records (images / videos) with progress, delete, pagination
 *
 * NOTE: This is a DSH client bundle entry. It MUST self-register via
 * `window.__ModuleLoader__.load({ id, factory })`.
 */
const moduleLoader = globalThis.__ModuleLoader__;
moduleLoader.load({
    id: 'agnes-ai-for-dsh',
    factory: (require) => {
        const exports = {};
        Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        // ------------------------------------------------------------------
        // React
        // ------------------------------------------------------------------
        let React = null;
        let jsx = null;
        let jsxs = null;
        try {
            React = require('react');
            const rt = require('react/jsx-runtime');
            jsx = rt.jsx;
            jsxs = rt.jsxs;
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh-client] failed to require react:', error);
        }
        // ========================================================================
        // Model Catalog (fallback reference)
        // ========================================================================
        const AGNES_MODELS = [
            { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash', description: '免费·多模态对话·编码优化·智能体工作流', isFree: true, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
            { id: 'agnes-3.0-flash', name: 'Agnes 3.0 Flash', description: '免费·新一代Agent编程模型·工具调用强化', isFree: true, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
            { id: 'agnes-2.5-pro', name: 'Agnes 2.5 Pro', description: '付费·高级推理·科学计算·长上下文分析', isFree: false, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
            { id: 'agnes-2.5-pro-beta', name: 'Agnes 2.5 Pro Beta', description: '付费·打榜模型·Artificial Analysis评测', isFree: false, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
            { id: 'agnes-image-2.1-flash', name: 'Agnes Image 2.1 Flash', description: '免费·文生图·图生图·多图合成', isFree: true, category: 'image' },
            { id: 'agnes-image-2.5-flash', name: 'Agnes Image 2.5 Flash', description: '免费·最新一代图像模型·全面超越2.1版本', isFree: true, category: 'image' },
            { id: 'agnes-video-v2.0', name: 'Agnes Video V2.0', description: '免费·文生视频·图生视频·关键帧动画', isFree: true, category: 'video' },
            { id: 'agnes-video-25-flash', name: 'Agnes Video 2.5 Flash', description: '免费·异步任务API·720P专享', isFree: true, category: 'video' },
            { id: 'agnes-video-25', name: 'Agnes Video 2.5', description: '付费·多分辨率·首尾帧控制·多模态参考', isFree: false, category: 'video' },
        ];
        // ========================================================================
        // Provider helpers
        // ========================================================================
        const AGNES_PROVIDER_ID = 'agnes-ai';
        function checkProviderExists(ctx) {
            try {
                const providers = ctx.llm?.listProviders?.() ?? [];
                return providers.some((p) => p.id === AGNES_PROVIDER_ID);
            }
            catch {
                return false;
            }
        }
        async function getProviderState(ctx) {
            const exists = checkProviderExists(ctx);
            if (!exists) {
                return { exists: false, hasApiKey: false, models: [], error: 'Provider not configured' };
            }
            return { exists: true, hasApiKey: false, models: [...AGNES_MODELS] };
        }
        async function readAgnesSettings(_ctx) {
            return { configured: false, hasApiKey: false, models: [] };
        }
        // ========================================================================
        // Style tokens
        // ========================================================================
        const C = {
            bg: 'transparent',
            cardBg: 'rgba(255,255,255,0.03)',
            cardBorder: 'rgba(255,255,255,0.08)',
            textPrimary: 'var(--dsw-alias-label-primary, #e8e8ea)',
            textSecondary: 'var(--dsw-alias-label-secondary, #9a9aa0)',
            textMuted: 'var(--dsw-alias-label-tertiary, #6a6a72)',
            accent: '#4a8cff',
            accentSoft: 'rgba(74,140,255,0.12)',
            green: '#22c55e',
            amber: '#f59e0b',
            red: '#ef4444',
            radius: 10,
            radiusSm: 6,
            font: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        };
        // ========================================================================
        // Small presentational components
        // ========================================================================
        function Badge(props) {
            const { children, tone = 'default' } = props;
            const toneMap = {
                default: { bg: 'rgba(255,255,255,0.06)', fg: C.textSecondary },
                green: { bg: 'rgba(34,197,94,0.14)', fg: '#7ee2a8' },
                amber: { bg: 'rgba(245,158,11,0.14)', fg: '#f6c05c' },
                blue: { bg: 'rgba(74,140,255,0.16)', fg: '#8fb6ff' },
                purple: { bg: 'rgba(168,85,247,0.14)', fg: '#c99cff' },
                red: { bg: 'rgba(239,68,68,0.14)', fg: '#f87171' },
            };
            const t = toneMap[tone] || toneMap.default;
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
                children,
            });
        }
        function StatusDot(props) {
            const color = props.ok ? C.green : C.amber;
            return jsx('span', {
                style: {
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 6px ${color}`,
                    marginRight: 6,
                },
            });
        }
        function SectionTitle(props) {
            return jsxs('div', {
                style: { marginTop: 4, marginBottom: 8 },
                children: [
                    jsx('div', {
                        style: { fontSize: 13, fontWeight: 600, color: C.textPrimary, letterSpacing: 0.2 },
                        children: props.children,
                    }),
                    props.subtitle
                        ? jsx('div', { style: { fontSize: 11, color: C.textMuted, marginTop: 2 }, children: props.subtitle })
                        : null,
                ],
            });
        }
        function InfoRow(props) {
            return jsxs('div', {
                style: {
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: `1px solid ${C.cardBorder}`,
                },
                children: [
                    jsx('span', { style: { fontSize: 12, color: C.textSecondary }, children: props.label }),
                    jsx('span', {
                        style: {
                            fontSize: 12,
                            color: C.textPrimary,
                            fontFamily: props.mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : C.font,
                            wordBreak: 'break-all',
                            textAlign: 'right',
                        },
                        children: props.value,
                    }),
                ],
            });
        }
        function ModelCard(props) {
            const { model, configured } = props;
            const capTone = model.category === 'text' ? 'blue' : model.category === 'image' ? 'purple' : 'amber';
            return jsxs('div', {
                style: {
                    border: `1px solid ${C.cardBorder}`,
                    background: C.cardBg,
                    borderRadius: C.radiusSm,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                },
                children: [
                    jsxs('div', {
                        style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
                        children: [
                            jsxs('div', {
                                style: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 },
                                children: [
                                    jsx(StatusDot, { ok: configured }),
                                    jsx('span', {
                                        style: {
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: C.textPrimary,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        },
                                        children: model.name,
                                    }),
                                ],
                            }),
                            jsxs('div', {
                                style: { display: 'flex', gap: 4, flexShrink: 0 },
                                children: [
                                    jsx(Badge, { tone: capTone, children: model.category }),
                                    model.supportsImageInput ? jsx(Badge, { tone: 'blue', children: 'image-in' }) : null,
                                    jsx(Badge, { tone: model.isFree ? 'green' : 'amber', children: model.isFree ? '免费' : '付费' }),
                                ],
                            }),
                        ],
                    }),
                    jsx('div', {
                        style: { fontSize: 11, color: C.textMuted, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
                        children: model.id,
                    }),
                    jsx('div', { style: { fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }, children: model.description }),
                    model.contextWindow
                        ? jsxs('div', {
                            style: { fontSize: 11, color: C.textMuted },
                            children: [
                                `上下文 ${Math.round(model.contextWindow / 1024)}K`,
                                model.maxTokens ? ` · 单次输出 ≤ ${Math.round(model.maxTokens / 1024)}K` : '',
                            ],
                        })
                        : null,
                ],
            });
        }
        function ModelGroup(props) {
            const { title, subtitle, models, configuredIds } = props;
            if (models.length === 0)
                return null;
            return jsxs('div', {
                style: { marginTop: 16 },
                children: [
                    jsx(SectionTitle, { subtitle, children: title }),
                    jsxs('div', {
                        style: { display: 'flex', flexDirection: 'column', gap: 8 },
                        children: models.map((m) => jsx(ModelCard, { model: m, configured: configuredIds.has(m.id) }, m.id)),
                    }),
                ],
            });
        }
        // ========================================================================
        // Generation Records Panel
        // ========================================================================
        function StatusBadge(props) {
            const map = {
                pending: { tone: 'default', label: '等待中' },
                processing: { tone: 'blue', label: '生成中' },
                completed: { tone: 'green', label: '完成' },
                failed: { tone: 'red', label: '失败' },
            };
            const t = map[props.status] || map.pending;
            return jsx(Badge, { tone: t.tone, children: t.label });
        }
        function ProgressBar(props) {
            const v = Math.max(0, Math.min(100, props.value));
            return jsx('div', {
                style: {
                    height: 3,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                    marginTop: 6,
                },
                children: jsx('div', {
                    style: { height: '100%', width: `${v}%`, background: C.accent, transition: 'width 0.3s ease' },
                }),
            });
        }
        function RecordCard(props) {
            const { record, onDelete } = props;
            const isVideo = record.type === 'video';
            const isCompleted = record.status === 'completed';
            const isProcessing = record.status === 'processing' || record.status === 'pending';
            let preview;
            if (isCompleted && record.url) {
                preview = isVideo
                    ? jsx('video', {
                        src: record.url,
                        controls: true,
                        style: { width: '100%', height: '100%', objectFit: 'contain' },
                    })
                    : jsx('img', {
                        src: record.url,
                        alt: record.prompt || '',
                        style: { width: '100%', height: '100%', objectFit: 'cover' },
                    });
            }
            else {
                preview = jsx('div', {
                    style: { color: C.textMuted, fontSize: 12 },
                    children: isProcessing
                        ? isVideo ? '视频生成中…' : '图片生成中…'
                        : record.status === 'failed' ? '生成失败' : '—',
                });
            }
            return jsxs('div', {
                style: {
                    border: `1px solid ${C.cardBorder}`,
                    background: C.cardBg,
                    borderRadius: C.radiusSm,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                },
                children: [
                    jsx('div', {
                        style: {
                            width: '100%',
                            aspectRatio: '16 / 10',
                            background: 'rgba(0,0,0,0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        },
                        children: preview,
                    }),
                    jsxs('div', {
                        style: { padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 },
                        children: [
                            jsxs('div', {
                                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
                                children: [
                                    jsxs('div', {
                                        style: { display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' },
                                        children: [
                                            jsx(Badge, { tone: isVideo ? 'amber' : 'purple', children: isVideo ? 'video' : 'image' }),
                                            jsx(StatusBadge, { status: record.status }),
                                        ],
                                    }),
                                    jsx('button', {
                                        title: '删除',
                                        onClick: () => onDelete(record.id),
                                        style: {
                                            border: 'none',
                                            background: 'transparent',
                                            color: C.textMuted,
                                            cursor: 'pointer',
                                            fontSize: 16,
                                            lineHeight: 1,
                                            padding: '0 4px',
                                        },
                                        children: '×',
                                    }),
                                ],
                            }),
                            jsx('div', {
                                style: { fontSize: 10, color: C.textMuted, fontFamily: 'ui-monospace, monospace' },
                                children: record.model,
                            }),
                            jsx('div', {
                                style: {
                                    fontSize: 11,
                                    color: C.textSecondary,
                                    lineHeight: 1.5,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                },
                                children: record.prompt || '(无提示词)',
                            }),
                            isProcessing ? jsx(ProgressBar, { value: record.progress || 0 }) : null,
                            record.status === 'failed' && record.error
                                ? jsx('div', { style: { fontSize: 10, color: '#f87171', wordBreak: 'break-all' }, children: record.error })
                                : null,
                            jsx('div', {
                                style: { fontSize: 10, color: C.textMuted, marginTop: 2 },
                                children: new Date(record.createdAt).toLocaleString(),
                            }),
                        ],
                    }),
                ],
            });
        }
        function Pagination(props) {
            const { page, totalPages, onChange } = props;
            if (totalPages <= 1)
                return null;
            const btnStyle = (disabled) => ({
                border: `1px solid ${C.cardBorder}`,
                background: 'transparent',
                color: disabled ? C.textMuted : C.textSecondary,
                padding: '3px 10px',
                borderRadius: C.radiusSm,
                fontSize: 11,
                cursor: disabled ? 'not-allowed' : 'pointer',
            });
            return jsxs('div', {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
                children: [
                    jsx('button', { disabled: page <= 1, onClick: () => onChange(page - 1), style: btnStyle(page <= 1), children: '上一页' }),
                    jsxs('span', { style: { fontSize: 11, color: C.textSecondary }, children: [`${page} / ${totalPages}`] }),
                    jsx('button', { disabled: page >= totalPages, onClick: () => onChange(page + 1), style: btnStyle(page >= totalPages), children: '下一页' }),
                ],
            });
        }
        function GenerationRecordsPanel(props) {
            const { scope } = props;
            const [records, setRecords] = React.useState([]);
            const [page, setPage] = React.useState(1);
            const pageSize = 4;
            React.useEffect(() => {
                if (!scope)
                    return;
                const load = () => {
                    try {
                        const snap = scope.getSnapshot();
                        if (!snap || snap.status !== 'ready' || !snap.value) {
                            setRecords([]);
                            return;
                        }
                        const arr = JSON.parse(snap.value.data || '[]');
                        setRecords(Array.isArray(arr) ? arr : []);
                    }
                    catch {
                        setRecords([]);
                    }
                };
                load();
                let dispose;
                try {
                    if (typeof scope.subscribe === 'function')
                        dispose = scope.subscribe(load);
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai] records subscribe failed:', e);
                }
                return () => {
                    try {
                        if (typeof dispose === 'function')
                            dispose();
                    }
                    catch {
                        /* ignore */
                    }
                };
            }, []);
            const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
            const currentPage = Math.min(page, totalPages);
            const pageRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);
            const handleDelete = async (id) => {
                if (!scope)
                    return;
                const next = records.filter((r) => r.id !== id);
                try {
                    if (typeof scope.set === 'function') {
                        await scope.set('data', JSON.stringify(next));
                    }
                }
                catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai] delete record failed:', e);
                }
            };
            const header = jsxs('div', {
                style: { marginTop: 20, marginBottom: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' },
                children: [
                    jsx('div', { style: { fontSize: 13, fontWeight: 600, color: C.textPrimary }, children: '生成记录' }),
                    jsx('div', { style: { fontSize: 11, color: C.textMuted }, children: `共 ${records.length} 条` }),
                ],
            });
            if (records.length === 0) {
                return jsxs('div', {
                    children: [
                        header,
                        jsxs('div', {
                            style: {
                                padding: '20px 16px',
                                border: `1px dashed ${C.cardBorder}`,
                                borderRadius: C.radius,
                                background: 'rgba(255,255,255,0.015)',
                                textAlign: 'center',
                            },
                            children: [
                                jsx('div', { style: { fontSize: 12, color: C.textMuted, lineHeight: 1.7 }, children: '暂无生成记录' }),
                                jsx('div', {
                                    style: { fontSize: 11, color: C.textMuted, lineHeight: 1.7 },
                                    children: '使用对话中的生图 / 生视频工具后，记录会出现在这里',
                                }),
                            ],
                        }),
                    ],
                });
            }
            return jsxs('div', {
                children: [
                    header,
                    jsx('div', {
                        style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
                        children: pageRecords.map((r) => jsx(RecordCard, { record: r, onDelete: handleDelete }, String(r.id))),
                    }),
                    jsx(Pagination, { page: currentPage, totalPages, onChange: setPage }),
                ],
            });
        }
        // ========================================================================
        // Client Entry Point
        // ========================================================================
        const name = 'agnes-ai-for-dsh-client';
        function apply(ctx) {
            // eslint-disable-next-line no-console
            console.log('[agnes-ai-for-dsh-client] apply() invoked');
            // 绑定到 llm-pi-ai 命名空间
            let scope = null;
            try {
                scope = ctx.settingsScope.bind({ namespace: 'llm-pi-ai' });
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('[agnes-ai-for-dsh-client] settingsScope.bind(llm-pi-ai) failed:', error);
            }
            // 绑定到 agnes-generations 命名空间（记录）
            let recordsScope = null;
            try {
                recordsScope = ctx.settingsScope.bind({ namespace: 'agnes-generations' });
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error('[agnes-ai-for-dsh-client] settingsScope.bind(agnes-generations) failed:', error);
            }
            function readAgnesConfig() {
                if (!scope)
                    return null;
                try {
                    const snapshot = scope.getSnapshot();
                    // eslint-disable-next-line no-console
                    console.log('[agnes-ai-for-dsh-client] snapshot:', snapshot);
                    if (!snapshot || snapshot.status !== 'ready')
                        return null;
                    const v = snapshot.value;
                    if (!v)
                        return null;
                    const providers = v.providers;
                    return providers?.['agnes-ai'] ?? null;
                }
                catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('[agnes-ai-for-dsh-client] read scope failed:', error);
                    return null;
                }
            }
            function AgnesPanel(_props) {
                if (!React) {
                    return jsx('div', { style: { padding: 16 }, children: 'React unavailable' });
                }
                const [config, setConfig] = React.useState(readAgnesConfig);
                React.useEffect(() => {
                    if (!scope)
                        return;
                    const handler = () => setConfig(readAgnesConfig());
                    let dispose;
                    try {
                        if (typeof scope.subscribe === 'function') {
                            dispose = scope.subscribe(handler);
                        }
                    }
                    catch (error) {
                        // eslint-disable-next-line no-console
                        console.error('[agnes-ai-for-dsh-client] subscribe failed:', error);
                    }
                    return () => {
                        try {
                            if (typeof dispose === 'function')
                                dispose();
                        }
                        catch {
                            /* ignore */
                        }
                    };
                }, []);
                // ---- 未配置 provider 时的引导页 ----
                if (!config) {
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
                                    jsx('span', { style: { fontSize: 16, fontWeight: 700 }, children: 'Agnes AI' }),
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
                                children: '尚未检测到 Agnes AI 配置。请前往「模型」设置中添加 agnes-ai provider，或编辑插件目录下的 cordis.patch.yml。',
                            }),
                            jsx(GenerationRecordsPanel, { scope: recordsScope }),
                        ],
                    });
                }
                const configuredModelsRaw = Array.isArray(config.models) ? config.models : [];
                const configuredIds = new Set(configuredModelsRaw.map((m) => String(m.id)));
                const baseURL = String(config.baseURL || '未配置');
                const apiKeyEnv = String(config.apiKeyEnv || 'AGNES_AI_API_KEY');
                const displayName = String(config.displayName || 'Agnes AI');
                const apiKeyDeclared = !!config.apiKeyEnv;
                const textModels = AGNES_MODELS.filter((m) => m.category === 'text');
                const imageModels = AGNES_MODELS.filter((m) => m.category === 'image');
                const videoModels = AGNES_MODELS.filter((m) => m.category === 'video');
                return jsxs('div', {
                    style: {
                        padding: 20,
                        fontFamily: C.font,
                        color: C.textPrimary,
                        display: 'flex',
                        flexDirection: 'column',
                    },
                    children: [
                        // ---------- Header ----------
                        jsxs('div', {
                            style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
                            children: [
                                jsxs('div', {
                                    style: { display: 'flex', alignItems: 'center', gap: 8 },
                                    children: [
                                        jsx(StatusDot, { ok: apiKeyDeclared }),
                                        jsx('span', { style: { fontSize: 16, fontWeight: 700 }, children: displayName }),
                                    ],
                                }),
                                jsx(Badge, {
                                    tone: apiKeyDeclared ? 'green' : 'amber',
                                    children: apiKeyDeclared ? '已声明 API Key' : '未声明 API Key',
                                }),
                            ],
                        }),
                        // ---------- Info card ----------
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
                                jsx(InfoRow, {
                                    label: '已加载模型',
                                    value: `${configuredIds.size} / ${AGNES_MODELS.length}`,
                                }),
                            ],
                        }),
                        // ---------- Model groups ----------
                        jsx(ModelGroup, {
                            title: '文本模型',
                            subtitle: '支持对话、编码、工具调用',
                            models: textModels,
                            configuredIds,
                        }),
                        jsx(ModelGroup, {
                            title: '图像模型',
                            subtitle: '文生图 · 图生图 · 多图合成',
                            models: imageModels,
                            configuredIds,
                        }),
                        jsx(ModelGroup, {
                            title: '视频模型',
                            subtitle: '文生视频 · 图生视频 · 异步任务',
                            models: videoModels,
                            configuredIds,
                        }),
                        // ---------- Generation records ----------
                        jsx(GenerationRecordsPanel, { scope: recordsScope }),
                    ],
                });
            }
            ctx.slots.inject('settings.section', () => ctx.slots.register({
                name: 'settings.section',
                id: 'agnes-ai',
                order: 50,
                label: () => 'Agnes AI',
            }, AgnesPanel));
        }
        // ========================================================================
        // Module exports
        // ========================================================================
        exports.name = name;
        exports.inject = ['slots', 'locale', 'settingsScope'];
        exports.apply = apply;
        exports.AGNES_MODELS = AGNES_MODELS;
        exports.checkProviderExists = checkProviderExists;
        exports.getProviderState = getProviderState;
        exports.readAgnesSettings = readAgnesSettings;
        return exports;
    },
});
//# sourceMappingURL=index.js.map