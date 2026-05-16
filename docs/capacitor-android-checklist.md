# Capacitor Android Checklist

This checklist is the recommended rollout path for shipping Android from this existing web codebase.

## 1) Foundation and privacy

- [x] Remove `@vercel/analytics` from runtime and dependencies.
- [x] Keep local-first messaging visible near upload CTA.
- [ ] Re-review Play Store Data Safety answers before release.

## 2) Capacitor setup

- [x] Install Capacitor packages: `@capacitor/core`, `@capacitor/android`, `@capacitor/cli`.
- [x] Add `capacitor.config.ts` with stable `appId`, `appName`, and `webDir`.
- [x] Add Android platform with `npx cap add android`.
- [x] Sync assets/plugins with `npx cap sync android`.
- [ ] Open Android Studio and complete Gradle sync locally (`npx cap open android`).

## 3) Build configuration for Android web assets

- [x] Set Next.js static export mode for Capacitor bundle (`output: "export"`).
- [x] Ensure metadata routes are static-export compatible (`robots.ts`, `sitemap.ts`).
- [x] Add npm scripts:
  - [x] `build:android`
  - [x] `cap:sync`
  - [x] `cap:open`

## 4) Usability and UX quality (Google-aligned)

- [x] Keep one clear upload CTA and explicit supported file format.
- [x] Keep drag-over, loading, success/error states clearly distinguishable.
- [x] Keep deterministic loading behavior and avoid layout shift.
- [ ] Ensure touch targets meet Android guidance (48dp equivalent).
- [ ] Verify text scaling/accessibility at large font sizes.
- [ ] Confirm color contrast in light/dark themes.

## 5) Mobile performance and stability

- [ ] Move heavy ZIP parsing to Web Worker for low-end Android devices.
- [ ] Add memory pressure handling guidance for very large exports.
- [ ] Test background/foreground interruptions during parse/upload.

## 6) Android polish

- [ ] Configure app icon and splash screen assets.
- [ ] Tune status bar and edge-to-edge behavior.
- [ ] Verify Android back behavior across routes and modals.
- [ ] Validate file picker behavior across OEM devices.

## 7) QA matrix before store submission

- [ ] Test Android 10, 12, 13, 14+ on real devices.
- [ ] Validate small-screen layout and keyboard interactions.
- [ ] Verify upload with multiple real WhatsApp ZIP exports.
- [ ] Verify offline launch and local asset loading.
- [ ] Smoke-test lint/build + Android sync on CI.

## Useful commands

```bash
npm run build:android
npm run cap:sync
npm run cap:open
```

## Notes

- If `gradle sync` fails with Java runtime errors, install a JDK (Android Studio usually manages this once opened).
- After changing web code, always run `npm run build:android && npm run cap:sync` before Android testing.
