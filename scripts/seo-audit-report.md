# SEO Content Audit Report — FateWise / BornChart.app

**Date:** 2026-06-23  
**Scope:** 184 blog articles (182 in `content/blog/`, 54 Chinese translations, 5 in `app/blog/`)  
**Audit Type:** Format repetition analysis + thin content detection + duplicate topic identification

---

## Executive Summary

The site has **184 blog articles** but suffers from three critical issues:

| Issue | Severity | Impact |
|-------|----------|--------|
| **Massive batch-format repetition** in Bazi articles | 🔴 CRITICAL | Google may flag as "auto-generated content farm" |
| **54 Chinese articles are thin stubs** (most under 500 words) | 🔴 CRITICAL | Near-zero SEO value; may trigger quality penalties |
| **Multiple overlapping topics** with 2-4 articles per theme | 🟡 HIGH | Internal competition (cannibalization) |

---

## 1. Batch-Format Pattern Analysis

### 🔴 CRITICAL: Bazi Article Template Repetition

The 60+ `bazi-*.md` articles follow a **highly formulaic template** that Google can easily detect as machine-generated:

#### Title Pattern (50% of articles use this):
```
"Bazi for X: How Your Y Reveals Z"
"How to [verb] your Bazi [noun]"
"Bazi [Topic]: Complete Guide"
```

**Affected articles (50+):**
- `bazi-career-guide-ideal-career-path.md` — "Bazi for Career: How Your Four Pillars Reveal..."
- `bazi-career-reading-ideal-profession-guide.md` — "Bazi Career Reading: How Your Chart Reveals..."
- `bazi-compatibility-by-birth-date-guide.md` — "Bazi Compatibility by Birth Date: How to Match..."
- `bazi-lucky-element-finder-guide.md` — "Bazi Lucky Element Finder: How to Discover..."
- `bazi-wealth-element-how-to-find-your-money-star.md` — "How to Find Your Wealth Element in Bazi..."

#### Heading Structure Template (identical across 20+ articles):
```markdown
## [Topic] in Bazi: The [X] [Noun]
## The Two/Multiple [Topic] Types
## [Topic] Career Guide
## [Topic] in Love and Relationships  
## [Topic] Health Profile
## [Topic] and 2026: The Fire Horse Year
## How to Determine if You're a [Topic]
```

**Affected articles (identical structure):**
- `fire-day-master-bazi-personality-career-love.md`
- `wood-day-master-bazi-personality-career-love.md`
- `metal-day-master-bazi-personality-career-love.md`
- `water-day-master-bazi-personality-career-love.md`
- `earth-day-master-bazi-personality-career-love.md`

These 5 articles are **exact clones** with only the element name changed. Every heading, section order, and even sentence structure is identical.

#### Hexagram Article Template (3 articles):
```markdown
## The Hexagram at a Glance  [table]
## The Gua Ci (卦辞): Judgment Text  → Plain-English Interpretation
## The Six [Theme] Lines: A Complete Breakdown  (6 × ### subsections)
## The [Element]'s Journey: A Summary Arc
## Hexagram X in Modern Life: Practical Guidance  (3 × ### subsections)
## Related Hexagrams to Explore  [table]
## Try Your Own Reading
## Frequently Asked Questions (FAQ)  (5 × ### subsections)
```

