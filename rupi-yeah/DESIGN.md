---
name: Rupi-yeah
description: Expense approvals kept as a bahi-khata, a ruled ledger on a red cloth binding.
colors:
  khata: "#a3161f"
  khata-deep: "#7c0f17"
  margin: "#c4323d"
  paper: "#ffffff"
  rule: "#d9e0f2"
  rule-strong: "#b9c4e3"
  select: "#eef1fa"
  ledger-hover: "#f6f8fd"
  ink: "#1f2a5c"
  ink-soft: "#4a5480"
  ink-faint: "#6f7799"
  haldi: "#e3a21a"
  haldi-wash: "#fdf3dc"
  haldi-ink: "#7a5205"
  awaiting: "#3b388c"
  ready: "#1c6a44"
  rejected: "#a3161f"
  rejected-wash: "#fbe7e8"
typography:
  display:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  amount:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "\"pnum\" 1, \"lnum\" 1"
  headline:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-dense:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  figures:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "\"tnum\" 1, \"lnum\" 1"
  label:
    fontFamily: "Mukta, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  initials:
    fontFamily: "Kalam, cursive"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1
rounded:
  focus: "2px"
  sm: "6px"
  lg: "8px"
  pill: "999px"
spacing:
  row: "3rem"
  cell-x: "0.75rem"
  gutter-sm: "1.25rem"
  gutter: "2rem"
  panel-x: "1.75rem"
  stack: "1.5rem"
  spine-width: "15.5rem"
  panel-width: "27rem"
components:
  button-approve:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body-dense}"
    rounded: "{rounded.sm}"
    padding: "0 1.125rem"
    height: "2.75rem"
  button-approve-hover:
    backgroundColor: "#28356f"
  button-reject:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.rejected}"
    rounded: "{rounded.sm}"
    padding: "0 1.125rem"
    height: "2.75rem"
  button-reject-hover:
    backgroundColor: "{colors.rejected-wash}"
  button-plain:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 1.125rem"
    height: "2.75rem"
  button-plain-hover:
    backgroundColor: "{colors.ledger-hover}"
  button-ghost-blocked:
    backgroundColor: "transparent"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.sm}"
    padding: "0 1.125rem"
    height: "2.75rem"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.625rem 0.75rem"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    height: "{spacing.row}"
    padding: "0 0.75rem"
  ledger-row-hover:
    backgroundColor: "{colors.ledger-hover}"
  ledger-row-open:
    backgroundColor: "{colors.select}"
  ledger-head:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    height: "{spacing.row}"
  spine:
    backgroundColor: "{colors.khata}"
    textColor: "{colors.paper}"
    width: "{spacing.spine-width}"
  nav-link-active:
    backgroundColor: "{colors.khata-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.625rem"
  waiting-badge:
    backgroundColor: "{colors.haldi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 0.375rem"
---

# Design System: Rupi-yeah

## Overview

**Creative North Star: "The Bahi-Khata"**

Rupi-yeah is kept like the red cloth-bound account book of an Indian trading house. The binding is a flat field of khata red that carries the brand, the navigation and the signed-in person; everything else is a white page ruled in faint blue at one fixed row pitch, written in blue-black ink. Claims are ledger entries, one ruled line each. The rupee column is set off from the rest of the line by a red double margin that runs from the column head to the foot of the page, through the blank ruled rows below the last entry. Decisions are initialled in hand: the approver's initials, in Kalam, are the one handwritten element, and a fresh decision is inked in left to right as you watch.

The page is dense and quiet. There are no cards, no tiles and no dashboard metrics; information sits on rules, and hierarchy comes from weight and ink strength rather than boxes. Colour is spent on meaning: red is the binding, the margin and a refusal; haldi yellow is what waits; green is what is done; indigo is a second approval pending. When an entry is opened it docks on the right as a second page, separated by the same red double rule, with the amount written large between two double rules like a ledger total.

