# Token Shredder Skin Storyboard

This document defines the installed pet skins as frame-based desktop-pet animations.
Each skin uses the same fictional pixel TOKEN bill. It is not real currency and should
not look like a realistic banknote.

## Shared Frame Contract

Every generated pet skin uses six frames:

| Frame | Meaning |
| --- | --- |
| 0 | Idle: full TOKEN bill is visible before consumption. |
| 1 | 25% consumed: bill has started entering the pet. |
| 2 | 50% consumed: bill is visibly halfway through. |
| 3 | 75% consumed: only a small part remains. |
| 4 | 100% consumed: bill is gone, pet returns to a waiting pose. |
| 5 | Burst: TOKEN letter blocks drop after a whole bill is consumed. |

Real monitoring maps `currentBillProgress` to frames 0-4 and only shows frame 5
when a usage event crosses a whole-dollar boundary. Demo mode loops all frames.

## Installed Skins

### Shredder

- The shared TOKEN bill feeds into the shredder slot.
- The output is TOKEN letter blocks and colored paper chunks.
- This remains the primary product mascot.

### Dao

- Kept as the existing user-provided skin.
- Do not regenerate this skin unless explicitly requested.
- Do not apply the removed code-painted shirt overlay.

### Codex Chomp

- Frame 0: full TOKEN bill in both hands, mouth ready.
- Frame 1: bill enters the mouth by about 25%.
- Frame 2: bill is halfway eaten.
- Frame 3: only a small part remains.
- Frame 4: bill gone, mascot returns to idle.
- Frame 5: TOKEN blocks burst below the mouth.
- Wing tips must remain inside the canvas in every frame.
- The bill must never go from damaged back to full within the same cycle.

### Agent Bot

- Frame 0: robot holds a full TOKEN bill.
- Frame 1: bill enters the chest slot by about 25%.
- Frame 2: bill is halfway inserted.
- Frame 3: only a small part remains.
- Frame 4: chest slot is empty again.
- Frame 5: TOKEN blocks drop from the slot.

### Token Furnace

- Frame 0: full TOKEN bill is held in front of the furnace mouth.
- Frame 1: bill enters the hot mouth by about 25%.
- Frame 2: bill is halfway burned.
- Frame 3: only a small green remnant remains.
- Frame 4: fire remains, bill is gone.
- Frame 5: TOKEN blocks fall out as ash-like chunks.

### Budget Black Hole

- Frame 0: full vertical TOKEN bill is above the event horizon.
- Frame 1: bill sinks lower into the ring.
- Frame 2: bill is halfway swallowed.
- Frame 3: bill is flattened inside the ring.
- Frame 4: bill is gone, ring idles.
- Frame 5: TOKEN blocks are ejected below the device.

## Asset Pipeline

- Source reference: `public/assets/skins/source/token-pet-animation-reference.png`
- Generator: `scripts/generate-unified-pet-assets.py`
- Output frame folders:
  - `public/assets/skins/codex-chomp-frames/`
  - `public/assets/skins/agent-bot-frames/`
  - `public/assets/skins/token-furnace-frames/`
  - `public/assets/skins/budget-black-hole-frames/`
- Output spritesheets:
  - `public/assets/skins/*-spritesheet.png`
- Shared bill assets:
  - `public/assets/generated/token-bill-pixel.png`
  - `public/assets/generated/token-bill-vertical.png`
