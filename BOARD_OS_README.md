# Claude Board OS

Six AI board seats — Jobs (Product), Bezos (Customer), Hormozi (Monetization), Altman (Strategy), Buffett (Capital), Dalio (Risk) — that debate a business idea and hand back one decisive Board Memo: BUILD / CHANGE / WAIT / KILL, with a 30-day action list.

Built for Paul Malandrino's portfolio (VMG, estack, The Straight Cut, Cut & Hinge, Little Lamb, TrueNorth Bets, etc.) — see `context/portfolio.md`.

## What's in this pack

```
board-os/
├── .claude/
│   ├── agents/              6 board-seat subagents
│   │   ├── jobs-product.md
│   │   ├── bezos-customer.md
│   │   ├── hormozi-monetization.md
│   │   ├── altman-strategy.md
│   │   ├── buffett-capital.md
│   │   └── dalio-risk.md
│   └── commands/
│       └── board.md         the /board slash command that runs the full meeting
├── templates/
│   ├── board-memo.md        final output structure
│   ├── strategy-plan.md     10-year opportunity/risk map
│   └── risk-framework.md    standalone pre-launch risk checklist
├── context/
│   └── portfolio.md         Paul's ventures — every agent reads this first
└── memos/                   completed board memos land here
```

## Setup — 3 steps

1. **Drop this folder into a project.** Copy `board-os/` (or just its contents) into the root of a Claude Code project — anywhere on disk, doesn't need to be a code repo. The `.claude/agents/` and `.claude/commands/` folders are what Claude Code auto-discovers.

2. **Open Claude Code in that folder.**
   ```
   cd board-os
   claude
   ```

3. **Run a board meeting.**
   ```
   /board Should I launch Bench & Square as a standalone brand or fold the workbooks into The Straight Cut?
   ```
   Claude will read `context/portfolio.md`, dispatch all six agents in parallel, show you where they agree and disagree, and write a memo to `memos/`.

## Using it without Claude Code

If you're in claude.ai chat instead of the CLI, there's no subagent dispatch — paste this into a conversation and it does the same debate inline:

> Act as a board of 6 advisors: Jobs (product), Bezos (customer), Hormozi (monetization), Altman (strategy), Buffett (capital), Dalio (risk). Here's my portfolio context: [paste context/portfolio.md]. Here's my idea: [your idea]. Give each advisor's verdict in 2-3 sentences, show where they disagree, then synthesize one recommendation — BUILD / CHANGE / WAIT / KILL — with a 30-day action list, using the structure in templates/board-memo.md.

## Keeping it current
- Edit `context/portfolio.md` whenever a venture launches, pauses, or dies — every agent reads it fresh each session, so it's the one file worth keeping accurate.
- Add `context/business-ops.md` if you want cross-brand operational rules (ad pauses, weekly schedule) available to the Dalio/Risk seat too.
- Each agent file's persona and question set can be edited directly — they're plain markdown with YAML frontmatter, no code.

## Running one seat solo
You don't need a full board meeting for everything. In Claude Code you can call a single seat directly:
```
> Use the hormozi-monetization agent to critique the pricing on Bench & Square.
```
