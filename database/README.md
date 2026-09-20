# Production analytics setup

1. Create/select a Supabase project and run `database/analytics.sql` once in its SQL editor.
2. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASS`, and `ADMIN_SESSION_SECRET` in server environment settings, then redeploy. The session secret must be independently random and at least 32 characters. Use a strong random admin password (up to 256 characters).
3. Remove and rotate the previously configured `NEXT_PUBLIC_ADMIN_PASS` and `NEXT_PUBLIC_ADMIN_PASSCODE`. Public-prefixed values must not serve as admin credentials. Existing server-only `ADMIN_PASSCODE` or `ADMIN_PASSWORD` are accepted aliases for `ADMIN_PASS`.
4. Visit pages, run a supported tool, then sign in at `/admin`. Check ingestion responses, rows in Supabase, live sessions, all ranges, and idle expiry. Never insert sample traffic in production.

The Data API must expose `public`; only `service_role` can access analytics tables/functions. RLS is enabled with no public policies. No SDK or browser database key is used. Database failure returns 503, never a local fallback. Admin login also fails closed without database-backed rate limiting (20 attempts per 15-minute global window). Apply a Vercel Firewall rate rule to ingestion/login if abuse occurs; anonymous ingestion cannot prove a browser is human.

One ingestion RPC per event or visible-tab heartbeat (~30 seconds); one aggregate admin RPC per 15 seconds while visible. Heartbeats update a session, not the event log. SQL aggregates all matching rows without REST row-limit truncation. Live list is capped at 100, recent activity at 50, top pages at 20.

Today uses Asia/Dubai midnight. Seven/thirty days include today plus the preceding six/twenty-nine Dubai calendar days. Cards always show Today; filters apply to charts/breakdowns/feed. No midnight deletions. Visitors are distinct session IDs, not cross-device people; sessionStorage keeps identity anonymous without fingerprinting. Session duration accumulates observed intervals up to 90 seconds, excluding longer gaps, and may undercount the final interval. Unknown outcomes/countries are explicitly labeled. Existing completed actions report success; supported execution error handlers report failure. Other callers can leave outcomes unknown. Browser/OS/device families are coarse user-agent classifications.

Stored data: random UUIDs, server timestamps, allowlisted public paths (queries/fragments stripped), referrer hostname, restricted UTM labels, coarse device families and Vercel country when available. No IPs, raw user agents, sensitive headers, documents, filenames, form contents, or names/emails are collected intentionally. Do not put personal data in campaign labels. Obvious crawlers including Google inspection tools are ignored, not blocked from the site. Admin visits are excluded.

Review retention needs and schedule database cleanup separately if desired. No existing data is deleted by this implementation.

References: https://supabase.com/docs/guides/api/securing-your-api and local Next.js 16.3.5 route-handler/cookies documentation.

## Verification performed

- `npm run build`, `npm run lint`, and `git diff --check`.
- Isolated PGlite PostgreSQL-compatible engine: schema execution, empty state, 1/7/30-day Dubai windows, midnight preservation, overnight visitors, RLS/grants, duplicate event IDs, heartbeat duration, live expiry, tool outcomes and persistent login budget.
- Local production build with a test-only SQL transport adapter: actual browser homepage load, Next navigation to Merge PDF, a real merge of two locally generated PDFs, heartbeat, login, protected analytics, empty/nonempty dashboard, range selectors, desktop/mobile screenshots and no browser errors. The adapter and test traffic are outside the project and are not a runtime fallback.
- Without credentials: ingestion and login return 503, detailed analytics returns 401. Also checked foreign-origin rejection, invalid UUID/path/range, 4 KiB limits, secure cookie attributes and Google inspection exclusion.

A real Supabase REST connection, deployed Vercel headers and production persistence still require verification after external setup. No production credentials were created or changed; no production test traffic was inserted.
