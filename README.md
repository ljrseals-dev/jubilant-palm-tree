# Blowtorch

Craft wild, singable lyrics, then get them ready for amazing vocals. A chat bot plus four tools in one self-contained web page, and the LLM system prompt that drives the bot. It is the singer's counterpart to BiggieFlow.

| Tool | What it does |
|---|---|
| **Chat** | A chat bot. Ask for lyrics, consonant coaching, a gospel-style run, or help reading formant numbers. It uses the Blowtorch system prompt (embedded from `prompts/blowtorch_system_prompt.md` at build time) and keeps the conversation on the page. Needs Claude, so it is live on the published page; elsewhere, press Copy system prompt and paste it as the first message of a chat with Claude. |
| **Lyric Forge** | Give it a theme, mood, voice, rhyme scheme and a craft vector of eight measures (repetition, variation, phrase length, call to answer length, first person, holdable endings, climax position, interjections). The default preset is a Mahalia Jackson reference built from published descriptions of gospel craft. Claude writes original lines with call and answer roles, a held word and run spots; a Craft Meter then measures the verse against the vector, and Refine rewrites it to close the gaps. Needs Claude, so it is live on the published page; in the standalone file it shows a brief you can copy into any chat, and the meter still works on the example verse. |
| **Blow! Singer** | Splits each word into onset, vowel and coda, classes the consonants (plosive, fricative, nasal, glide or liquid, affricate; voiced or unvoiced), and shows a per-word timing bar for how early the consonant starts and when it releases. |
| **Gospel Runs** | Builds a held note and a 4 to 7 note pentatonic or blues run, with glide-in, vibrato, a syllable ladder (consonant, narrow vowel, lyric vowel) and a pitch-guide playback. |
| **Formant Tuner** | Live pitch, F1 and F2 on a vowel chart, with the harmonics of your sung note and whether F1 is within 25 cents of one. Sources: microphone, an audio file, or a demo vowel. |

## Use it

Open `index.html` in Chrome or Firefox. Blow! Singer, Gospel Runs and the Formant Tuner work offline; Chat and the Forge's writing need Claude. The microphone needs permission and works from a local file in most browsers. If your browser refuses on a `file://` page, serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Or publish the folder with GitHub Pages (Settings, Pages, deploy from branch). Lyric Forge needs Claude, which is only connected when the page is published as a Claude Artifact.

Microphone audio is analysed in the browser and never uploaded. Lyric Forge sends your brief (theme, mood, settings) to Claude, on the viewer's own Claude account, only when you press Forge lyrics or Redo.

## Files

| Path | What it is |
|---|---|
| `index.html` | Standalone page (built from the source below) |
| `src/blowtorch.body.html` | Source of truth; also the file published as an Artifact |
| `build.py` | Rebuilds `index.html` and `dist/artifact.html`, embedding the system prompt for the chat bot. Run it after editing the prompt or the source |
| `prompts/blowtorch_system_prompt.md` | LLM system prompt: lyric writer, consonant coach, formant coach, run writer |
| `tests/dsp.test.js` | Node tests for pitch and formant estimation on synthetic vowels (17 checks) |
| `tests/meter.test.js` | Node tests for the craft measures and for the example verse matching its preset |
| `tests/highpitch.js` | Prints how formant accuracy degrades as pitch rises |

```bash
node tests/dsp.test.js
node tests/meter.test.js
node tests/highpitch.js
```

## How the formant estimate works

Audio is downsampled, pre-emphasised and windowed (40 ms). Linear prediction (autocorrelation with Levinson-Durbin, order about 13) gives a spectral envelope, and the first two envelope peaks above 180 Hz are reported as F1 and F2. Pitch comes from a normalised autocorrelation tracker. The nearest-harmonic offset is `1200 * log2(F / (n * f0))` with `n = round(F / f0)`, the proximity idea used by the Finding Resonance tool (Warwick).

## Known limits

- Formants: close up to about 260 Hz (middle C) on synthetic vowels. From about 330 Hz (E4) up, the estimate tends to lock onto a harmonic instead of the true formant. Expect rough values for higher notes.
- Reference vowels are approximate speech averages (Peterson and Barney style) typed in from memory of the commonly tabulated values; they were not re-verified against the original table. Singing shifts them.
- Consonant parsing works from spelling, so silent letters, soft c and unusual words can be misread. Lead and release times are starting estimates to tune by ear.
- The Craft Meter checks only what can be measured from spelling and structure (syllable counts, repeats, word endings). It cannot tell you whether a line is good, and no tool can certify lyrics as perfect. The Mahalia preset values are my starting estimates, not measurements of her songs; no lyrics of hers were copied or analyzed.
- Lyric Forge: the page and the prompt tell Claude to write original lines, but nothing checks them against existing songs. Check before you release anything. The live Claude call was tested with a stand-in, not against the real service.
- The run generator and its pitch guide are a plain synthesized tone. It does not model any person's voice.
- The vibrato and run facts come from published analysis of Mahalia Jackson recordings (HfM Weimar pop voices study), which covers the recordings it studied, not every performance.

## Consent and style

Mahalia Jackson cannot consent to voice cloning, so this project does not imitate or synthesize her voice. Published analysis of her phrasing is used as a style reference only. She is the example of how gospel lyrics are delivered, not their author: her best-known recordings were written by others. The prompt refuses voice cloning without documented consent and a liveness check, and refuses to reproduce copyrighted lyrics.

Add a LICENSE of your choice before publishing.
