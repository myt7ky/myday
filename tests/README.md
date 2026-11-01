# Browser check

Install Playwright in your development environment, install its Chromium browser, then run:

```sh
node tests/mobile.cjs
```

Optional environment variables:

- `MYDAY_PLAYWRIGHT_PATH`: installed Playwright module path, if not resolvable as `playwright`.
- `MYDAY_BROWSER_PATH`: Chrome or Chromium executable path.
- `MYDAY_QA_OUTPUT`: directory for screenshots. Defaults to a new temporary directory.
- `MYDAY_QA_PROFILE_ROOT`: writable parent directory for isolated browser profiles. Defaults to the system temporary directory.

The check serves repository files through Playwright request routing at a synthetic HTTPS origin. It uses an isolated browser profile, seeds disposable test records, and stubs external requests. It never connects to the published app or changes existing user data.

Coverage: quick task entry, whitespace validation, completion and undo, task-linked focus timer, pause/reset and persistence, habit keyboard controls, duplicate habits, draft preservation, task filters, search, browser history, every existing section, supported currency symbols, long titles, both themes, and navigation/layout at 320, 360, 390, 430, 768, 1024 and 1440 pixels.

Limits: service-worker installation/offline behavior, remote AI and cloud APIs, and physical mobile keyboards are not covered. Screenshot records are test fixtures, not user records.
