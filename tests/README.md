# Browser checks

Run mobile.cjs, daily.cjs, insights.cjs, finance-demo.cjs, luxe.cjs, clarity.cjs and interactions.cjs with Node. Playwright and Chrome/Chromium are required. Each script runs independently and uses an isolated profile, synthetic HTTPS request routing and disposable records. It does not access the published app or personal data.

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
clarity.cjs: all 52 guide records, decoding every local image, source credits, zoom and Escape, adding an exercise to the workout, dark/light text contrast >=4.5, health-grid spacing, flat More lists and restored chrome and neutral graphite colours. It produces theme/layout/guide screenshots.

chrome.cjs checks retained canvas/context, real sculpture motion, reduced motion, context-loss recovery and the SVG fallback when WebGL is unavailable. Screenshot records are fixtures. Service-worker installation/offline behavior, remote APIs and physical mobile keyboards are not covered.

interactions.cjs uses native Chrome touch input with a mobile viewport to check task completion/postponement and undo, preservation of deadlines and the main task, purchase editing and undo, short/vertical/multi-touch/cancel rejection, ghost-click suppression, visible undo, progress-ring animation, chart morph/crossfade, savings feedback and reduced motion. This is browser touch emulation, not a physical-device test.

insights.cjs дополнительно проверяет выводы графиков: пик расходов совпадает с таблицей, пропущенные ночи исключены из среднего, несколько упражнений считаются одним днём тренировки, изменение веса имеет правильный знак; проверяется переход к записи тренировки и порядок главных дел перед статистикой.

`workspace.cjs`: реальные записи тренировки, сна, питания, веса и цели, сохранение после перезагрузки, вкладки журнала и возврат, раскрытие обзора с клавиатуры, состояние активного фокуса и все внутренние представления на 320/390/768/1440 px в обеих темах. Существующие проверки графиков раскрывают обзор перед взаимодействием.

`personalize.cjs`: палитры и крайние пользовательские цвета, контраст кнопок ≥4.5:1 в обеих темах, предпросмотр/отмена/Escape, сохранение и перезагрузка, обложки и плотность, сброс без удаления данных/настройки движения, JSON-копия/импорт и ширины 320–1440 px.

`day-flow.cjs`: фиксированное местное время, смена утра/дня/вечера и даты без перезагрузки, сохранение черновика, выбор главного и фокус, быстрые записи, однократный блик/отмена/reduced motion, вечерние итоги после перезагрузки и обе темы на 320–1440 px.

`finesse.cjs`: реальные touch-события графика, совпадение подсказки и значения, её границы, вертикальная прокрутка и неизменность данных, клавиатура/Escape, раскрытие карточки и удаление эффекта, reduced motion, активная навигация, разные SVG-обложки без пересечений и обе темы на 320–1440 px.