The world refuses the card-grid SaaS dashboard: no stat tiles, no rounded panels floating on a grey canvas, no gradient chrome.

**Key Characteristics:**
- Flat khata-red spine; white ruled page; blue-black ink for every entry.
- One row pitch (3rem) shared by the ruled background, table rows, trail steps and initialled lines.
- The red double margin marks money, always to the left of the rupee column.
- Status colour is law: one colour per state, never borrowed for decoration.
- Initials in Kalam are the only hand; Mukta runs the interface in Latin and Devanagari.
- Blocked actions are drawn as dashed ghosts that name the rule, never hidden.

## Colors

A committed two-material palette: khata-red cloth and blue-ruled white paper, inked in blue-black, with three status colours held strictly to their states.

### Primary
- **Khata Red** (khata): the cloth binding. Fills the whole spine as one flat field, colours the rupee seal on the open entry, and sets the ॥ शुभ लाभ ॥ page head. Shares its value with Rejected on purpose: in the book, red that is not binding is a refusal.
- **Deep Binding** (khata-deep): the pressed-in state on the spine; the active navigation item sits in it.
- **Margin Red** (margin): the double margin before the rupee column and the double rules that frame the open entry's amount and divide the entry page from the ledger. Brighter than the cloth so a thin line still reads red.

### Secondary
- **Haldi** (haldi): what waits. The dot of a Pending status, the waiting-count badge on the spine, the keyboard focus ring, and the hyphen in the wordmark.
- **Haldi Ink** (haldi-ink): text of the Pending status and the "now" step in an approval chain; haldi itself is too light to read as text.
- **Haldi Wash** (haldi-wash): text selection and the current person's initials disc on the spine.

### Tertiary
- **Second-Approval Indigo** (awaiting): Awaiting second approval, and informational notes in the rule checks.
- **Settled Green** (ready): Ready for reimbursement, passed rule checks, and the "Approved" verb in initialled lines.
- **Refusal Red** (rejected) with **Refusal Wash** (rejected-wash): Rejected, failed checks, "Blocked by the server" copy, and the Reject button's text and hover.

### Neutral
- **Page White** (paper): the page, the open-entry page, inputs and secondary buttons.
- **Blue-Black Ink** (ink): all primary text, the Approve button fill, and the ink double rule under a ledger total.
- **Soft Ink** (ink-soft): secondary text, column heads, entry ids and dates.
- **Faint Ink** (ink-faint): tertiary text, placeholders, counts, later steps, blocked ghost buttons.
- **Ruling Blue** (rule): the page ruling and row separators.
- **Strong Ruling** (rule-strong): the column-head rule, input and plain-button borders, the dashed ghost border.
- **Open-Entry Wash** (select): the background of the ledger row that is open.
- **Hover Wash** (ledger-hover): the hover state of ledger rows and plain buttons.

### Named Rules
**The Status Is Law Rule.** Each claim state owns one colour: Pending haldi, Awaiting second approval indigo, Ready green, Rejected red. A status colour is never used for decoration, emphasis or brand.

**The Haldi Means Waiting Rule.** Haldi marks what is waiting and where the keyboard is. It is never the selected-row wash; the open entry is marked by an ink wash and the red seal.

**The Red Margin Rule.** Money is set off by the red double margin (two 1px lines, 1px apart). It is drawn as a background, not a border, so collapsed table borders cannot repaint it.

## Typography

**Display Font:** Mukta (with system-ui, sans-serif)
**Body Font:** Mukta (with system-ui, sans-serif)
**Label/Mono Font:** Kalam (with cursive), for initials only

**Character:** Mukta is a clerk's plain, even hand in type, with Latin and Devanagari from one family, so the page head and the interface share a voice. Kalam is the approver's pen: bold, quick, and used for nothing but initials.

