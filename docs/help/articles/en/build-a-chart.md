---
id: build-a-chart
title: Build a chart from a report
module: Reports
screens: report, reports
who: Anyone who can open the report
related: total-and-group-a-report, export-a-list
order: 2
---
Every report has a chart above its table. The chart follows the report's filters: filter the report and the chart changes with it.

::: shot route=report
> waitfor [data-testid=chart] .highcharts-container
1 = [data-testid=chart-builder] [aria-label="Chart type"]  The kind of chart
2 = [data-testid=chart-builder] label:has-text("X axis")  What goes along the bottom
3 = [data-testid=chart-builder] button:has-text("Add a measure")  Add another number to compare
4 = [data-testid=chart-builder] button:has-text("Download")  Download the chart or its data
:::

## Steps

1. Choose the kind of chart ①: column, bar, line, area, pie, scatter, or one big number.
2. Choose what goes along the bottom ②, for example the branch, or the date by day, week or month.
3. Choose the number to show and how to count it: the sum of the totals, the average price, how many sales. Tap **Add a measure** ③ to compare more than one.
4. Optionally split each bar by another field (**Split by**), or show only the top few.
5. Tap **Download** ④ for a picture (PNG, SVG or PDF) or the chart's numbers as a CSV file.

> Tap **Save** on the chart to keep it with the report's view, so it is there next time.
