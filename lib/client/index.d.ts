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
declare const moduleLoader: any;
//# sourceMappingURL=index.d.ts.map