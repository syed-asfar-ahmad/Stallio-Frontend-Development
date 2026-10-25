Phase 1: Tracking Engine, Public Touchpoints & Attribution
Objectives
Capture referral codes reliably across links, QR scans, and marketing pages.
Integrate a smooth referral experience on the seller registration page.
Establish safe routing precedence in App.tsx before /:username.
Technical & UX Deliverables
1. Client Attribution Engine (src/lib/referral.ts)
Storage Strategy: Stores { code: string, timestamp: number } in localStorage under key stallio_referral_attribution.
TTL Enforced: 30-day sliding window; expired codes are pruned on read.
Universal Capture Hook (useReferralCapture): Mounted at the root of App.tsx to detect ?ref=CODE or ?s=qr across marketing routes (e.g. /pricing, /features).
2. Short Link Redirect Handler (src/pages/ReferralRedirect.tsx)
Listens on /r/:code.
Fires non-blocking POST /api/referral/click with { code, source: query.get('s') === 'qr' ? 'qr' : 'link', referrer: document.referrer }.
Sets local attribution and performs navigate('/signup?ref=' + code, { replace: true }).
Displays Stallio's branded inline skeleton loader during redirection.
3. Seller Signup Referral UX (src/pages/Signup.tsx)
text
┌─────────────────────────────────────────────────────────────┐
│ Referral Code (Optional)                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ SUMMER25                                      [✓ Valid] │ │
│ └─────────────────────────────────────────────────────────┘ │
│  ✦ Referred by: Sarah Jenkins                               │
└─────────────────────────────────────────────────────────────┘
Live Debounced Lookup (400ms): Calls GET /api/referral/validate?code=.
3 Dynamic States:
Valid: Shows green pill chip: "Referred by [Name]".
Prefilled but Suspended/Expired: Shows amber warning: "Code no longer active, but you can continue signing up".
Manually Typed & Not Found: Inline red field error: "Invalid referral code".
Injects referralCode into the final signup() payload and clears attribution from localStorage once completed.
4. Route Precedence in App.tsx
Inserts /r/:code and /affiliate/* strictly above the /:username wildcard to prevent shop collisions.
Adds "Become an Affiliate" link to src/components/PublicLayout.tsx footer.
Phase 2: Auth Isolation & Design System Shell
Objectives
Guarantee complete auth separation between Sellers (stallio_token) and Affiliates (stallio_affiliate_token).
Build an Affiliate Shell matching Stallio's layout ergonomics while introducing the distinct Emerald theme.
Design System: Affiliate vs Seller Tokens
text
Tokens             Seller Theme                    Affiliate Theme
────────────────────────────────────────────────────────────────────────────────
Primary Accent     Brand Purple (#5b45e5)         Emerald (#059669 / #10b981)
Active Nav Pill    bg-brand-50 text-brand-900      bg-emerald-50 text-emerald-950
Dark Nav Pill      dark:bg-brand-950/60            dark:bg-emerald-950/50
Role Identifier    "Seller Dashboard"              "Affiliate Partner" [Badge]
Press Effect       dashboard-pressable             dashboard-pressable
Surfaces           bg-white / dark:bg-zinc-900     bg-white / dark:bg-zinc-900
Technical & UX Deliverables
1. Dedicated Auth Layer (src/affiliate/AffiliateAuthContext.tsx)
Reads/writes exclusively to stallio_affiliate_token.
State model: { affiliate: Affiliate | null, token: string | null, loading: boolean }.
Methods: login(), signup(), verifyEmail(), resendOtp(), logout(), updateProfile().
Does not import from or conflict with seller AuthContext.tsx.
2. Isolated API Client & Mock Adapter
src/affiliate/affiliateApi.ts: Handles automatic Bearer stallio_affiliate_token injection and unified error parsing.
src/affiliate/affiliateMock.ts: Complete in-memory mock engine toggled via VITE_AFFILIATE_MOCK=true. Allows 100% functional testing of every screen before backend endpoints exist.
3. Route Guard (src/affiliate/RequireAffiliate.tsx)
Redirects unauthenticated visitors to /affiliate/login?returnUrl=....
Shows Stallio's branded loader while restoring session.
4. Layout Shell (src/affiliate/AffiliateLayout.tsx)
Sidebar: Brand Logo + "Affiliate" pill badge, collapsible on desktop, drawer on mobile.
Navigation Items:
Overview (LayoutDashboard)
Referrals (Users)
Link & QR (QrCode)
Earnings (Wallet)
Payouts (CreditCard)
Settings (Settings)
TopBar: Quick balance chip ($124.00 Available), ThemeToggle, LanguageSwitcher, user profile dropdown, and "Open a Shop" cross-link.
5. Affiliate Auth Screens
/affiliate/signup: Includes full name, email, password, and mandatory legal terms checkbox: "I agree to the Affiliate Terms (no self-referrals, no search ad bidding, 30-day commission hold)".
/affiliate/verify-email: 6-digit OTP entry with a 60-second resend cooldown timer.
/affiliate/login: Email/password form with links to recovery.
/affiliate/forgot-password & /affiliate/reset-password: Tokenized password recovery flow.
Phase 3: The Affiliate Experience (Screens & Visual Design)
Objectives

Provide affiliates with an intuitive, self-service dashboard to track conversions, export marketing collateral, customize links, and manage payouts.

Screen Specifications & UX Blueprints
text
Affiliate Workspace Flow:
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ 1. Overview     │ ──> │ 2. Link & QR     │ ──> │ 3. Referrals     │
│ • Conversion Kpi│     │ • 1024px QR Card │     │ • Masked Emails  │
│ • Recharts Trend│     │ • Live Slug Check│     │ • Trial Status   │
└─────────────────┘     └──────────────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ 4. Earnings     │ ──> │ 5. Payouts       │ ──> │ 6. Settings      │
│ • 30-Day Hold   │     │ • Min Threshold  │     │ • Password Guard │
│ • Reversals     │     │ • History        │     │ • Payout Target  │
└─────────────────┘     └──────────────────┘     └──────────────────┘
Screen 1: Dashboard Overview (/affiliate/dashboard)
Notice Banner: "You earn 20% on every referred seller's first paid plan (Basic at $5 pays $1.00; Business yearly at $50 pays $10.00)."
6 Stat Cards (StatCard.tsx):
Unique Clicks
Signups
In Trial
Paid Customers
Pending Earnings (in 30-day hold)
Ready for Payout Balance
Visual Conversion Funnel (FunnelChart.tsx): Clicks → Signups → Email Verified → Active Trial → Paid Plan
Time-Series Chart (ClicksChart.tsx): Daily clicks vs signups with 7d / 30d / 90d range selectors and dark mode tooltip styling.
Screen 2: Referrals Table (/affiliate/dashboard/referrals)
Filters: Search by shop name + Status filter tabs (All, In Trial, Paid, Churned, Flagged).
Table Columns:
Store Name & Logo placeholder
Masked Email (s***h@gmail.com for privacy)
Code Used (e.g. primary or alias)
Signed Up Date
Trial Expiry Date
Unified Status Badge (StatusBadge.tsx)
Pagination: Reusing AdminPagination.tsx.
Empty State: Friendly graphic with button: "Share Your Link & QR to Get Started".
Screen 3: Link, Code & QR Studio (/affiliate/dashboard/link)
Referral Link Card (ReferralLinkCard.tsx):
Displays stallio.shop/r/CODE.
1-click Copy button with immediate toast feedback.
WhatsApp 1-tap share with prefilled invite message.
Native Mobile Share Sheet trigger (navigator.share).
High-Res QR Code Studio (QrCard.tsx):
Powered by qrcode.react (QRCodeSVG).
Always rendered dark modules on pure white container with 
≥
4
≥4 modules margin for 100% camera readability in dark mode.
Export Buttons:
Download Vector .SVG
Download 1024×1024px High-Res .PNG (drawn on canvas)
Print Marketing Card (window.print() using a clean @media print template)
Live Custom Slug Editor (CustomCodeEditor.tsx):
Input field with real-time character validation (4-20 chars, a-z0-9-).
Debounced availability check (/api/affiliate/code/check?code=).
Informative callout: "Your previous codes remain permanent aliases. Printed QR codes and existing links will never break."
Conflict resolution: Handles HTTP 409 gracefully with inline notice: "Just taken by another user, please try another".
Screen 4: Earnings & Commission Ledger (/affiliate/dashboard/earnings)
Metric Cards:
Total Earned to Date
Held in 30-Day Escrow (Pending)
Approved & Ready for Payout
Clawed Back / Reversed
Ledger Table:
Referral Store
Purchased Plan (Basic Monthly or Business Yearly)
Base Payment Amount ($5.00)
Rate Applied (20%)
Affiliate Commission ($1.00)
Status & Countdown ("Approved in 14 days" or "Approved")
Reversal Disclosure: If reversed, shows reason tag (e.g. "Payment refunded by admin").
Screen 5: Payouts & Threshold Tracker (/affiliate/dashboard/payouts)
Balance Card: Displays current approved earnings.
Progress Bar: Visual indicator toward minimum payout threshold (e.g. $35.00 / $50.00 minimum).
Active Payout Method Card:
Shows method type (Bank Transfer, PayPal, or Wise).
Security mask: Displays only the last 4 characters (•••• 4412).
Cooldown warning: "Changes to payout details require admin review before the next monthly run."
Payout History Table:
Date
Amount
Method
Batch ID / Bank Reference
Status Badge (processing, paid, failed)
Screen 6: Account & Security Settings (/affiliate/dashboard/settings)
Profile update (Full Name, Contact Email).
Password change with strength meter.
Secure Payout Credentials Modal: Editing bank details or PayPal email strictly requires entering the current password to prevent unauthorized tampering.
Phase 4: Admin Governance & Subscription Hooks
Objectives

Empower administrators to audit referrals, process monthly payment batches, resolve flags, and configure program rates.

Technical & UX Deliverables
text
Admin Extensions:
├── /admin/affiliates            (List, Search, Metrics, Suspend/Reactivate)
├── /admin/affiliates/:id        (Single Affiliate: Aliases, Referrals, Ledger)
├── /admin/referrals             (Global Referrals + Flagged Review Queue)
├── /admin/commissions           (Platform-wide Commission Ledger & Manual Reversal)
├── /admin/payouts               (Monthly Payout Batch Builder & Reference Logger)
└── /admin/affiliate-settings    (Rate bps, Hold Days, Payout Deadline, Min Payout)
1. Integration in AdminSubscriptions.tsx
In the seller subscriptions list and payment drawer:
Add visual chip: "Referred by @ahmad (20% commission)".
When admin records a payment: Modal displays note: "A qualified commission of $1.00 will be created for affiliate @ahmad."
When admin deletes a payment: Modal warns: "Deleting this payment will reverse the linked affiliate commission."
2. Flagged Referrals Review Queue (/admin/referrals)
Filters referrals by status === 'rejected' or flagReason != null.
Admin action modal:
Approve: Clears flag, restores referral to trial/paid, generates commission if qualified.
Reject: Sets status permanently to rejected.
Reassign: Allows admin to manually attribute the seller to a different affiliate ID.
3. Monthly Batch Payout Builder (/admin/payouts)
1-click action: "Generate Monthly Batch".
Aggregates all affiliates whose approved balance meets minimumPayoutCents.
Generates a downloadable CSV for bank/PayPal mass payouts.
Mark as Paid modal: Ingests transaction reference code and marks all attached commissions as paid.
4. Program Configuration (/admin/affiliate-settings)
Editable system controls:
Default Commission Rate (e.g. 2000 bps = 20%)
Hold Period Days (e.g. 30 days)
Pay Qualification Deadline (e.g. 90 days from signup)
Minimum Payout Threshold (e.g. $50.00)
Reserved Words Editor for Custom Slugs.
Phase 5: QA, Accessibility, Edge Cases & Verification
Objectives

Rigorous verification of edge cases, accessibility compliance, and visual perfection.

Edge Case Matrix & Safeguards
Scenario	UX / Technical Safeguard
Safari 7-day ITP Storage Limit	Attribution is recorded instantly on /r/:code visit; if user signs up in the same session, storage TTL is irrelevant. Fallback URL param ?ref= persists across navigation.
Code Availability Race Condition	Frontend check is an optimistic hint. If two users save the same slug simultaneously, the backend returns HTTP 409; the UI highlights the input in amber: "Code was just claimed, please choose another".
Suspended Affiliate Scans	The validate endpoint returns { valid: false }. Seller signup displays no error and allows the merchant to sign up normally without attribution.
QR Code in Dark Mode	The QR code container strictly enforces a pure #ffffff background with generous quiet padding so mobile camera lenses never fail to detect the marker.
Mobile Navigation & RTL	Sidebar transforms into a touch-friendly slide-over drawer with backdrop blur. All icons and tables flip correctly under Arabic (ar) RTL mode.
Screen Readers (a11y)	Copy buttons include dynamic aria-live="polite" feedback ("Referral link copied to clipboard"). Status badges contain high-contrast accessible text equivalents.
Implementation Plan Summary
Phase	Core Deliverables	Estimated Files
Phase 1	referral.ts, reservedWords.ts, ReferralRedirect.tsx, Signup.tsx integration	4 files
Phase 2	AffiliateAuthContext.tsx, affiliateApi.ts, affiliateMock.ts, AffiliateLayout.tsx, 4 Auth pages	9 files
Phase 3	Reusable components (QrCard, StatusBadge, StatCard, etc.) + 6 Dashboard pages	13 files
Phase 4	5 Admin Affiliate pages + AdminSubscriptions.tsx hook integration	6 files
Phase 5	Mock data validation, cross-browser verification, mobile responsiveness & RTL audit	Full pass

This structured implementation delivers a robust, secure, and visually cohesive Affiliate System for Stallio.