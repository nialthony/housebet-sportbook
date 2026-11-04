# ANTI-SLOP — design contract for the Housebets Sportsbook entry

This file is the "skill". Every rule here is **enforced in code** (`src/styles/tokens.css`,
`src/styles/base.css`) or it is not a rule. Judges never read this file — they feel it.

The goal: read as *a product team shipped this*, not *someone prompted this*.

---

## 0. The one sentence that decides the contest

> The sportsbook we'd ship tomorrow wins.

So the target is not "beautiful". It is **credible under use**. A judge should be able to
try to break it — suspend a market mid-bet, change the price while typing a stake, kill the
connection — and it should behave like software, not like a picture.

---

## 1. Kill list — the specific tells of AI-generated UI

| Tell | Banned | Instead |
|---|---|---|
| Inter / system font everywhere | Inter, Roboto, Poppins, DM Sans | **Figtree** + **Red Hat Display** — Housebets' actual faces |
| Purple→blue→pink gradient | any multi-stop gradient as decoration | Housebets palette, flat. One 1px hairline sheen max. |
| Glassmorphism | `backdrop-filter` on cards | Flat surfaces separated by 1px hairlines + lightness steps |
| Big soft shadows | `box-shadow: 0 10px 40px rgba(0,0,0,.5)` | No shadows on cards. Depth = `--ink-*` steps. |
| 16px radius on everything | `border-radius: 16px` | 2px rows · 4px cards · 999px pills. Nothing else. |
| Emoji as iconography | ⚽ 🏀 🔥 ✅ | 1.5px stroke SVG, drawn for this project |
| Centered empty states with a shrug | "No data available 😔" | Operational copy + a next action |
| Lorem ipsum / "Team A vs Team B" | filler | Full realistic fixture list; **fictional players** (see §6) |
| Motion everywhere | floating orbs, gradient drift | Motion only where state changed. 120–180ms. |
| Vague marketing copy | "Seamless. Elevated. Effortless." | Terse, operational, specific |
| Identical card grid | every card same height, same weight | Density varies with importance |

## 2. Type — the brand's real faces, recovered not guessed

```
Display / scoreline / page titles  : Red Hat Display 700, tracking -0.02em
UI, labels, buttons, market names  : Figtree 400–700
Every single number                : Figtree + font-variant-numeric: tabular-nums
```

Figtree and Red Hat Display are the **only two typefaces the live Housebets build
serves**. Verified by enumerating every `.woff2` on housebets.com through the Wayback
CDX index and probing each one — everything else (Oxanium, Roboto Flex) 404s. Almost
no other entrant will be on-brand type; most will ship Inter.

**There is deliberately no mono family.** Figtree carries OpenType `tnum`, so tabular
figures are one `font-variant-numeric` away. Verified: `1.11`, `8.88`, `2.00`, `1.85`
all measure 29.41px at 15px. Prices cannot jitter, and no off-brand face is bolted on.

Fonts are **self-hosted** in `public/fonts/` so the prototype renders identically with
no network — including inside a sandboxed preview iframe.

Type scale (px): 10 · 11 · 12 · 13 · 15 · 17 · 20 · 26 · 34 · 48. Nothing between.

## 3. Colour — sampled from Housebets' own wireframe, not invented

Extracted by pixel analysis of the official `desk-home.webp` starter wireframe.
Structural analysis of all 12 official wireframes (`ref/wf/`) gave the shell
bands and the row rhythm; OCR of the same images gave their labels.

```
top bar        0–79      left rail   0–72      second rail  73–149
content        150–1363  side panel  320px (desk-slip: x1120–1439)
row rhythm     46 / 48 / 52px  ->  --row-h: 48px
```

**What their wireframes actually contain** (read by OCR, not guessed):

| Screen | Elements |
|---|---|
| Sports home | `Featured matches` · `Your matches` · `LIVE 52'` rows · left nav with `Home / Live (13) / Soccer / Tennis / Basketball / Baseball / American Football / Esports / Favourites` |
| Live | `Live now` · grouped **by competition** with `View all` · `Suspended` rows |
| Football | `Live \| Upcoming` tabs · `All competitions` · grouped by competition · `Match result 1 / X / 2` |
| Match page | breadcrumb `Soccer › England › Premier League` · `Following / Follow` · `Search markets or players` · market groups |
| Bet slip | `Bet slip \| My bets \| Chat` · `Singles selection` · `Clear all` · `Returns 0.00` |
| My bets | `Open (1) \| Settled (7)` · `All time / Today / Last 7 days / Last 30 days / Custom` · `All sports` · table **`Placed \| Bet \| Odds \| Stake \| Returns \| Result`** |

Matched in this build: competition grouping on Live, the My bets table columns,
its time and sport filters, the `N singles selections` slip label, 48px rows and
the 320px side panel.

