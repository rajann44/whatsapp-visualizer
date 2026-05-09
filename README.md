# WhatsApp Visualizer

WhatsApp Visualizer is a privacy-first, Apple-inspired analytics workspace for exported WhatsApp chats. It is designed to feel calm, legible, and trustworthy: upload once, then explore a dedicated insights environment that surfaces communication patterns with clarity.

## Product Philosophy

- **Experience first**: a focused upload entry transitions into a desktop-grade insights workspace.
- **Native workspace feel**: sidebar navigation, focused content canvas, and optional inspector/sheet flows.
- **Local-first privacy**: parsing and analysis run in-browser, with no server upload pipeline.
- **Deterministic intelligence**: insights are metric-driven and explainable, not AI-generated speculation.
- **Visual restraint**: charts emphasize one clear takeaway at a time with minimal noise.

## Why It Feels Different

- Two-step flow: upload on `/`, then transition to `/insights`.
- macOS-inspired workspace structure: navigation rail + primary analysis canvas + optional inspector panel.
- Premium light/dark themes with calm surfaces, refined spacing, and subtle motion.
- Editorial dashboard hierarchy: Overview, Activity, People, Content, Patterns, Advanced.
- Advanced behavioral layer: drift, reciprocity, energy, curiosity, expressiveness, sessions, reconnection, topic drift.

## Charting and UX Principles

The visualization system follows Apple HIG-style chart intent:

- Prefer common chart forms (line, bar, heatmap) for immediate readability.
- Keep charts simple; reveal details progressively through focused interaction.
- Maintain continuity and consistency across chart cards (typography, tooltip, spacing, axis behavior).
- Use direct labeling and concise card-level interpretation to reduce legend/tooling dependency.
- Use restrained color and non-color cues; avoid visual overload.
- Add concise descriptive text (titles/subtitles/footers) to improve comprehension.
- Support accessibility (ARIA labels, keyboard-friendly controls where practical, reduced-motion behavior).

## Privacy

- No backend required.
- No telemetry by default (`NEXT_TELEMETRY_DISABLED=1`).
- Chat data remains on device for parsing and analysis.
- No third-party tracking scripts.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run start` — production server
- `npm run lint` — linting
- `npm run test` — test suite

---

## Technical Architecture

### Core stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS + Radix primitives
- JSZip (archive parsing)
- Zod (schema validation)
- date-fns (time/date operations)
- Recharts (visualizations)
- Vitest (tests)

### Project structure

- `app/` — routes, layout, global styles
- `components/ui/` — shared primitives
- `components/whatsapp/` — feature UI
- `components/whatsapp/visualization/chart-system.tsx` — reusable chart system primitives
- `components/whatsapp/workspace-provider.tsx` — client workspace state
- `lib/whatsapp/parser.ts` — parser pipeline
- `lib/whatsapp/analytics.ts` — core analytics pipeline
- `lib/whatsapp/advanced/` — derived behavioral analytics modules
- `lib/whatsapp/export.ts` — JSON/CSV export helpers
- `tests/` — parser/analytics/advanced tests

## Parser Assumptions and Robustness

Supported input patterns include:

- `[dd.mm.yy, HH:mm:ss] Name: Message`
- `M/D/YYYY, h:mm a - Name: Message`
- optional seconds and AM/PM
- mixed separators (`.`, `/`, `-`) and year widths (`yy`, `yyyy`)
- system lines without sender attribution

Handled irregularities:

- invisible Unicode markers (`\u200e`, bidi markers)
- multiline message continuation
- omitted media/document/sticker/GIF/contact markers
- call/system/security-code events
- URL extraction and domain normalization

Warnings for unparsable lines/timestamps are surfaced in the UI.

## Advanced Insights: Formulas and Assumptions

All advanced insights are deterministic and computed in-memory from parsed data.

- **Drift windows**
  - Baseline and recent windows split the timeline approximately in half.
  - Metrics: response time, message frequency, message length, question rate, emoji rate, initiator concentration, session frequency, session balance.
  - Thresholds: roughly within +/-8% = stable; beyond = warming/cooling by metric direction.

- **Session detection**
  - Default inactivity threshold: 90 minutes.
  - Session fields: starter, ender, dominant participant, reply estimate, energy score.

- **Reciprocity**
  - One-to-one: derived from message/reply/starter share spreads.
  - Group: participation concentration, top-speaker dominance, initiator diversity, response centrality.

- **Conversation energy index**
  - Weighted blend of messages/day, median reply speed, session density, burstiness, participant balance, continuity.
  - Used to identify high momentum, slow fade, reconnect spikes, dormant phases.

- **Curiosity and engagement**
  - Curiosity: question rate, follow-up chains, response depth, conversation-driving turns.
  - Engagement: initiations, response consistency, follow-up rate, revival starts, hanging-message rate.

- **Expressiveness**
  - Emoji rate, punctuation intensity, sharing rate, length variance, short-acknowledgement ratio.

- **Reconnection and silence**
  - Multi-hour inactivity gap analysis, silence-breaker patterns, reconnection energy.

- **Topic drift (no LLM)**
  - Monthly keyword/domain/emoji/attachment rollups + recurring phrase tracking.
  - Emerging/disappearing/stable topics from baseline vs recent bucket comparison.

### Limitations

- Small datasets can produce unstable drift/session metrics.
- Output is intentionally descriptive and non-diagnostic.
- Session-based interpretations are sensitive to inactivity threshold.
