# User guide

Updated 2 November 2026.

## Explore companies

Open Rankings, search by company or ticker, add one or more metric columns and filter the universe. Sort using column headings; pages show up to 100 rows. A dash means missing information, not zero. Directory-only companies may lack financials. New listings uses verified/supplemental IPO dates within three calendar months; directory discovery alone does not qualify a company as an IPO.

Select a company to open its bookmarkable profile. Overview and financial tabs show available information; source links and dates explain the observations. History availability differs by company and metric.

## Compare and save

Use watchlist and comparison controls to save companies in this browser. These selections do not synchronize between devices. Clearing site storage can remove them. Change the display currency to INR or USD; the sources panel explains the daily FX reference. Currency conversion does not make a stale quote current.

## Charts and downloads

Use supported period controls and legends to explore price or annual history. Hover/focus observations for details; available chart interactions support selection and comparison. Missing history is explicitly unavailable. Market maps, scatter plots and sector views summarize the available matched data, not a certified full market.

Use chart download controls for images and ranking export for CSV. Check the downloaded title, units, dates and labels before sharing. Ranking trends use available dated Zerodha prices; no illustrative paths substitute for missing history.

## Official closing reports

In Data sources, import an unzipped official NSE/BSE Capital Market/Equity UDiFF Common Bhavcopy Final CSV. The importer validates fields and matches identities. Imported closes remain separate from financial snapshots/history and persist in this browser. Use the data panel's restore action to return to the original dataset. An import is an end-of-day report, not a live connection.

## Live quotes

Live provider access requires the local Node service and server-side setup. Use the website's connection/data controls after configuration. A public GitHub Pages preview shows static data and cannot run the private broker bridge. If a quote is unavailable, inspect its trade time and connection status before relying on it.

Phone exports use a landscape layout for scatter and Zerodha price charts, preserving the displayed selection and scale.

## Multiple ranking parameters

Select parameter buttons or More metrics to add columns before the permanent Market cap column. Each added header has a sort control and a remove button. You can add several parameters at once. On narrow screens, scroll inside the table to view them. Keyboard focus stays on the selected control after sorting; removing a column moves focus to another column control, or Market cap when none remain. Reset filters clears added columns and restores the default table.

## Market ticker

Indian indices appear in an evenly spaced row above the Nifty 50 stock strip, beginning with Nifty 50 and Sensex. The stock order shuffles once when the page loads and stays stable during quote updates. Stock prices in this news strip follow the USD/INR selector; index values remain points. Hover or focus the scrolling window to pause; there is no separate pause button. Drag either row to browse. Narrow screens allow horizontal index scrolling. Reduced-motion mode keeps stocks static and horizontally scrollable. Missing prices display a dash. The top-right date shows quote freshness; detailed sources remain in the sources panel.

Refresh the official constituent file with `npm run refresh:nifty50`; failed validation preserves the previous list.

Price-chart timeline buttons stay in place during loading. A brief crossfade switches between real historical charts without inventing intermediate observations; reduced-motion mode switches immediately.

Company links now have a direct company address. You can open or refresh that address, and older bookmarked stock links still work. Newly discovered companies use the existing stock link until their direct page is generated. Your saved watchlist remains local to your browser.

On comparison and individual-stock line charts, tab to the chart to inspect the current observation. Use left/right arrows or Home/End to move through dates, Shift plus arrows to compare endpoints, and Escape to clear. Open View chart data beneath the chart for a table of the plotted observations for each company. Each table can be focused and scrolled with the keyboard.

Click any company or index in the top ticker to open its chart. Dragging the ticker browses without opening a link. Index pages show levels in points and include an Add to comparison button; the comparison picker also lists all seven ticker indices. Mix up to four stocks/indices; chart lines use percentage change from a common observation. Company financial fields remain unavailable for indices, and currency changes do not convert index points.

5Y and MAX historical price/index charts plot the last available observation per week, with the same calendar-year axis labels. Annual reported market-cap series keep their annual source frequency. A newly listed security with fewer than two weekly observations can be explored on a shorter daily timeline.

Chart image downloads display Preparing while working. If PNG conversion cannot complete, the button recovers and you can use SVG. SVG images keep the chart labels and units; chart-only hover markers and keyboard instructions are omitted from the exported static image.

The ticker shares the table's five-second refresh while the page is visible. Brief green/red glows follow rises/falls since the last native price observation, independently of the day's gain/loss percentage. Initial quotes and currency-only changes do not trigger a glow; reduced-motion settings suppress animation. A quote can remain unchanged if no new trade/value arrives. Symbols sit above tightly spaced price/change values in the same compact strip.


The business-versus-market-value scatter chart has a **View chart data** disclosure. Open it for the exact plotted companies and their revenue or pretax profit and market caps in the selected currency. Industry filtering applies to both the plot and table.


Records marked **Identity unverified** could not be matched to the current exchange directory. They remain searchable with their historical source values, but receive no current rank and appear after matched records in numeric ranking sorts. Their company pages explain the identity limitation.

Comparison lines begin on each instrument’s own first available date and show percentage change from that first value. Their histories need not overlap. An instrument without data at the selected endpoint shows a dash. 5Y/MAX use each instrument’s last available candle per week; year ticks remain calendar boundaries.

Opening a company warms all market-history timelines in the background. Full daily history is requested from 1990; actual broker coverage can begin later, and newly listed instruments begin at their available observations. Shorter daily timelines reuse this cache. Expand View chart data for available OHLC prices and volume. Zerodha historical candles do not supply revenue, earnings or balance-sheet histories; financial tabs retain reported values and explain missing historical coverage.

Ranking movement is recorded only after company sources finish loading without a reported source failure. While data is loading or degraded, current provisional ranks remain visible and movement arrows are withheld. The next complete load compares with the last complete saved state. The corrected history version establishes a fresh initial baseline.
