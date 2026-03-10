# Telnyx AE Commission Calculator

A candidate-facing compensation calculator for Account Executive roles at Telnyx, based on the 2025 commission plan.

## Quick Start

Simply open `index.html` in any modern web browser. No build step or server required.

```bash
# macOS
open index.html

# Or serve locally
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Features

- **Real-time calculations** as you adjust inputs
- **Mobile-friendly** responsive design
- **Scenario table** showing earnings at 80%, 100%, 120%, and 150% quota attainment
- **Auto-balancing** product mix sliders (always sum to 100%)
- **Ramp period modeling** with seasoning multipliers

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| Base Salary | Annual base salary | $70,000 |
| Ramp Period | Duration of seasoning adjustment | 6 months |
| Monthly GP | Monthly Gross Profit closed | $7,500 |
| Monthly Quota | GP target for quota attainment | $5,000 |
| Product Mix | % split across SMS, Voice/SIP/AI, Support | 20/60/20 |
| Contract Split | % Contracted vs Non-Contracted deals | 70% |

## Outputs

1. **Year 1 Total Comp (with Ramp)** — Base salary + commission with seasoning multipliers
2. **Year 1 at Full Productivity** — What you'd earn with steady performance all year (no ramp)
3. **Year 2 Residual** — Commission from Year 1 deals that continues paying in Year 2
4. **Monthly Commission** — Steady-state monthly commission at current performance

## Commission Structure

### Seasoning Adjustment (New AE Ramp)

| Period | Multiplier | Cap |
|--------|------------|-----|
| Months 1-2 | 3x | $10k/mo uplift |
| Months 3-5 | 2.5x | $10k/mo uplift |
| Months 6-9 | 2x | $10k/mo uplift |
| Month 10+ | 1x | No adjustment |

### Quota Accelerator

- +10% on all GP above quota
- Maximum payout at 200% quota attainment

## Files

- `index.html` — Main calculator page
- `styles.css` — Styling (Telnyx brand colors)
- `calculator.js` — Commission calculation logic
- `README.md` — This file

## Browser Support

Works in all modern browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Notes

- This calculator is for illustrative purposes only
- Actual compensation may vary based on individual agreements
- Consult the official 2025 compensation plan for definitive terms

---

*Built for Telnyx recruiting*
