# Chart quality review

Updated 1 November 2026. Scores are an expert implementation review, not a user-study result. Each iteration will report this same set of aspects. 8 means sound and usable with minor limitations; 9 means polished; 10 is reserved for fully validated excellence.

## Current iteration — provisional scores

Scope: individual price and annual market-cap charts, comparison overlays, market map, revenue/profit scatter, largest-company bars and sector composition.

| Aspect | Score / 10 | Evidence and remaining work |
|---|---:|---|
| Data accuracy and transparency | 8 | Shared comparison timestamps, ordinary shares × price, matched-identity aggregates, source-period notes and missing-data states. Financial coverage remains partial. |
| Axes and labels | 8 | Round currency ticks, IST dates, zero references and loss-aware scatter domains; narrow layouts checked. |
| Hover details | 8 | Actual observations, currency values, compact displaced tooltips and focus support. |
| Timelines and controls | 8 | Eight price ranges, visible-series toggles, company finder, scatter metric/sector/scale controls. Annual source has fewer available ranges. |
| Drag comparison | 8 | Snapped endpoints, actual price and percentage differences, pinned selection and keyboard equivalents. |
| Colours and contrast | 8 | Red losses, green gains, stable categories and comparison dash patterns; market-map label contrast tested. |
| Animation | 8 | Gentle reveal and hover transitions; reduced-motion rules present. Reduced-motion runtime verification remains open. |
| Mobile layout | 7 | Price and scatter layouts checked; latest responsive market-map change still needs rendered verification. |
| Keyboard accessibility | 8 | Roving scatter focus, line-chart navigation, sector activation and focus details. No assistive-technology user study. |
| Image downloads | 7 | All chart families exported previously; latest market-map export changes still need image verification. |

These are provisional aspect scores across the reviewed surfaces, not a claim that every chart has passed final acceptance. The goal remains active because mobile and export checks are unfinished.

## Verification for this iteration

All 37 automated tests passed on 1 November 2026, including chart scales, shared timestamps, IST markers, negative values, market-map areas/contrast/reflow, identity matching, calendar periods and INR valuation invariance. Browser checks from the preceding work covered price timelines, comparison drag/legend interaction, mobile axes, scatter selection, sector filters and chart downloads. The latest map layout/export edits require a new browser check before their scores can rise.

## Reporting convention

After each subsequent implementation iteration, append the changes, the same aspect scores, remaining limitations and verification evidence. Do not silently replace provisional scores with final scores. Completion requires every aspect to reach at least 8 with its pending checks resolved.

## Next iteration — export consistency and verification access

Comparison image legends now retain the exact dash pattern of each plotted series, including the fourth series' dash-dot pattern. Previously the exported legend reduced both dashed variants to the same pattern. Both changed JavaScript files passed syntax checks.

| Aspect | Score / 10 |
|---|---:|
| Data accuracy and transparency | 8 |
| Axes and labels | 8 |
| Hover details | 8 |
| Timelines and controls | 8 |
| Drag comparison | 8 |
| Colours and contrast | 8 |
| Animation | 8 |
| Mobile layout | 7 |
| Keyboard accessibility | 8 |
| Image downloads | 7 |

Scores remain provisional and unchanged. The preview server was restarted successfully. The browser service reports that local browser use is disabled in Work settings; therefore fresh rendered mobile and export verification cannot proceed yet. No alternative browser connection was used to bypass that setting. User action to enable browser access has been requested. The goal remains active.
