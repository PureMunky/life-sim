# The Same Morning

A branching, converging life simulation. Every life starts the same way:

> 6:47 a.m. Sun comes through the blinds in thin gold bars. Somewhere down the street a dog is barking at nothing. Yesterday you graduated; today you are twenty-two and nothing has been decided yet.

From there you choose: call Dad back or don't, take the job in the city or stay in Millbrook or buy a one-way ticket, say yes to Sam, say it first to Jordan, push through the rain on the bridge or pull over. The paths **branch** by decade and **converge** on shared moments (Sam's wedding, a 2:13 a.m. phone call, a rainy night on the Millbrook bridge) that land differently depending on who you've become. Every life ends in a death, then you wake up on the same morning again.

## The loop

Some things only happen to you once you've lived through them. Lose Dad, drown at sea, or miss the night Sam needed you, and you carry that **memory** into the next life as déjà vu. That unlocks choices you couldn't have known to make before (marked **✦ Déjà vu** in the game).

| | |
|---|---|
| **Stats** | Health, Wealth, Love, Purpose (0–10). They shape which choices appear, how long you live, and who you were. |
| **Memories** | 6 to collect. Each one opens new choices in later lives. |
| **Endings** | 10 archetypes, from *Gone Too Soon* to *Keeper of the Store* to *An Ordinary Miracle*. One is a true ending that needs memories from several past lives. |
| **Your life, in moments** | When you die, you see a timeline of the moments that defined that life. |

Progress (lives, memories, endings found, and the life in progress) is saved in your browser's `localStorage`.

## Play

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
npm start            # python3 -m http.server 8000 → http://localhost:8000
```

Works as-is on GitHub Pages. Keyboard: `1`–`5` to choose, `Enter` to continue.

## How it's built

```
index.html        shell
styles.css        the sky moves from dawn to night as you age
src/engine.js     pure, deterministic state machine (no DOM) — works in browser and Node
src/story.js      the story graph: data only
src/main.js       UI + persistence
test/             graph validation, exhaustiveness proofs, 20k-life fuzz
```

The engine keeps state as plain JSON and never mutates it, so every choice is `(story, state, index) → newState`.

### Writing story

Nodes live in `src/story.js`:

```js
bridge_night: {
  chapter: 'Your Fifties',
  age: 51,
  text: [
    'Driving home, the rain comes down so hard the wipers can’t keep up.',
    { if: { flags: ['drinker'] }, text: 'You had three glasses of wine. Maybe four.' },
    { if: { memories: ['the_bridge'] }, text: 'Every hair on your arms stands up.' },
  ],
  choices: [
    { if: { memories: ['the_bridge'] }, text: 'Take the long way around.', next: 'bridge_wait' },
    {
      text: 'Push through. You’re almost home.',
      next: [{ if: { anyFlags: ['drinker'] }, to: 'death_bridge' }, { to: 'bridge_home' }],
    },
  ],
},
```

- **Conditions** (`if`): `flags`, `notFlags`, `anyFlags`, `memories`, `notMemories`, `min`/`max` stats, `minAge`/`maxAge`, `minLife`.
- **Effects** on a choice (or a node's `enter` list): `stats` deltas, `set`/`unset` flags, `log` (adds to the life timeline).
- **`next`**: a node id, or a list of `{ if, to }` checked in order, with an unconditional fallback last.
- **`unlock`**: memories you'll carry into the next life once you reach this node.
- **`ending`**: marks a death node. `age: 'natural'` derives the age at death from your health, love, and habits.
- **`exhaustive: true`**: the node has no unconditional choice, but its flag/memory conditions cover every case. The tests check every combination to prove it.

### Tests

```sh
npm test
```

The tests check that the graph has no dangling links or dead ends and is acyclic, so every life must end. They verify every `exhaustive` node across all flag combinations and play 20,000 seeded random lives to confirm every node, ending, and memory is reachable. They also check that the true ending is reachable with the right memories and impossible without them.
