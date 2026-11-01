# Browser check

Install Playwright in your development environment, install its Chromium browser, then run:

```sh
node tests/mobile.cjs
node tests/daily.cjs
node tests/chrome.cjs
node tests/insights.cjs
node tests/finance-demo.cjs
```

Optional environment variables:

- `MYDAY_PLAYWRIGHT_PATH`: installed Playwright module path, if not resolvable as `playwright`.
- `MYDAY_BROWSER_PATH`: Chrome or Chromium executable path.
- `MYDAY_QA_OUTPUT`: directory for screenshots. Defaults to a new temporary directory.
- `MYDAY_QA_PROFILE_ROOT`: writable parent directory for isolated browser profiles. Defaults to the system temporary directory.

The check serves repository files through Playwright request routing at a synthetic HTTPS origin. It uses an isolated browser profile, seeds disposable test records, and stubs external requests. It never connects to the published app or changes existing user data.

`mobile.cjs` covers quick task entry, whitespace validation, completion and undo, task-linked focus timer, pause/reset and persistence, habit keyboard controls, duplicate habits, draft preservation, task filters, search, browser history, retained menu sections, supported currency symbols, long titles, both themes, and navigation/layout at 320, 360, 390, 430, 768, 1024 and 1440 pixels.

`daily.cjs` covers a pinned main task, task editing and cancellation, preservation of completed substeps, planning tomorrow without changing deadlines, carry undo, evening reviews and tomorrow's priority, completed tasks, simplified navigation, effect preferences and system reduced motion, JSON backup export/import, timestamp-based daily-record merging, and responsive dialogs. It also generates light/dark overview screenshots with disposable sample records.

`chrome.cjs` checks the default chrome theme, reuse of the same canvas/context through navigation and theme changes, actual sculpture motion, a static frame under reduced motion, context-loss fallback, startup without WebGL, and task completion after graphics loss. It generates dark desktop/mobile screenshots. The graphics are procedural WebGL and SVG; no remote assets or libraries are used.

`insights.cjs` covers the light overview hero, expense validation and decimal amounts, creation/edit/reload/delete/undo, real period totals excluding future entries, daily/cumulative chart tables and keyboard navigation, custom and missing categories, search, month selection, monthly limits, four health charts with missing-record gaps, the habit heatmap, contextual illustrations, both themes, and chart dimensions/overflow across seven viewport widths.

`finance-demo.cjs` covers monthly income and category budgets, savings creation/deposits/withdrawals/overdraft rejection/persistence, responsive finance tabs, all populated navigation sections, JSON download, isolated personal/demo records and photos, typed confirmation, demo-only cleanup and full local cleanup while preserving unrelated application storage. Browser downloads use an explicit writable directory under the test profile.

Limits: service-worker installation/offline behavior, remote AI and cloud APIs, and physical mobile keyboards are not covered. Screenshot records are test fixtures, not user records.