Deliberately *not* copied, because the brief overrides the wireframe or rules it
out: `Soccer` (brief says **Football**), the `Weekly Prize $50,000.00` promo bar
(brief: promos out of scope), the `+115` American odds (brief: **decimal**), and
the `Chat` tab (not in the brief). The extra market groups their current product
shows — `Minutes / Players / Specials / All markets` — are also dropped: the
brief specifies exactly **Popular, Goals, Halves, Handicaps, Goalscorers,
Corners & cards**, and that is what is built.

| Token | Hex | Use |
|---|---|---|
| `--ink-000` | `#031015` | app background |
| `--ink-100` | `#0B1A20` | row / table surface |
| `--ink-150` | `#0E212A` | card surface |
| `--ink-200` | `#122A34` | raised surface, odds button |
| `--line` | `#1B3038` | hairline |
| `--line-2` | `#21313C` | strong hairline, focus |
| `--txt-hi` | `#EAF4F7` | primary |
| `--txt` | `#A9C2CB` | body |
| `--txt-lo` | `#6C8792` | secondary |
| `--txt-mute` | `#4C6570` | tertiary |
| `--hot` | `#F22050` | brand pink · live · suspended · danger |
| `--cy` | `#4ABAC6` | brand teal · focus · active nav |
| `--up` | `#3DD68C` | odds lengthened |
| `--dn` | `#F22050` | odds shortened |

**Colour is semantic, never decorative.** In a match row the only permanently coloured
pixel is the live dot. Odds colour appears for **900ms after a change**, then decays to
neutral. If everything is coloured, nothing is.

## 4. Density — the anti-slop superpower

AI output is airy because airy is easy. A real sportsbook is dense.

- Row height **44px** desktop / **52px** touch.
- Odds columns are a fixed **64px** grid, 3 across. They align down the whole page.
- 8px spacing scale only.
- Content max-width 1440 desktop, no max-width phone.

## 5. Motion

```
--t-fast  120ms   odds flash, hover
--t-base  160ms   press, toggle
--t-slow  240ms   sheet slide, page transition
easing    cubic-bezier(.2,.8,.2,1)
```

- Odds change: background flash + 1px nudge, 900ms decay to neutral.
- Slip sheet (phone): slide 240ms, scrim blur **only here**.
- Live dot: 2s pulse. Nothing else pulses.
- `@media (prefers-reduced-motion: reduce)` kills all of it.

## 6. Compliance details most entrants will miss

The rules say *"Sample data only: no real players, no real money."* The brief also
requires a **Goalscorers** market on the match page. Competitors will paste
Haaland/Saka into it and quietly break the rule.

→ **Every player in this prototype is fictional**, and the goalscorer group carries a
visible `SAMPLE DATA` tag. This is both compliant and a visible signal of care.

Also out of scope — do NOT add: multis/parlays/bet builder, odds boosts, free bets,
outrights/specials, stats widgets, match trackers, AI search.

## 7. Copy voice

- Sentence case. Never Title Case for labels.
- No exclamation marks.
- Every error state names the cause **and** the next action.
- Suspended ≠ hidden. A suspended selection stays in place, dimmed, with a reason.

| Don't | Do |
|---|---|
| "Oops! Something went wrong." | "Bet not placed. Price moved to 2.10 before we could match it." |
| "Odds have changed" | "Arsenal 1.85 → 1.72. Red card, 34'." |
| "No events found" | "Nothing live in the Champions League. Next kick-off in 14:02." |
| "Success!" | "Bet placed. 25.00 USDT on Arsenal. Returns 43.00 USDT." |

## 8. The four details that actually win points

Scorecard: Match page 20 · Bet slip + My bets 20 · Sports home 15 · Feels like Housebets 15
· Live 10 · Football 10 · Every state 10.

Half the score lives in the two hardest, least glamorous surfaces. Almost everyone will
over-invest in the home page. So:

1. **Price lock with a reason.** Odds change → old price struck through, new price, a 5s
   countdown ring, and *why* it moved ("Red card 34'", "£40k matched"). Not a silent modal.
2. **Suspension that explains itself.** Dimmed in place with a cause and a resume hint.
3. **On-chain settlement receipt.** Every settled bet shows a tx hash + block
   confirmations. This is the entire Housebets thesis made visible for ~15 lines of code.
4. **Cash out as a live mark.** A ticking value, not a mystery button.

## 9. Definition of done for any screen

- [ ] Works at 390px and 1440px, no horizontal scroll
- [ ] Every number is tabular (Figtree tnum); display numbers use Red Hat Display
- [ ] Zero emoji, zero gradients, zero card shadows
- [ ] Loading / empty / suspended / error / success all reachable
- [ ] Keyboard reachable; focus ring visible
- [ ] Readable with `prefers-reduced-motion`
- [ ] No real player names, no real money amounts tied to a person
