# Owlbear Rodeo Statblock Extension

Interactive D&D 5e monster stat block renderer for
[Owlbear Rodeo](https://www.owlbear.rodeo/). This extension allows GMs to view
detailed monster information directly within their VTT, featuring a classic 5e
layout, modern 2024 styling, and powerful interactive rolling capabilities.

## Features

- **Classic 5e Visuals**: A beautiful, parchment-themed stat block with
  authentic typography and fluid scaling.
- **Interactive Rolls**:
  - **Advantage/Disadvantage Support**: Hold **Shift** while clicking to roll
    with Advantage (`2d20kh1`), or **Ctrl/Cmd** to roll with Disadvantage
    (`2d20kl1`).
  - **Attacks**: Click on hit modifiers (e.g., `+7`) or damage formulas (e.g.,
    `2d6 + 4`).
  - **Attributes**: Integrated 3-column grid showing Score, Modifier (MOD), and
    Saving Throw (SAVE) side-by-side—all clickable.
  - **Initiative**: Click the initiative bonus next to AC to roll for turn
    order.
  - **Recharges**: Click on recharge ranges (e.g., `5-6`) to roll a `1d6`
    recharge check.
- **Improved UX**:
  - **Sticky Header**: The monster's name and controls stay visible at the top
    while scrolling.
  - **Minimize/Expand**: Quickly collapse the stat block to just the header to
    save screen space.
  - **D&D Beyond Integration**: The monster name links directly to its full
    entry on [D&D Beyond](https://www.dndbeyond.com/) when available.
- **Security**: Access is restricted to the **GM role only** to prevent players
  from seeing monster statistics.
- **Multi-Source Data**: Automatically loads and caches monster data from
  multiple JSON bestiaries.

## How to Use

1. **Upload a Token**: Upload a monster token to Owlbear Rodeo with a name
   matching a monster in the database. Refer to
   [MONSTERS.md](./docs/MONSTERS.md) for a full reference of supported monster
   names. Sample [tokens](./docs/tokens/) are provided to illustrate this
   process.
2. **Open the Extension**: Open the Statblock extension from the Owlbear Rodeo
   extension menu and click the **Show** button.
3. **Select a Token**: Select a single monster token on your scene to instantly
   visualize its stats.

## Integrations

- **[Dice+](https://extensions.owlbear.rodeo/dice-plus)**: All rolls made within
  the stat block are sent directly to the Dice+ extension for a shared rolling
  experience.
- **[Battle Board](https://extensions.owlbear.rodeo/battle-board)**: Integrates
  with the Battle Board extension to automate initiative rolls, AC, and hit
  points.

## Technical Details

Built with a focus on performance and developer experience:

- **React + TypeScript**: Type-safe component architecture.
- **Custom Vite Plugin**: Automatically syncs `manifest.json` versions with
  `package.json` and appends a `(DEV)` flag during local development.
- **Custom Tag Parser**: Robust regex-based parser handling complex tags like
  `{@hit}`, `{@damage}`, `{@recharge}`, `{@actSave}`, and more.
- **D&D Beyond Sync**: Includes a specialized Node.js scraper script
  (`scripts/dndbeyond-sync.mjs`) to keep the bestiary's external links updated.
- **Battle Board Integration**: Includes hooks for initializing combat and
  syncing metadata with the Battle Board extension.

## Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Local Development**:
   ```bash
   npm run dev
   ```
3. **Quality Control**: Formatting, linting and import sorting
   ```bash
   npm run check
   ```
4. **Production Build**:
   ```bash
   npm run build
   ```

## Legal

This work includes material from the System Reference Document 5.2.1 (“SRD
5.2.1”) by Wizards of the Coast LLC, available at
<https://www.dndbeyond.com/srd>. The SRD 5.2.1 is licensed under the Creative
Commons Attribution 4.0 International License, available at
<https://creativecommons.org/licenses/by/4.0/legalcode>.

## License

MIT
