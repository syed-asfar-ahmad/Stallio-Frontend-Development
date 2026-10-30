# Help / Support center (marketing)

## Goal

A simple, searchable public Help center on the marketing site so sellers can find step-by-step answers without opening a ticket first. Closer to a light docs hub than GitHub Docs (no left sidebar, no versioning).

## Audience

Marketing / public only (`PublicLayout`). Not inside the seller dashboard.

## UX

- **Hub** `/help`: short hero, search field, category chips, filtered article list (title + excerpt). Empty results point to `/contact`.
- **Article** `/help/:slug`: back link, category label, title, intro, numbered steps, related guides, Contact CTA. Unknown slug: not-found state with link back to `/help`.
- No left sidebar. No CMS.

## Content model

- Typed catalog in `src/lib/helpCatalog.ts`: `slug`, `category`, English `keywords` for search.
- Copy in `src/locales/{en,es,ar}/help.json`: hub chrome + per-article `title`, `excerpt`, `intro`, `steps[]`.
- Search matches query against keywords plus localized title, excerpt, and steps.

## Categories

- `account`: delete, restore, suspension, after suspension
- `access`: login issues, password reset
- `billing`: cancel/upgrade, billing problems, refunds

## Starter articles (v1)

1. `delete-account`
2. `restore-account`
3. `account-suspended`
4. `after-suspension`
5. `login-issues`
6. `reset-password`
7. `cancel-or-change-plan`
8. `billing-problems`
9. `request-refund`

Steps should match real product behavior (Settings delete phrase, Forgot Password flow, Terms/Refund Policy, Contact, dashboard support chat when accessible).

## Integration

- Routes registered before `/:username`.
- Footer Links column: Help next to Contact.
- Locale key `layout.nav.help` in en/es/ar.
- Wire `help.json` into `src/i18n/config.ts`.

## Out of scope

- Dashboard-embedded help
- CMS / markdown pipeline
- Live chat widget on Help pages
- Shopper-specific buyer guides
