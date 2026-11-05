# Isian formulir submission — tinggal copy-paste

**DEADLINE: 14 November 2026, 18:00 UTC** (= 15 Nov 01:00 WIB)
Diumumkan 5 Nov 2026 — **bukan 26 Nov**. Penghitung di situs: 9 hari 14 jam per 5 Nov.
36 peserta. Batas 3 submission per hari, jadi masih bisa revisi setelah submit.

---

## Kolom 1 — Link to your clickable prototype

```
https://nialthony.github.io/housebet-sportbook/
```

GitHub Pages, publik, langsung terbuka tanpa login.

---

## Kolom 2 — Pages in your prototype

Centang **kelimanya**:

- [x] Sports home
- [x] Live
- [x] Football
- [x] Match page
- [x] Bet slip + My bets

---

## Kolom 3 — Your big idea  *(80–800 karakter)*

**499 karakter** — pakai ini (lebih ketat dan lebih spesifik dari versi lama 548):

```
Housebets is a pool, not a bookie, so I made the pool visible: every market shows the bankroll backing it, every settled bet keeps its tx hash and confirmations. Then I fixed the moment every sportsbook gets wrong — a price moving under you. You see the old price struck through, why it moved, and a 5-second hold to accept it. Suspended picks stay in your slip with the reason, instead of vanishing. Cash out shows a live mark, not a mystery button. Singles only, USDT, decimal. Shippable tomorrow.
```

Kalau mau pakai versi lama (548 karakter), ada di `README.md`.

---

## Kolom 4 — Tools and templates you used  *(opsional)*

Kolom ini dipakai menyaring AI-slop. Jawaban jujur justru menguntungkan di sini,
karena tidak ada template/UI kit yang dipakai:

```
Hand-coded. No Figma, no v0, no UI kit, no template. React 18 + TypeScript on Vite, CSS written by hand against tokens I measured off your own wireframes (48px rows, 320px side panel, 216px nav). Type is your brand face: Figtree + Red Hat Display, taken from housebets.com/_next/static/media. Club crests are real badges (football-logos, ESPN CDN) plus 11 I drew as SVG for teams that have no badge. Odds engine, state machine, and a 54-assertion Playwright audit are mine. Claude (Arena) as a coding assistant — it wrote no design.
```

---

## Yang akan lo konfirmasi (5 centang)

| Pernyataan | Status | Bukti |
|---|---|---|
| Bet slip singles only. No multis, boosts or free bets. | **AMAN** | Pemindaian 0 temuan untuk multi/accum/parlay/bet builder/boost/free bet/promo/outright/special/tracker/AI. Format odds desimal semua. |
| No real player data and no real money anywhere. | **AMAN** | 17 nama pemain fiktif (K. Vardal, M. Okonjo, T. Bergström…). Grup Goalscorers diberi tag "Sample data · fictional players". Saldo 1.284,50 USDT contoh. |
| It's my own work. I've named any tools/templates/kits. | **AMAN** | Kolom 4 mencantumkan semuanya, termasuk Claude. |
| Housebets can share my entry publicly. | Pilihan lo | — |
| If I win, the prize is the full payment and Housebets owns the winning code, designs and rights. | Pilihan lo | — |

Catatan: nama klub memang nyata (Arsenal, Real Madrid) — itu wajar, karena brief
sendiri memakai "Arsenal v Brighton" sebagai contoh. Yang dilarang cuma pemain
nyata dan uang nyata.