### Hierarchy
- **Display** (700, 2rem, 1.25, -0.015em): the page title, once per page.
- **Amount** (700, 1.875rem, -0.01em, proportional lining figures): the open entry's amount between its double rules.
- **Headline** (700, 1.5rem, 1.25): the merchant name heading an open entry.
- **Title** (700, 1.125rem): section heads on the page, such as "Initialled by you".
- **Body** (400, 1rem, 1.5): running text and ledger cells; intro copy capped at 62ch.
- **Body dense** (400 to 600, 0.9375rem): rule checks, comments, navigation, button labels.
- **Figures** (400, 0.875rem, tabular lining): entry ids, dates, counts, timestamps.
- **Label** (600, 0.8125rem, sentence case): ledger column heads and status marks.
- **Initials** (Kalam 700, 1.25rem in initialled lines, 1.125rem in trails and audit, 0.9rem on the spine discs).

### Named Rules
**The Tabular Money Rule.** Every figure in a column uses tabular lining numerals so place values stack; a lone amount at display size uses proportional figures. The ₹ sign stays tight to the number, stepping in when the first digit is a narrow 1.

**The One Hand Rule.** Kalam writes initials and nothing else. No handwritten headings, labels or notes.

**The Sentence Case Rule.** Headings, column heads and labels are sentence case at their natural tracking. Nothing is set in uppercase.

## Layout

The app is a book held open: a spine on the left and the page to its right. From 64rem the spine is a sticky 15.5rem column at full viewport height; below that it becomes a red band at the top with the navigation as a horizontal row and the three demo identities as a segmented control.

The page has one vertical rhythm, the 3rem row. The ruled background repeats a 1px blue line every 3rem, ledger rows and heads are 3rem tall, and approval-chain steps and initialled lines sit on the same pitch. Below the content the ruling continues to the page foot, so the book never ends in blank white.

Page gutters are 1.25rem, widening to 2rem from 40rem; tables are inset slightly less so row washes reach toward the page edge. Cells pad 0.75rem horizontally. The open-entry page pads 1.25rem, 1.75rem from 40rem, and stacks its sections 1.5rem apart.

From 80rem the selected entry docks as a sticky 27rem page on the right, divided from the ledger by a 3px red double rule; below 80rem it follows the ledger, divided by the same rule across the top. Columns fold by importance: Spent drops below 48rem, Merchant below 40rem, and Status leaves its own column below 80rem to sit, status first, as the second line under the claimant. Entry and Amount are never dropped.

## Elevation & Depth

The book is flat. Depth comes from material and line, not from shadow: red cloth against white paper, ink wash on the open row, double rules to separate pages. Surfaces never float over a canvas.

A few soft shadows exist in the build as state, not structure: the active navigation item looks pressed into the cloth (an inset shadow), the signed-in identity lifts as a white chip, and the Approve button carries a low ink-tinted lift. They are listed in the sidecar; none is a pattern for new surfaces.

### Named Rules
**The Flat Book Rule.** No surface is lifted to separate it from another. Separate with a rule: blue for rows, red double for money and pages, ink double for a total.

## Shapes

Lines do the work. Horizontal rules divide everything; the only vertical lines are the red double margin and the double rule between ledger and open entry. Corners are small and sparing: 6px on buttons, fields and navigation items; 8px on the mobile identity switcher; full rounds only for status dots, the waiting badge, the demo tag and initials discs; 2px on the focus ring. The ledger and the open entry have no corners at all, being the page itself. The brand mark is the rupee seal, a ₹ in a double-ringed stamp whose inner ring is dotted.

## Components

### Buttons
Plain, firm, sized for a thumb.
- **Shape:** gently rounded (6px), 2.75rem tall, 0 1.125rem padding, 600 weight at 0.9375rem, an optional 16 to 17px line icon before the label.
- **Approve:** filled Blue-Black Ink with white text; hover deepens slightly. The one filled button on a page.
- **Reject:** white with Refusal Red text and a pale red border; hover takes the Refusal Wash.
- **Plain:** white with ink text and a Strong Ruling border, for secondary actions like View receipt.
- **Blocked ghost:** transparent, Faint Ink text, 1.5px dashed Strong Ruling border, disabled, with the rule that blocks it written beneath in Refusal Red.
- **Press / Busy:** press nudges down 1px; a busy button drops to 70% opacity with a progress cursor.

