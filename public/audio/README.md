# Custom BRAWLZ audio

Put your audio files in this folder using these exact filenames:

| Filename | Used for |
| --- | --- |
| `bar-blues.mp3` | Looping harmonica/blues music for the bar stage |
| `punch-left.mp3` | Player's left punch impact |
| `punch-right.mp3` | Player's right punch impact |
| `opponent-hurt-01.mp3` | Opponent taking a normal hit |
| `opponent-hurt-02.mp3` | Opponent taking a weak-spot or heavy hit |
| `player-hurt-01.mp3` | Player taking a normal hit |
| `player-hurt-02.mp3` | Player taking a heavy hit |
| `dodge.mp3` | Player dodge or duck movement |
| `knockout.mp3` | Opponent knockout impact |

MP3 is the simplest browser-compatible format. Keep music normalized lower than
the effects so punches remain clear. Suggested peaks:

- Music: approximately `-18 LUFS`
- Voice/hurt sounds: approximately `-12 LUFS`
- Punch impacts: approximately `-8 LUFS`

The game attempts to play these files automatically. If a file is absent, it uses
a synthesized fallback sound so the game remains playable.

Only add audio that you created, licensed, or have permission to distribute.

## Included background music

`bar-blues.mp3` is “Whiskey Bar Blues” from Fesliyan Studios, downloaded from
the provider's official site for use as background music in this noncommercial
video game.

Credit: https://www.FesliyanStudios.com
