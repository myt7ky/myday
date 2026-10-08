# MyDay PWA

Это версия «Мой день», подготовленная для публикации через GitHub Pages и установки на iPhone как web app.

## Важно

- `index.html` — bootstrap-страница.
- `app.gz` — полный интерфейс приложения в gzip-архиве.
- `manifest.webmanifest` — PWA-настройки и имя.
- `sw.js` — офлайн-кэш.
- `icons/` — иконки.

## Публикация

В GitHub включите **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)**.

После публикации откройте адрес сайта в Safari на iPhone и выберите **Поделиться → На экран «Домой»**. В iOS 16.4+ Safari поддерживает Compression Streams/DecompressionStream, которые используются загрузчиком этого пакета.