### Status marks
- **Style:** a 0.5rem dot in the state's colour followed by the label at 600, 0.8125rem, never boxed or filled. Pending takes a haldi dot with Haldi Ink text.

### Ledger
The signature surface: a full-width table on the ruled page.
- Column heads in Label type, Soft Ink, bottom-aligned on a Strong Ruling line; rows on Ruling Blue lines at the 3rem pitch.
- Entry ids and dates in Figures; names at 500; Amount right-aligned at 600 behind the red double margin.
- Hover takes the Hover Wash; the open row takes the Open-Entry Wash and the rupee seal in Khata Red beside its id. The whole row is the link.
- A total row closes a ledger of more than one entry, its amount underlined with a 3px ink double rule.

### Open entry
- Merchant as Headline, purpose in Soft Ink, id, category and date in faint Figures.
- Claimant and amount sit between two 3px red double rules, the amount in Amount type.
- Status mark, then View receipt, then Rule checks: one line per check on Ruling Blue, a green check, red cross or indigo info icon before each; a failed check is set in Refusal Red at 600.
- Decision: comment field, then Approve and Reject side by side.

### Initialled lines
- Kalam initials in a 3rem column, the entry id, the verb in its status colour, the claim, the amount and the time, on the 3rem ruled pitch.
- **Ink-in:** a new decision's initials are revealed left to right by clip-path, with a slight blur and fade clearing over 700ms on cubic-bezier(0.16, 1, 0.3, 1). Once seen, they sit still. Reduced motion shows them in place.

### Inputs / Fields
- **Style:** white, 1px Strong Ruling border, 6px corners, 0.625rem 0.75rem padding, Faint Ink placeholder.
- **Focus:** a 2px haldi outline flush to the field, border turning haldi.

### Navigation
- **Style:** on the cloth, white labels at 85% with an 18px line icon, Body dense at 500.
- **Hover:** a 10% white wash. **Active:** Deep Binding, pressed in, full white.
- **Waiting badge:** haldi pill with ink figures carrying the count of entries waiting.
- **Mobile:** the spine becomes a top band; navigation scrolls horizontally; identities become a three-way segmented control on a darkened track.

### Approval chain
- One ruled 3rem line per step: initials if the step is signed, the step label, and who. Done steps are ink, the current step Haldi Ink at 600, later steps Faint Ink, a stop Refusal Red at 600.

## Do's and Don'ts

### Do:
- **Do** put every list of claims, decisions or events on the ruled page as ledger lines at the 3rem pitch.
- **Do** set money right-aligned in tabular figures behind the red double margin, and let that margin run to the page foot.
- **Do** separate pages and totals with double rules: red for the entry and money, ink for a total.
- **Do** write initials in Kalam 700 in Blue-Black Ink, and ink a fresh decision in left to right.
- **Do** draw a blocked action as a dashed ghost and write the rule that blocks it beneath.
- **Do** fold narrow layouts by dropping columns in order of importance, keeping Entry and Amount and moving status first into the second line.
- **Do** keep the spine one flat khata-red field.

### Don't:
- **Don't** put claims in cards, tiles or stat blocks, or float panels on a grey canvas.
- **Don't** use a status colour for anything but its state, or haldi for anything but waiting and focus.
- **Don't** draw the red margin as a table border; draw it as a background.
- **Don't** use Kalam for anything but initials.
- **Don't** add gradients, texture or shadow to the spine; the cloth is flat.
- **Don't** hide a disabled action; show it and name the rule.
- **Don't** set labels or headings in uppercase or add small labels above headings.
