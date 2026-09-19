/**
 * Agnes AI Client Plugin for DeepSeek Harness
 *
 * Provides:
 * 1. A dedicated Agnes AI settings panel in the DSH sidebar
 * 2. Detection of whether the agnes-ai provider is configured
 * 3. Display of configured models and their status
 * 4. Quick-add guidance for new users
 *
 * NOTE: This is a DSH client bundle entry. It MUST self-register via
 * `window.__ModuleLoader__.load({ id, factory })`.
 */

const moduleLoader = (globalThis as any).__ModuleLoader__

moduleLoader.load({
  id: 'agnes-ai-for-dsh',
  factory: (require: any) => {
    const exports: any = {}
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })

    // ------------------------------------------------------------------
    // React (via factory require)
    // ------------------------------------------------------------------
    let React: any = null
    let jsx: any = null
    let jsxs: any = null
    try {
      React = require('react')
      const rt = require('react/jsx-runtime')
      jsx = rt.jsx
      jsxs = rt.jsxs
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[agnes-ai-for-dsh-client] failed to require react:', error)
    }

    // ========================================================================
    // Types
    // ========================================================================

    interface AgnesModelInfo {
      id: string
      name: string
      description: string
      isFree: boolean
      category: 'text' | 'image' | 'video'
      supportsImageInput?: boolean
      contextWindow?: number
      maxTokens?: number
    }

    interface AgnesProviderState {
      exists: boolean
      hasApiKey: boolean
      models: AgnesModelInfo[]
      error?: string
    }

    // ========================================================================
    // Model Catalog (fallback reference)
    // ========================================================================

    const AGNES_MODELS: AgnesModelInfo[] = [
      { id: 'agnes-2.5-flash', name: 'Agnes 2.5 Flash', description: '免费·多模态对话·编码优化·智能体工作流', isFree: true, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
      { id: 'agnes-3.0-flash', name: 'Agnes 3.0 Flash', description: '免费·新一代Agent编程模型·工具调用强化', isFree: true, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
      { id: 'agnes-2.5-pro', name: 'Agnes 2.5 Pro', description: '付费·高级推理·科学计算·长上下文分析', isFree: false, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
      { id: 'agnes-2.5-pro-beta', name: 'Agnes 2.5 Pro Beta', description: '付费·打榜模型·Artificial Analysis评测', isFree: false, category: 'text', supportsImageInput: true, contextWindow: 524288, maxTokens: 65536 },
      { id: 'agnes-image-2.1-flash', name: 'Agnes Image 2.1 Flash', description: '免费·文生图·图生图·多图合成', isFree: true, category: 'image' },
      { id: 'agnes-image-2.5-flash', name: 'Agnes Image 2.5 Flash', description: '免费·最新一代图像模型·全面超越2.1版本', isFree: true, category: 'image' },
      { id: 'agnes-video-v2.0', name: 'Agnes Video V2.0', description: '免费·文生视频·图生视频·关键帧动画', isFree: true, category: 'video' },
      { id: 'agnes-video-25-flash', name: 'Agnes Video 2.5 Flash', description: '免费·异步任务API·720P专享', isFree: true, category: 'video' },
      { id: 'agnes-video-25', name: 'Agnes Video 2.5', description: '付费·多分辨率·首尾帧控制·多模态参考', isFree: false, category: 'video' },
    ]

    // ========================================================================
    // Provider helpers
    // ========================================================================

    const AGNES_PROVIDER_ID = 'agnes-ai'

    function checkProviderExists(ctx: any): boolean {
      try {
        const providers = ctx.llm?.listProviders?.() ?? []
        return providers.some((p: { id: string }) => p.id === AGNES_PROVIDER_ID)
      } catch {
        return false
      }
    }

    async function getProviderState(ctx: any): Promise<AgnesProviderState> {
      const exists = checkProviderExists(ctx)
      if (!exists) {
        return { exists: false, hasApiKey: false, models: [], error: 'Provider not configured' }
      }
      return { exists: true, hasApiKey: false, models: [...AGNES_MODELS] }
    }

    async function readAgnesSettings(_ctx: any): Promise<{
      configured: boolean
      hasApiKey: boolean
      models: string[]
    }> {
      return { configured: false, hasApiKey: false, models: [] }
    }

    // ========================================================================
    // Client Entry Point
    // ========================================================================

    const name = 'agnes-ai-for-dsh-client'

    function apply(ctx: any): void {
      // eslint-disable-next-line no-console
      console.log('[agnes-ai-for-dsh-client] apply() invoked')

      // 绑定到 llm-pi-ai 命名空间
      let scope: any = null
      try {
        scope = ctx.settingsScope.bind({ namespace: 'llm-pi-ai' })
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[agnes-ai-for-dsh-client] settingsScope.bind failed:', error)
      }

      /**
       * 通过 SettingsScopeController.getSnapshot() 读取当前 llm-pi-ai 的 section，
       * 然后取出 providers['agnes-ai']。
       */
      function readAgnesConfig(): any {
        if (!scope) return null
        try {
          const snapshot = scope.getSnapshot()
          // eslint-disable-next-line no-console
          console.log('[agnes-ai-for-dsh-client] snapshot:', snapshot)
          if (!snapshot || snapshot.status !== 'ready') return null
          const v = snapshot.value
          if (!v) return null
          const providers = (v as any).providers
          return providers?.['agnes-ai'] ?? null
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('[agnes-ai-for-dsh-client] read scope failed:', error)
          return null
        }
      }

      function AgnesPanel(_props: any) {
        if (!React) {
          return jsx('div', { style: { padding: 16 }, children: 'React unavailable' })
        }

        const [config, setConfig] = React.useState(readAgnesConfig)

        React.useEffect(() => {
          if (!scope) return
          const handler = () => setConfig(readAgnesConfig())
          let dispose: any
          try {
            if (typeof scope.subscribe === 'function') {
              dispose = scope.subscribe(handler)
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[agnes-ai-for-dsh-client] subscribe failed:', error)
          }
          return () => {
            try {
              if (typeof dispose === 'function') dispose()
            } catch {
              /* ignore */
            }
          }
        }, [])

        if (!config) {
          return jsx('div', {
            style: { padding: 16, lineHeight: 1.6 },
            children:
              '尚未检测到 Agnes AI 配置。请前往「模型」设置中添加 agnes-ai provider，或编辑插件目录下的 cordis.patch.yml。',
          })
        }

        const models: any[] = Array.isArray(config.models) ? config.models : []
        const baseURL = String(config.baseURL || '-')
        const apiKeyEnv = String(config.apiKeyEnv || 'AGNES_API_KEY')
        const displayName = String(config.displayName || 'Agnes AI')

        return jsxs('div', {
          style: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12, lineHeight: 1.6 },
          children: [
            jsx('h3', { style: { margin: 0 }, children: displayName }),
            jsxs('div', {
              children: ['API Base URL：', jsx('code', { children: baseURL })],
            }),
            jsxs('div', {
              children: ['API Key 环境变量：', jsx('code', { children: apiKeyEnv })],
            }),
            jsx('div', { children: `已配置模型：${models.length} 个` }),
            models.length > 0
              ? jsx('ul', {
                  style: { paddingLeft: 20, margin: 0 },
                  children: models.map((m: any) =>
                    jsx(
                      'li',
                      { children: `${m.name || m.id} — ${m.id}` },
                      String(m.id),
                    ),
                  ),
                })
              : null,
          ],
        })
      }

      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: 'agnes-ai',
            order: 50,
            label: () => 'Agnes AI',
          },
          AgnesPanel,
        ),
      )
    }

    // ========================================================================
    // Module exports
    // ========================================================================

    exports.name = name
    exports.inject = ['slots', 'locale', 'settingsScope']
    exports.apply = apply
    exports.AGNES_MODELS = AGNES_MODELS
    exports.checkProviderExists = checkProviderExists
    exports.getProviderState = getProviderState
    exports.readAgnesSettings = readAgnesSettings

    return exports
  },
})