# Mobile use audit · YvyShift v17

Date: 15 Nov 2026. It answers the team's agricultural UX suggestions and the request to audit how the app looks and feels on a phone.

## How it was measured

Chromium emulating a Pixel 7 (412 × 915 px, touch screen, density 2.6), with external network blocked to measure the worst case (no signal in the field). All nine views were visited before and after the changes. In each view a script counted:

- **Small touch targets:** visible buttons, links, selects and collapsibles smaller than 44 × 44 px (Apple's minimum and WCAG 2.5.5).
- **Small text:** visible elements with text under 13 px.
- **Sideways overflow:** whether the page forces horizontal scrolling.
- **Serif font in running text:** paragraphs, cells and labels in a serif font.
- **Minimum contrast in Sun mode:** the worst text-to-background contrast ratio on the home page and the bar.

It was not tested on a physical phone or in real sunlight: that is left for a teammate with the published address.

## Results

| View | Small touch targets (before → after) | Texts under 13 px (before → after) |
|---|---|---|
| Home | 9 → 1 | 2 → 0 |
| Field Monitor (map) | 35 → 8 | 12 → 2 |
| Field DNA | 3 → 0 | 12 → 3 |
| Rotation Lab | 29 → 8 | 16 → 6 |
| Climate Replay | 3 → 0 | 8 → 0 |
| Resilience Passport | 3 → 0 | 8 → 1 |
| Adaptive Monitor (alerts) | 3 → 0 | 9 → 0 |
| My fields | 3 → 0 | 1 → 0 |
| Sensors and irrigation | 3 → 0 | 2 → 0 |
| **Total** | **91 → 17** | **70 → 12** |

Sideways overflow: none, before or after. JavaScript errors: 0. Text elements in a serif font on the phone: 15 → 0. Minimum contrast on the home page in Sun mode: 6.8 : 1 (WCAG AA asks for 4.5 : 1 and AAA for 7 : 1).

What is still small, and why it was left: the area markers on the map (18 × 44 px; they can also be tapped from the list of areas), checkboxes inside labels that are already 44 px tall, links inside a paragraph (WCAG exempts them) and the numbers in SVG charts and the map attribution (10 to 12 px).

## How it looked and felt (before)

The first impression was good: a careful design, no overflow, large main buttons. But field use had five points of friction:

1. **The bottom bar had 9 items in a strip that scrolled sideways.** Six were visible (Home, Monitor, DNA, Rotation, Replay, Alerts). Passport, My fields and Sensors were hidden on the right with no hint that they existed. The labels were English product names ("Monitor", "DNA", "Replay") at 11 px.
2. **The home page talked about technology, not decisions.** A farmer could not tell what to tap from its headline.
3. **Italic serif headings** of 34 to 60 px: nice on a computer, slower to read on a phone with glare.
4. **There was no mode for sunlight.** The light theme existed, but with a cream background, soft greys and an always-dark home page with gradients: at high brightness in direct sun, contrast drops a lot.
5. **Small controls on the work screens:** 34 to 36 px tall map tools, 28 px collapsibles in Rotation Lab, 18 px checkboxes.

## How it looks and feels (after)

- **A bottom bar of 5 fixed buttons**, with no scrolling: Home, Map, Rotations, Alerts and **More**. "More" opens a bottom sheet with Field DNA, Climate Replay, Resilience Passport, My fields and Sensors, each with its description, in 60 px buttons. "More" stays highlighted when one of those modules is open. It closes with "Close", by tapping outside or with Escape.
- **A home page in the farmer's language:** "What do I sow this winter to get through a dry year?", with the buttons "See my area on the map" and "Compare what to sow", and four **quick questions** that go straight to the answer (for example "How hard did the 2021–22 drought hit us?" opens Rotation Lab with that season selected).
- **Sun mode** (☀ "Sun" button in the top bar): pure white background, near-black text, 2 px borders, no photo, no animation or gradients, 17 px text, 48 px buttons, all type sans-serif. It is remembered on the phone and starts on its own if the system asks for more contrast.
- **On phones all type is sans-serif**, including headings and numbers. On computers the v4 serif headings stay.
- **Minimums of 44 px and 13 px** applied to buttons, selects, collapsibles, map zoom, checkboxes (22 px inside 44 px labels) and small labels.
- **Home page background:** a photo of a field at sunset behind the text, with a dark green veil so the text stays readable. On computers it moves gently with the mouse (up to 22 px). On phones it stays still, because a background that moves with the gyroscope distracts and drains the battery.

Screenshots in `docs/auditoria_movil/` (before and after, normal and Sun mode).

## Pending

- Test on two or three real phones, in full sun, with the published address. Note what is not understood.
- Guaraní for the new texts: only "Sun" (Kuarahy) and "Map" were translated. The rest appears in English until a native speaker reviews it. Portuguese is complete.
- Japanese and Hindi show the new texts in English.
- The chat and the home page cards could be shorter on phones. The home page is about 3,460 px tall, about four screens.
