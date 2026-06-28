# Changelog

## v1.1.3 - Stability Release
- Fixed startup failure caused by missing Settings render path.
- Added safe per-screen rendering. If one area fails, the rest of the app remains usable.
- Added Diagnostics screen with startup log.
- Added reset local data recovery option.
- Updated cache/version identifiers to 1.1.3.

# v1.1.2 — Reliability Update

- Added a startup failsafe so the splash screen cannot hang indefinitely.
- Added a friendly startup recovery screen with reload and cache-clear options.
- Added cache-busted asset URLs and a new service worker cache version.
- Hardened startup against storage/load errors.

# Changelog

## v1.1.0

- Added Foundation account types: Emergency Fund and Retirement.
- Reflection Engine now treats debt and foundation accounts differently.
  - Debt decreasing is progress.
  - Foundations increasing is progress.
- Weekly Review observations now separate Debt and Foundations where appropriate.
- Added Season Check-In from Current Season detail.
- Added Season Transition reflection flow.
- Added canonical transition encouragement:
  - "Seasons change. The goal isn't to stay in one forever. The goal is to recognize what deserves your attention today."
- Updated documents with Season Transition and Foundations principles.

## v1.0.1

- Focus card opens Focus account detail.
- Season card opens Current Season detail.
- Review balance changes show during entry.
- Command spacing tightened.


## v1.1.1 — Interaction Polish
- Split Accounts into Active Debts and Foundations.
- Simplified Add Account flow; Foundation accounts hide debt-only fields.
- Reordered Command page to Weekly Review, Season, Focus.
- Added logo reflection line on Command.
- Added pointed Season Reflection questionnaire with recommendation.
- Balance change reflections now allow notes for meaningful increases or decreases.
- Improved privacy copy and form save placement.
