# WhatsApp Visualizer

Privacy-first WhatsApp chat analytics.

Upload a WhatsApp export ZIP and explore clear insights for activity, response behavior, participation, and content patterns.

## Highlights

- Local-first: chat data is processed on-device.
- Deterministic metrics: no AI-generated guesses.
- Two-step flow: upload on `/`, analyze on `/insights`.
- Export summaries: JSON and CSV.
- Web + Android support (Capacitor).

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Main Scripts

- `npm run dev` - run locally
- `npm run build` - production web build
- `npm run lint` - lint codebase
- `npm run test` - run tests

### Android (Capacitor)

- `npm run build:android` - static web build for native shell
- `npm run cap:sync` - sync web assets/plugins to Android
- `npm run cap:open` - open Android Studio project

Debug APK output:

- `android/app/build/outputs/apk/debug/app-debug.apk`

## Project Structure

- `app/` - routes and global styles
- `components/` - UI and feature components
- `lib/whatsapp/` - parser, analytics, export logic
- `android/` - Capacitor Android project
- `tests/` - parser and analytics tests

## Notes

- Supported input: WhatsApp export `.zip` files.
- If parsing warnings occur, they are shown in the UI.
- For Android rollout details, see `docs/capacitor-android-checklist.md`.
