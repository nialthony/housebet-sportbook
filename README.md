# Housebets Sportsbook — contest entry

A clickable front-end prototype of the five pages players use most.
React + TypeScript + Vite. No backend. Sample data only.

---

## 1. The big idea (submission text)

The version to paste is in `SUBMISSION.md` (497 chars). This older one is kept
only as a fallback:

> Housebets isn't a bookie with a crypto checkout. The house is a pool, and pools
> can be seen. So I made it visible: every market shows the bankroll backing it,
> every settled bet keeps its tx hash and block confirmations. Then I fixed the part
> every sportsbook gets wrong. When a price moves you see the old price struck
> through, the reason it moved, and a 5-second hold to accept it. Suspended
> selections stay in place with the cause instead of vanishing. Cash out is a live
> mark, not a mystery button. Singles, USDT, on-chain, shippable tomorrow.

**Tools:** hand-written React + TypeScript, Vite, no UI kit, no template.
Fonts: Figtree + Red Hat Display — the two faces the live Housebets build actually
serves, recovered by probing every `.woff2` on housebets.com. Palette sampled by
pixel analysis of the official starter wireframe.

---

## 2. Pages

| Page | Route | What's in it |
|---|---|---|
| Sports home | `/` | Live now · Starting soon · Top competitions · Sports nav · full search |
| Live | `/live` | Every match in play, filter by sport + competition, clocks, empty state |
| Football | `/football` | PL · UCL · LaLiga · Serie A · Bundesliga, 1/X/2 on each row, follow |
| Match page | `/match/m1` | Arsenal v Brighton live. Scoreboard + 6 market groups, 71 selections |
| Bet slip + My bets | `/bets` | One page. Slip left, ledger right. States bar on top |

---

## 3. Every state, reachable on demand

The **States** bar on `/bets` triggers each state without waiting for the simulator.
This is the point: a judge should never have to wait for luck to see a state.

| State | How to reach it |
|---|---|
| Odds changed | `States → Move a price`, or wait ~10s with a live selection in the slip |
| Price lock countdown | automatic with every change — 5s ring, live tenths |
| Direction caret | ▲ green / ▼ pink beside any price that moved, held for 3s |
| Selection suspended | `States → Suspend selection`, or the Brighton price on the match page |
| Market suspended | `States → Suspend market` — a whole market dims with its cause |
| Feed paused | `States → Pause feed` — every price freezes, banner explains why |
| Bet placed | Fill a stake, place; toast + settlement receipt + confirmations tick |
| Bet failed | Tick `force fail`, or place while a price is unaccepted / suspended |
| Nothing live | Live page → `show "nothing live" state` |
| Empty slip / empty My bets | clear the slip; both have written empty states |
| No market matches a search | Match page → type into `Search markets or players` |
| Cash out | Open bet → `Cash out`; value ticks live before you press it |
| Settled won / lost | `States → Settle won / Settle lost` |

The **States** bar sits on both the match page and `/bets`, so a judge never has
to leave the screen they are grading to produce a state.

---

## 4. Anti-slop

`ANTI-SLOP.md` is the design contract. It is enforced in `src/styles/tokens.css`
and `src/styles/base.css`, not left to memory. Short version:

- **Figtree + Red Hat Display.** Housebets' own faces, not Inter. Every number
  is tabular via Figtree's OpenType `tnum` — verified identical widths across
  `1.11` / `8.88` / `2.00` / `1.85`, so prices never jitter.
- **Palette sampled from Housebets' own starter wireframe**, not invented:
  `#031015` bg · `#0E212A` surface · `#21313C` hairline · `#F22050` pink · `#4ABAC6` teal.
- **No card shadows, no glass, no emoji, no decorative gradients.** Depth is a
  background lightness step plus a 1px hairline.
- **Radius is 2 / 4 / 999px.** Nothing else exists.
- **Density is the point.** 44px rows, 64px odds columns that align down the page.
- **Colour is semantic and temporary.** An odds flash lasts 900ms, then decays.
  The only permanently coloured pixel in a row is the live dot.
- **All players are fictional** and the goalscorer group is tagged `SAMPLE DATA`,
  because the rules say no real players and the brief demands a goalscorers market.

---

## 5. Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # → dist/
```

## 6. Deploy (public link, no login)

Hash routing plus `base: './'` means the build works unchanged whether it is
served from a domain root or from `/<repo-name>/`. Verified: fonts, CSS and JS
all resolve from a subdirectory with no failed requests.

### GitHub Pages (recommended — already wired)

A ready-made workflow ships in the repo as
`docs/github-actions-deploy.yml` — **copy it to `.github/workflows/deploy.yml`**
to turn on build-and-deploy on every push to `main`, then set
`Settings → Pages → Source → GitHub Actions`. (It lives outside `.github/`
because pushing workflow files needs a token scope this repo's deploy token
does not have.)

The site is already live without it, deployed from the `gh-pages` branch:

```bash
# 1. create an empty repo on github.com  (must be Public for free Pages)
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main

# 2. on GitHub: Settings → Pages → Source → "GitHub Actions"
# 3. wait ~60s, then open the URL it gives you
```

Every later `git push` redeploys automatically.

### Alternatives

- **Netlify** — `npm run build`, drag `dist/` to app.netlify.com/drop
- **Vercel** — `npx vercel`
- **Any static host** — upload the contents of `dist/`

`public/_redirects` (Netlify/Cloudflare) and `public/vercel.json` are in place.
`npm run build` also writes `dist/404.html` as a copy of `index.html`.

### Fonts

Self-hosted in `src/assets/fonts/` and fingerprinted by Vite, so they resolve
correctly at any base path. Do not move them to `public/` — absolute `/fonts/…`
URLs break under a `/<repo-name>/` deploy.

---

## 7. Known scope

Out of scope per the brief, and deliberately absent: multis/parlays/bet builder,
boosts, free bets, outrights/specials, stats widgets, match trackers, AI search.
Search is plain substring matching across events, competitions, players and markets.
