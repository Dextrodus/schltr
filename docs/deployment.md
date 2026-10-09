# Deployment

The site is deployed to **Cloudflare Pages** by GitHub Actions ([`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)).

| Event | Deploys to |
| --- | --- |
| Push to `main` | Production deployment of the Pages project: `schltr.pages.dev` and every custom domain attached to it |
| Pull request | Preview at `<branch>.schltr.pages.dev` (Cloudflare marks previews `noindex`) |
| Manual run (Actions → Deploy → Run workflow) | Same as a push to the chosen branch |

**Until go-live, `schltr.pages.dev` is the staging site.** No custom domain is attached and no DNS record changes, so Adobe Portfolio keeps serving `schltr.com` until you do the [go-live](#go-live) steps.

`deploy/_headers` adds `X-Robots-Tag: noindex` for `*.pages.dev` (and `staging.schltr.com`, in case you add it later), so staging doesn't show up in search results. `schltr.com` is not matched by it.

The workflow skips the build while there is no `package.json`, and skips the deploy (with a warning, not a failure) while the Cloudflare secrets aren't set.

## One-time setup (staging)

### 1. Current setup

schltr.com is registered at **Namecheap**, which also runs its DNS (Namecheap BasicDNS) including some URL redirects, and the site is served by **Adobe Portfolio**. Staging changes none of that.

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

The next push to `main` (or *Actions → Deploy → Run workflow* on `main`) builds the site, creates the Pages project `schltr` if it doesn't exist and deploys it. From then on, every merge to `main` is live at <https://schltr.pages.dev>.

> If `schltr.pages.dev` was already taken by someone else, Cloudflare gives the project a suffixed address such as `schltr-4xk.pages.dev`. Use that address wherever this guide says `schltr.pages.dev`. It's shown under *Workers & Pages → schltr*.

## Go-live

Do this only when staging looks right. This is the step that changes schltr.com.

1. **Move schltr.com's DNS from Namecheap to Cloudflare.** Pages can only serve an apex domain (`schltr.com` without a subdomain) from a Cloudflare zone. Namecheap stays the registrar.
   - In Cloudflare: *Add a site* → `schltr.com` → Free plan. Cloudflare imports the existing records.
   - Compare them with Namecheap's *Advanced DNS* page. The Adobe Portfolio `@`/`www` records must be there so nothing changes yet.
   - **Email** stays on the existing mail server (k@schltr.com catch-all); only its DNS records move. Check each of these against Namecheap and add any that are missing:
     - `MX` records
     - SPF (`TXT` on `@` starting with `v=spf1`) and DMARC (`TXT` on `_dmarc`)
     - DKIM (`TXT` or `CNAME` on `<selector>._domainkey`). The import usually misses these because it can't guess the selector name.
     - Mail hostnames such as `mail`, `imap`, `smtp`, `autodiscover`, `autoconfig`, and any `SRV` records
     - Every mail-related `A`/`AAAA`/`CNAME` record must be **DNS only** (grey cloud). Cloudflare's proxy only carries web traffic.
   - **Namecheap URL redirects** (*URL Redirect Record* entries) are served by Namecheap's own redirect servers, so they stop working when the nameservers move. Recreate each one in Cloudflare: a proxied (orange cloud) `AAAA` record on that hostname pointing to `100::`, plus a rule under *Rules → Redirect Rules* (or *Bulk Redirects* for many). Test them after the switch.
   - In Namecheap: *Domain List → schltr.com → Manage → Nameservers → Custom DNS* → enter the two Cloudflare nameservers. With identical records, the Portfolio site and email keep working during the switch.
2. **Attach the production domains**: *Workers & Pages → schltr → Custom domains* → add `schltr.com`, then `www.schltr.com`. This is the moment visitors start seeing the new site. Cloudflare replaces the old Adobe `@`/`www` records with ones pointing at Pages. Afterwards, remove the custom domain in Adobe Portfolio's site settings.
3. **Redirect www to the apex** (or the other way round): *Rules → Redirect Rules → Create rule → "Redirect from WWW to root"* template.
4. **Staging after launch.** `schltr.pages.dev` now shows production too. Pick one:
   - Use the per-PR preview URLs (`<branch>.schltr.pages.dev`) as staging. Nothing to set up.
   - Keep a permanent staging: add `staging` to `on.push.branches` in the workflow and push a `staging` branch; it's served at `staging.schltr.pages.dev`. For a nicer address, add `staging.schltr.com` under *Custom domains*, then change its DNS record target to `staging.schltr.pages.dev`.

## Rolling back

*Workers & Pages → schltr → Deployments* → pick an earlier deployment → *⋯ → Rollback to this deployment*. That's instant and doesn't need a new build.
