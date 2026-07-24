# BRAWLZ

`BRAWLZ` is a first-person, timing-driven street-fighting game inspired by the
read-and-react rhythm of classic boxing games, rebuilt around grounded environments
and cinematic, realistic presentation.

## Stage 1 — Last Call

The opening fight takes place in a neighborhood bar against Mack “Last Call” Doyle.
Watch his movement, dodge or guard his attacks, manage stamina, and discover the
weakness he exposes during one of his signature moves.

### Controls

| Key | Action |
| --- | --- |
| `←` / `→` | Dodge left / right |
| `↓` | Duck |
| `↑` | High guard |
| `J` | Left punch |
| `K` | Right punch |

Hold `J` or `K` to charge a punch. More charge produces more damage but consumes
more stamina and leaves the player committed for longer.

## Run locally

No build step is required:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Stage-one systems

- First-person visible fists with separate charge and strike states
- Visible shoulders and torso that drive forward with punches and move with defense
- Health, stamina, punch-power, timer, injury, and result HUD
- Telegraph-driven opponent AI that becomes faster as it takes damage
- Directional dodge, duck, and high-guard defense
- Discoverable rib weak spot revealed by a specific opponent wind-up
- Progressive opponent injury states and knockout animation
- Accuracy, completion time, and weak-hit results
- Blues-bar music and impact/hurt audio system with synthesized fallbacks

## Custom audio

Add your own licensed MP3 files to [`public/audio`](./public/audio). The exact
filenames for music, left/right punches, player hurt, opponent hurt, dodge, and
knockout sounds are listed in [`public/audio/README.md`](./public/audio/README.md).
The game automatically attempts to use those recordings and falls back to
procedural audio when a file is not present.

The generated environment and character art are original assets created for this
prototype.
