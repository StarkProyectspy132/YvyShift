# YvyShift · Design system

Identity: the v4 agricultural design (forest green, cream, wheat; serif headings, pill buttons), organised with a scale. The rules live in `app/styles.css`.

## Principles

1. The map and the data come first; decoration stays on the home page.
2. Colour means something. It is not used as ornament.
3. Every figure shows its source, its resolution and its limit.
4. A new component uses the tokens; it does not invent values.

## Colour (tokens in `:root`)

| Use | Token | Meaning |
|---|---|---|
| Page background | `--bg` | cream in light mode, very dark green in dark mode |
| Surface | `--panel`, `--soft` | panels and secondary areas |
| Text | `--ink`, `--muted` | primary and secondary |
| Border | `--line` | separators and outlines |
| Vegetation, correct state, selection | `--leaf`, `--leaf-soft` | green |
| Warning, primary action | `--amber`, `--amber-btn`, `--amber-soft` | wheat and amber |
| Critical | `--red` | alerts only |
| Water | `--c-water` | rain, moisture |
| Heat | `--c-heat` | heat days, drought |
| Frost | `--c-frost` | frost days |

Filled amber is reserved for one primary action per screen. Filled green marks what is selected.

## Typography

- Brand and home page headings: serif (`--display`). Text and interface: sans (`--font`). On phones all text is sans-serif.
- Scale: 12 (metadata), 13.5 (notes and compact controls), 15 (text and panel titles), 18 (card figure), 22 to 26 (screen title), 36 or more only on the home page and for the winning score.
- Figures, coordinates and tables: `font-variant-numeric: tabular-nums`. In Spanish, decimal comma in every number (`num` function).

## Space, radius and shadow

- Spacing in multiples of 2: 4, 8, 10, 12, 14, 18.
- Radii: `--r-s` 6 px (compact controls, map labels), `--r-m` 10 px (map, inner cards, notices), `--r-l` 14 px (panels). Pill (999 px) only for toggle filters and home page buttons.
- Shadow: a single one, `0 1px 2px rgba(27,42,31,.06)`, on panels. Everything else is separated with a `--line` border.

## Components

- **Screen bar:** module label and a 22 to 26 px title. No decorative bar.
- **Panel:** border, radius `--r-l`, 18 px padding. No panels inside panels: inside, use strips with separators (`.am-grid`).
- **Buttons:** primary filled amber; secondary with a border; text buttons for minor actions. On phones, touch targets are at least 44 px.
- **Map:** takes the available height (`clamp(460px, 100vh − 250px, 820px)`), toolbar above, zoom bottom right, coordinates top right, attribution bottom left.
- **Tables:** small header, rows with separators, best value in green.
- **Notices:** `callout` with a side border; amber to review, green for normal. The text separates observed data from interpretation.
- **Empty states:** empty messages take no space (`:empty`).
- **Sun mode:** pure white background, near-black text, 2 px borders, no photo, no animation, 17 px text, 48 px buttons.

## Motion

Only on the home page: crop, pollen and light in `life.js`, at about 30 frames per second, and a background photo with a gentle parallax on computers. It stops outside the home page, with the tab hidden and with `prefers-reduced-motion`. Work screens have no decorative animation.

## Themes and languages

Light, dark and Sun mode with the same tokens. Six languages; every new text goes through the dictionary.