All three hexagram articles (#1, #2, #3) follow this **identical structure**. While the content depth is good (4000-4700 words), Google's pattern detection will flag the rigid repetition.

---

## 2. Thin Content Detection

### 🔴 CRITICAL: Chinese Articles (zh/) — All 54 Are Thin Stubs

| Word Count | Article | Status |
|------------|---------|--------|
| 94 words | `bazi-students-major-career-path-guide.md` | 🚨 Stub — likely placeholder |
| 110 words | `chinese-zodiac-vs-bazi-comparison.md` | 🚨 Stub |
| 114 words | `bazi-resource-guide-tools-books-communities.md` | 🚨 Stub |
| 129 words | `bazi-career-guide-how-to-read-your-chart.md` | 🚨 Stub |
| 133 words | `bazi-western-astrology-which-is-right.md` | 🚨 Stub |
| 166 words | `2026-fire-horse-bazi-yearly-forecast.md` | 🚨 Stub |
| 171 words | `bazi-nobleman-stars-activate-guide.md` | 🚨 Stub |
| 184 words | `bazi-marriage-spouse-palace-relationship-destiny.md` | 🚨 Stub |
| 189 words | `bazi-health-wellness-by-element-type.md` | 🚨 Stub |
| 201 words | `bazi-life-cycles-fortune-periods-guide.md` | 🚨 Stub |
| ...and 44 more under 500 words each | — | All thin |

**None of the Chinese articles exceed 1500 words.** The English originals range from 800 to 3400+ words, but the Chinese translations are reduced to **tiny stubs** (often < 300 words).

#### Root Cause:
These appear to be **machine-translated stubs** — the English originals were likely translated and then truncated, or a translation model was used that produced short outputs. Several even contain mixed English/Chinese text (e.g., "encoded 在你出生时刻的**事业蓝图**").

### 🟡 HIGH: English Articles Under 1500 Words (43 articles)

| Word Count | Article | Risk Level |
|------------|---------|------------|
| 700 words | `free-bazi-reading-vs-paid-comparison.md` | 🚨 Very thin |
| 816 words | `bazi-career-guide-ideal-career-path.md` | 🚨 Very thin |
| 863 words | `bazi-missing-elements-deficiency-fix-guide.md` | 🚨 Very thin |
| 881 words | `bazi-marriage-spouse-palace-relationship-destiny.md` | 🚨 Very thin |
| 939 words | `bazi-resource-guide-tools-books-communities.md` | 🚨 Very thin |
| 945 words | `bazi-10-gods-shi-shen-complete-guide.md` | 🚨 Very thin |
| 969 words | `how-to-calculate-your-bazi-chart-step-by-step-guide.md` | 🚨 Very thin |
| 970 words | `bazi-vs-western-astrology-key-differences-you-should-know.md` | 🚨 Very thin |
| 972 words | `the-five-elements-in-bazi-wood-fire-earth-metal-water-explained.md` | 🚨 Very thin |
| 972 words | `understanding-your-day-master-the-key-to-reading-bazi.md` | 🚨 Very thin |
| 990 words | `bazi-life-cycles-fortune-periods-guide.md` | 🚨 Very thin |
| 1047 words | `bazi-compatibility-calculator-free-online-guide.md` | ⚠️ Thin |
| 1074 words | `bazi-compatibility-by-zodiac-year-guide.md` | ⚠️ Thin |
| ...and 30 more between 1100-1500 words | — | ⚠️ Borderline |

**Recommendation:** Any article under 1500 words in this niche (Chinese astrology/destiny reading) is unlikely to rank. Google's E-E-A-T guidelines expect substantive, expert-level content for YMYL (Your Money Your Life) topics.

---

## 3. Duplicate / Overlapping Topics

### 🔴 CRITICAL: Exact Duplication Pairs

| Topic | Articles | Word Counts | Action |
|-------|----------|-------------|--------|
| **Bazi Feng Shui Direction** | `bazi-feng-shui-direction-guide-best-direction.md` + `bazi-feng-shui-direction-guide-which-direction-to-live.md` | 1356 + 1587 | **MERGE** — same topic, different titles |
| **Bazi vs Western Astrology** | `bazi-vs-western-astrology-key-differences-you-should-know.md` + `bazi-vs-western-astrology-which-system-better.md` | 970 + 1248 | **MERGE** — identical comparison angle |
| **Bazi vs Ziwei Doushu** | `bazi-vs-ziwei-doushu-which-is-better.md` + `bazi-vs-ziwei-doushu-which-system.md` | 2186 + 2032 | **MERGE** — same comparison, different titles |
| **Bazi Life Cycle / Luck Pillars** | `bazi-life-cycle-major-luck-pillars.md` + `bazi-life-cycles-fortune-periods-guide.md` | 2270 + 990 | **MERGE** — same concept |
| **Bazi Nobleman Stars** | `bazi-nobleman-stars-activate-guide.md` + `bazi-nobleman-stars-guide-activate-help.md` | 1520 + 1115 | **MERGE** — identical topic |
| **Missing Elements** (EN) | `bazi-missing-elements-deficiency-fix-guide.md` + `bazi-element-deficiency-how-to-find-and-fix-missing-elements.md` | 863 + 1841 | **MERGE** — one is thin, keep the other |
| **Missing Elements** (ZH) | `bazi-missing-elements-deficiency-fix-guide.md` + `bazi-element-deficiency-how-to-find-and-fix-missing-elements.md` | 238 + 463 | **MERGE** — both thin |
| **Bazi Career Guide** (EN) | `bazi-career-guide-ideal-career-path.md` + `bazi-career-reading-ideal-profession-guide.md` | 816 + 1284 | **MERGE** — both thin, same angle |
| **Bazi Career Guide** (ZH) | `bazi-career-guide-how-to-read-your-chart.md` + `bazi-career-guide-ideal-career-path.md` | 129 + 253 | **MERGE** — both stubs |

### 🟡 HIGH: Category-Level Overlap (2-4 articles per theme)

| Theme | Articles | Total Words | Issue |
|-------|----------|-------------|-------|
| **Bazi Career** (3) | `career-guide`, `career-reading`, `career-transition-timing` | 816 + 1284 + 1694 = 3794 | First two are thin duplicates; keep "transition timing" as unique angle |
| **Bazi Compatibility** (3) | `by-birth-date`, `by-zodiac-year`, `calculator` | 1209 + 1074 + 1047 = 3330 | All thin; "calculator" may have different intent — keep but expand |
| **Bazi Health** (4) | `body-constitution-chinese-medicine`, `body-constitution-tcm-wellness`, `reading-body-longevity`, `wellness-by-element-type` | 1462 + 1890 + 1957 + 3319 = 8628 | First three overlap heavily; keep "wellness-by-element-type" (3319 words, best depth) |
| **Bazi Feng Shui** (4) | `direction-guide-best`, `direction-which-direction`, `home-layout`, `integration` | 1356 + 1587 + 2009 + 1985 = 6937 | Directions overlap; keep "home-layout" and "integration" as unique angles |
| **Bazi Wealth** (4) | `wealth-element`, `wealth-reading-financial-pattern`, `wealth-strategy-by-day-master`, `wealth-strategy-complete` | 1654 + 1150 + 4582 + 1750 = 9136 | "Wealth-element" and "wealth-reading" overlap; keep the other two |
| **Bazi Wealth** (ZH) | `wealth-element` + `wealth-money-star-element-guide` | 281 + 352 = 633 | Both thin stubs — rewrite or remove |

---

## 4. Google AI-Content Detection Risk Assessment

### 🚨 High-Risk Articles (Likely to be flagged as AI-generated)

These articles have the strongest signals of batch-generation:

1. **All 5 Day Master personality articles** (Wood/Fire/Earth/Metal/Water) — Identical heading structure, identical section order, only the element name and metaphors change
2. **All 4 Bazi health articles** — Same template applied to slightly different angles
3. **Bazi compatibility trio** — Nearly identical opening hooks and structure
4. **Bazi nobleman stars pair** — Same information, same structure, different titles
5. **Zhun Gua / Kun Gua / Qian Gua hexagram articles** — Identical template (glance table → judgment text → 6 lines breakdown → modern applications → FAQ)
6. **All ZH articles under 500 words** — Read like machine-translated summaries

### 🟡 Medium-Risk Articles

- Bazi articles with "Complete Guide" in title (40+ articles)
- Articles that open with generic statements like "Are you in the right career?" or "You met someone amazing"
- Articles that follow the pattern: intro → [topic] framework → [sub-topics] → CTA

### 🟢 Low-Risk Articles (Good quality, unique angles)

- `i-ching-complete-guide.md` (5151 words) — Comprehensive pillar page
- `iching-hexagram-1-qian-gua-creative.md` (4038 words) — Deep, scholarly approach
- `bazi-wealth-strategy-by-day-master-guide.md` (4582 words) — Good depth, unique angle
- `all-64-hexagram-meanings-quick-reference.md` (3625 words) — Useful reference
- `iching-vs-tarot-which-oracle-system.md` (3107 words) — Comparison format, engaging
- `iching-for-beginners-complete-guide.md` (2992 words) — Well-structured beginner content
- `history-of-bazi-han-dynasty-to-ai.md` (1838 words) — Unique narrative angle
- `bazi-mbti-day-master-personality.md` (2385 words) — Novel comparison angle

---

## 5. Priority Action List

### P0 — Immediately (Google penalty risk)
1. **Remove or massively rewrite all ZH articles under 500 words** — They provide zero value and look like spam
2. **Fix the 5 Day Master personality articles** — Break the identical template structure; add unique examples, charts, and personal scenarios
3. **Merge duplicate pairs** (7 pairs identified above) — Consolidate into single, comprehensive articles

### P1 — This Week
4. **Expand thin English articles** (43 articles under 1500 words) to minimum 2000+ words OR remove if not worth the effort
5. **Break hexagram article template** — When writing #4-64, vary the structure (use scenarios first, then theory; or start with a story, not a table)
6. **Audit and fix internal linking** — Thin articles may be draining crawl budget

### P2 — This Month
7. **Create a content quality standard**: minimum 2000 words, unique angle per article, varied structure
8. **Audit Bazi category consolidation**: reduce from 60+ articles to ~25 comprehensive pillars
9. **Fix Chinese translation pipeline** — Stop producing thin stubs; either translate fully or don't publish

---

## 6. Content Quality Standards (Recommended)

| Metric | Minimum | Recommended |
|--------|---------|-------------|
| Word count | 2000 words | 3000+ words |
| Unique headings per article | All different from other articles | Varied section types (tables, stories, frameworks, checklists) |
| Opening hook | No generic "Are you..." questions | Story, counterintuitive claim, specific scenario, or data point |
| Chinese articles | Full translation (match English word count) | Native-quality writing, not machine-translated stubs |
| Internal links per article | 3-5 to related content | Contextual links, not just CTA at bottom |
| FAQ section | Optional (helps with featured snippets) | 3-5 questions, written conversationally |

---

*End of Audit Report*
