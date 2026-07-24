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
- Health, stamina, punch-power, timer, injury, and result HUD
- Telegraph-driven opponent AI that becomes faster as it takes damage
- Directional dodge, duck, and high-guard defense
- Discoverable rib weak spot revealed by a specific opponent wind-up
- Progressive opponent injury states and knockout animation
- Accuracy, completion time, and weak-hit results

The generated environment and character art are original assets created for this
prototype.
