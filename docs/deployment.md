# Deployment

The site is deployed to **Cloudflare Pages** by GitHub Actions ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)).

| Event | Deploys to |
| --- | --- |
| Push to `main` | Production deployment of the Pages project: `schltr.pages.dev` and every custom domain attached to it |
| Pull request | Preview at `<branch>.schltr.pages.dev` (Cloudflare marks previews `noindex`) |
| Manual run (Actions → Deploy → Run workflow) | Same as a push to the chosen branch |

Until go-live, the **only** custom domain attached to the project is `staging.schltr.com`. Whatever serves `schltr.com` today is not touched by anything in this setup until you do the [go-live](#go-live) steps.

`deploy/_headers` adds `X-Robots-Tag: noindex` for `staging.schltr.com` and `*.pages.dev`, so staging doesn't show up in search results. `schltr.com` is not matched by it.

The workflow skips the build while there is no `package.json`, and skips the deploy (with a warning, not a failure) while the Cloudflare secrets aren't set.

## One-time setup (staging)

### 1. Current setup

schltr.com is registered at **Namecheap**, which also runs its DNS (Namecheap BasicDNS), and the site is served by **Adobe Portfolio**. Staging only adds one `staging` record at Namecheap; the Adobe records stay as they are.

### 2. Cloudflare account

Sign up at <https://dash.cloudflare.com/sign-up> if you don't have an account. The free plan is enough.

Copy your **Account ID**: on the dashboard home, open the account menu (⋯ next to the account name) → *Copy account ID*. It is also shown in the URL: `dash.cloudflare.com/<account id>/…`.

### 3. API token for GitHub Actions

*My Profile → API Tokens → Create Token → Create Custom Token*

- Name: `github-actions-schltr`
- Permissions: **Account → Cloudflare Pages → Edit**
- Account Resources: Include → your account

Create it and copy the token (it's only shown once).

### 4. GitHub secrets

In the repo: *Settings → Secrets and variables → Actions → New repository secret*

- `CLOUDFLARE_API_TOKEN` = the token from step 3
- `CLOUDFLARE_ACCOUNT_ID` = the account ID from step 2

The next push to `main` (or *Actions → Deploy → Run workflow* on `main`) builds the site, creates the Pages project `schltr` if it doesn't exist and deploys it. The run summary shows the URL. Open it to check the site.

> If `schltr.pages.dev` was already taken by someone else, Cloudflare gives the project a suffixed address such as `schltr-4xk.pages.dev`. Use that address wherever this guide says `schltr.pages.dev`. It's shown under *Workers & Pages → schltr*.

### 5. Attach staging.schltr.com

*Workers & Pages → schltr → Custom domains → Set up a custom domain* → enter `staging.schltr.com` → *Continue*.

Do this in the dashboard **before** adding any DNS record yourself, otherwise the subdomain shows a Cloudflare 522 error.

Then, in Namecheap: *Domain List → schltr.com → Manage → Advanced DNS → Add New Record*:

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| CNAME Record | `staging` | `schltr.pages.dev` | Automatic |

Leave every other record (the Adobe Portfolio `@`/`www` records, any mail records) as it is.

The domain shows *Active* once DNS and the TLS certificate are ready (usually minutes, can take up to a day). From then on, every merge to `main` is live at <https://staging.schltr.com>.

### Optional: password-protect staging

`noindex` keeps staging out of search engines but anyone with the URL can open it. To restrict it to you, put a Cloudflare Access application (Zero Trust → Access → Applications → Self-hosted, free for up to 50 users) in front of `staging.schltr.com` with an email login policy. This needs schltr.com's DNS on Cloudflare, so it's only possible after the nameserver move in go-live step 1.

## Go-live

Do this only when staging looks right. This is the step that changes schltr.com.

1. **Move schltr.com's DNS from Namecheap to Cloudflare.** Pages can only serve an apex domain (`schltr.com` without a subdomain) from a Cloudflare zone. Namecheap stays the registrar.
   - In Cloudflare: *Add a site* → `schltr.com` → Free plan. Cloudflare imports the existing records.
   - Compare them with Namecheap's *Advanced DNS* page. The Adobe Portfolio `@`/`www` records and the `staging` CNAME must be there so nothing changes yet.
   - **Email:** Namecheap's free email forwarding stops working once the nameservers move. If you use it, set up *Email → Email Routing* in Cloudflare first (it supports a catch-all address). For a mail host like Fastmail or Google, check its MX and SPF/DKIM/DMARC TXT records were imported.
   - In Namecheap: *Domain List → schltr.com → Manage → Nameservers → Custom DNS* → enter the two Cloudflare nameservers. With identical records, the Portfolio site keeps working during the switch.
2. **Attach the production domains**: *Workers & Pages → schltr → Custom domains* → add `schltr.com`, then `www.schltr.com`. This is the moment visitors start seeing the new site. Cloudflare replaces the old Adobe `@`/`www` records with ones pointing at Pages. Afterwards, remove the custom domain in Adobe Portfolio's site settings.
3. **Redirect www to the apex** (or the other way round): *Rules → Redirect Rules → Create rule → "Redirect from WWW to root"* template.
4. **Staging after launch** (pick one):
   - Drop it: remove `staging.schltr.com` under Custom domains and its DNS record, and use the per-PR preview URLs instead.
   - Keep a permanent staging: add `staging` to `on.push.branches` in the workflow, push a `staging` branch, then change the `staging` CNAME target from `schltr.pages.dev` to `staging.schltr.pages.dev`. Staging then shows the `staging` branch while `main` is production.

## Rolling back

*Workers & Pages → schltr → Deployments* → pick an earlier deployment → *⋯ → Rollback to this deployment*. That's instant and doesn't need a new build.
