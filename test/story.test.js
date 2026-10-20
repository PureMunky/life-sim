const test = require('node:test');
const assert = require('node:assert');
const engine = require('../src/engine');
const story = require('../src/story');

const memoryIds = Object.keys(story.memories);
const nodeIds = Object.keys(story.nodes);

const targetsOf = (next) => (typeof next === 'string' ? [next] : next.map((n) => n.to));

// Small seeded PRNG so fuzz failures are reproducible.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function playRandomly(random, memories, lives) {
  let s = engine.startLife(story, { memories, lives });
  const path = [s.nodeId];
  while (!s.ended) {
    const choices = engine.availableChoices(story.nodes[s.nodeId], s);
    assert.ok(choices.length, `soft-lock at ${s.nodeId}: flags=${s.flags} memories=${memories}`);
    s = engine.choose(story, s, Math.floor(random() * choices.length));
    path.push(s.nodeId);
    assert.ok(path.length < 100, 'life did not end: ' + path.join(' > '));
  }
  return { state: s, path };
}

// Play a life by picking choices whose text contains each fragment, in order.
function playScript(memories, fragments) {
  let s = engine.startLife(story, { memories, lives: 1 });
  for (const frag of fragments) {
    const choices = engine.availableChoices(story.nodes[s.nodeId], s);
    const i = choices.findIndex((c) => c.text.includes(frag));
    assert.ok(i >= 0, `no choice matching "${frag}" at ${s.nodeId}`);
    s = engine.choose(story, s, i);
  }
  return s;
}

test('story graph is well-formed', () => {
  assert.deepStrictEqual(engine.validateStory(story), []);
});

test('story graph is acyclic, so every life must end', () => {
  const state = {}; // undefined = unvisited, 1 = in progress, 2 = done
  const visit = (id, trail) => {
    if (state[id] === 2) return;
    assert.notStrictEqual(state[id], 1, 'cycle: ' + trail.concat(id).join(' > '));
    state[id] = 1;
    for (const c of story.nodes[id].choices || []) {
      for (const t of targetsOf(c.next)) visit(t, trail.concat(id));
    }
    state[id] = 2;
  };
  visit(story.start, []);
});

test('exhaustive nodes offer a choice under every flag/memory combination', () => {
  for (const id of nodeIds) {
    const node = story.nodes[id];
    if (!node.exhaustive) continue;
    const flags = new Set();
    const mems = new Set();
    for (const c of node.choices) {
      const cond = c.if || {};
      const keys = Object.keys(cond);
      assert.ok(
        keys.every((k) => ['flags', 'notFlags', 'memories', 'notMemories'].includes(k)),
        `${id}: exhaustive nodes may only branch on flags/memories`
      );
      [].concat(cond.flags || [], cond.notFlags || []).forEach((f) => flags.add(f));
      [].concat(cond.memories || [], cond.notMemories || []).forEach((m) => mems.add(m));
    }
    const vars = [...flags].map((f) => ['f', f]).concat([...mems].map((m) => ['m', m]));
    for (let mask = 0; mask < 1 << vars.length; mask++) {
      const s = { flags: [], memories: [], stats: {} };
      vars.forEach(([kind, name], i) => {
        if (mask & (1 << i)) (kind === 'f' ? s.flags : s.memories).push(name);
      });
      assert.ok(engine.availableChoices(node, s).length > 0, `${id}: no choice for ${JSON.stringify(s)}`);
    }
  }
});

test('every unlockable memory is defined', () => {
  for (const [id, node] of Object.entries(story.nodes)) {
    for (const m of node.unlock || []) assert.ok(story.memories[m], `${id} unlocks unknown memory ${m}`);
  }
});

test('fuzz: random lives with random memories always end, and cover the whole story', () => {
  const random = rng(42);
  const seenNodes = new Set();
  const seenArchetypes = new Set();
  const learnedFirstLife = new Set();
  for (let i = 0; i < 20000; i++) {
    const memories = memoryIds.filter(() => random() < 0.5);
    const firstLife = i % 4 === 0;
    const { state, path } = playRandomly(random, firstLife ? [] : memories, firstLife ? 0 : 3);
    path.forEach((n) => seenNodes.add(n));
    seenArchetypes.add(state.ending.archetype.id);
    if (firstLife) state.unlocked.forEach((m) => learnedFirstLife.add(m));
    assert.ok(state.ending.age >= 22 && state.ending.age <= 99);
  }
  assert.deepStrictEqual(nodeIds.filter((n) => !seenNodes.has(n)), [], 'unreached nodes');
  assert.deepStrictEqual(
    story.archetypes.map((a) => a.id).filter((a) => a !== 'peace' && !seenArchetypes.has(a)),
    [],
    'unreached endings'
  );
  assert.deepStrictEqual([...learnedFirstLife].sort(), memoryIds.slice().sort(), 'every memory learnable on life one');
});

const truePath = [
  'Call Dad',
  'cardiologist',
  'Jordan?',
  'number',
  'Tell Sam about the offer',
  'city',
  'Call Jordan',
  'Say it first',
  'Take the promotion',
  'toast',
  'Propose',
  'Start a family',
  'kale',
  'already in the car',
  'Start running',
  'Pull over',
  'Drive home',
  'Teach Rosie',
  'every bridge',
  'last morning',
];

test('the true ending is reachable once the right memories are carried', () => {
  const s = playScript(['dad_heart', 'sam_call', 'jordan_name'], truePath);
  assert.ok(s.ended);
  assert.strictEqual(s.ending.archetype.id, 'peace');
});

test('the true ending is impossible without memories', () => {
  assert.throws(() => playScript([], truePath), /no choice matching/);
});

test('choices are deterministic and never mutate the previous state', () => {
  const a = engine.startLife(story, {});
  const snapshot = JSON.stringify(a);
  const b = engine.choose(story, a, 0);
  assert.strictEqual(JSON.stringify(a), snapshot);
  assert.deepStrictEqual(b, engine.choose(story, a, 0));
});

test('memories are only carried in, never learned mid-life', () => {
  const s = playScript([], ['Call Dad', 'Promise', 'napkins', 'number', 'Tell Sam', 'city', 'Grind', 'promotion', 'Slip out', 'Pour yourself', 'Not now', 'Drive']);
  assert.strictEqual(s.nodeId, 'dad_lost');
  assert.deepStrictEqual(s.memories, []);
  assert.ok(s.unlocked.includes('dad_heart'));
});
