# Browser checks

Run mobile.cjs, daily.cjs, insights.cjs, finance-demo.cjs, luxe.cjs and clarity.cjs with Node. Playwright and Chrome/Chromium are required. Each script runs independently and uses an isolated profile, synthetic HTTPS request routing and disposable records. It does not access the published app or personal data.

Environment variables:
- MYDAY_PLAYWRIGHT_PATH: installed Playwright module path.
- MYDAY_BROWSER_PATH: Chrome/Chromium executable.
- MYDAY_QA_OUTPUT: screenshot directory.
- MYDAY_QA_PROFILE_ROOT: writable parent for isolated profiles.

mobile.cjs: quick entry, undo, focus, habits, drafts, filters, search, navigation and layouts at 320–1440 px in both themes.
daily.cjs: main task, editing, substeps, tomorrow planning without changing deadlines, reviews, preferences, reduced motion and backup/import.
insights.cjs: real expense totals, periods, cents, history, charts/tables, category filters, limits and health records.
finance-demo.cjs: income/categories, savings transactions, persistence, backups, isolated demo records/photos and typed local cleanup.
luxe.cjs: daily rings, category donut keyboard selection, smooth paths, reveal effects and reduced motion.
clarity.cjs: all 52 guide records, decoding every local image, source credits, zoom and Escape, adding an exercise to the workout, dark/light text contrast >=4.5, health-grid spacing, flat More lists and absence of decorative WebGL. It produces theme/layout/guide screenshots.

chrome.cjs is a compatibility alias for clarity.cjs; the decorative WebGL renderer was removed. Screenshot records are fixtures. Service-worker installation/offline behavior, remote APIs and physical mobile keyboards are not covered.
