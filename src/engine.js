/*
 * Life Sim engine — pure, deterministic, UI-free.
 *
 * A story is a graph of nodes. Choices branch it; shared nodes converge it.
 * State is plain JSON so it can be saved, cloned, and tested.
 *
 * Works as a classic <script> (exposes window.LifeEngine) and as a Node module.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LifeEngine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STATS = ['health', 'wealth', 'love', 'purpose'];
  const STAT_MIN = 0;
  const STAT_MAX = 10;

  const has = (list, x) => list.indexOf(x) !== -1;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (n) => Math.max(STAT_MIN, Math.min(STAT_MAX, n));

  /**
   * Condition shape (all keys optional, all must hold):
   *   flags, notFlags, anyFlags       — flags set during this life
   *   memories, notMemories           — memories carried in from past lives
   *   min, max                        — { stat: n } inclusive bounds
   *   minAge, maxAge, minLife         — current age / life number
   */
  function matches(cond, state) {
    if (!cond) return true;
    if (cond.flags && !cond.flags.every((f) => has(state.flags, f))) return false;
    if (cond.notFlags && cond.notFlags.some((f) => has(state.flags, f))) return false;
    if (cond.anyFlags && !cond.anyFlags.some((f) => has(state.flags, f))) return false;
    if (cond.memories && !cond.memories.every((m) => has(state.memories, m))) return false;
    if (cond.notMemories && cond.notMemories.some((m) => has(state.memories, m))) return false;
    if (cond.min) for (const k in cond.min) if (state.stats[k] < cond.min[k]) return false;
    if (cond.max) for (const k in cond.max) if (state.stats[k] > cond.max[k]) return false;
    if (cond.minAge != null && state.age < cond.minAge) return false;
    if (cond.maxAge != null && state.age > cond.maxAge) return false;
    if (cond.minLife != null && state.life < cond.minLife) return false;
    return true;
  }

  // Mutates s. Effects: { stats: {k: delta}, set: [], unset: [], log: '' }
  function applyEffects(s, fx) {
    if (fx.stats) for (const k in fx.stats) s.stats[k] = clamp(s.stats[k] + fx.stats[k]);
    if (fx.set) for (const f of fx.set) if (!has(s.flags, f)) s.flags.push(f);
    if (fx.unset) s.flags = s.flags.filter((f) => !has(fx.unset, f));
    if (fx.log) s.log.push({ age: s.age, text: fx.log });
  }

  function interpolate(text, state) {
    return text.replace(/\{(\w+)\}/g, (m, key) => (key in state ? String(state[key]) : m));
  }

  // node.text is a string or a list of strings / { if, text } variants.
  function renderText(node, state) {
    const parts = Array.isArray(node.text) ? node.text : [node.text];
    return parts
      .filter((p) => typeof p === 'string' || matches(p.if, state))
      .map((p) => interpolate(typeof p === 'string' ? p : p.text, state));
  }

  function availableChoices(node, state) {
    return (node.choices || []).filter((c) => matches(c.if, state));
  }

  // next is an id, or [{ if, to }, ..., { to }] — first match wins.
  function resolveNext(next, state) {
    if (typeof next === 'string') return next;
    const hit = next.find((n) => matches(n.if, state));
    if (!hit) throw new Error('No matching transition from ' + state.nodeId);
    return hit.to;
  }

  function resolveEnding(story, s) {
    const node = story.nodes[s.nodeId];
    if (node.ending.age === 'natural') s.age = story.naturalAge(s);
    const archetype = story.archetypes.find((a) => matches(a.if, s));
    return {
      cause: node.ending.cause,
      age: s.age,
      archetype: { id: archetype.id, title: archetype.title, epitaph: archetype.epitaph },
    };
  }

  function enter(story, state, id) {
    const node = story.nodes[id];
    if (!node) throw new Error('Unknown node: ' + id);
    const s = clone(state);
    s.nodeId = id;
    if (typeof node.age === 'number') s.age = node.age;
    if (node.chapter) s.chapter = node.chapter;
    for (const fx of node.enter || []) if (matches(fx.if, s)) applyEffects(s, fx);
    for (const m of node.unlock || []) {
      if (!has(s.memories, m) && !has(s.unlocked, m)) s.unlocked.push(m);
    }
    if (node.ending) {
      s.ended = true;
      s.ending = resolveEnding(story, s);
    }
    return s;
  }

  /** Begin a new life. meta = { lives, memories } carried between lives. */
  function startLife(story, meta) {
    meta = meta || {};
    const base = {
      life: (meta.lives || 0) + 1,
      nodeId: null,
      chapter: '',
      age: 0,
      stats: Object.assign({}, story.startStats),
      flags: [],
      memories: (meta.memories || []).slice(),
      unlocked: [],
      log: [],
      ended: false,
      ending: null,
    };
    return enter(story, base, story.start);
  }

  /** Pick the index-th *visible* choice. Returns a new state. */
  function choose(story, state, index) {
    if (state.ended) throw new Error('This life is over.');
    const node = story.nodes[state.nodeId];
    const choice = availableChoices(node, state)[index];
    if (!choice) throw new Error('No choice ' + index + ' at ' + state.nodeId);
    const s = clone(state);
    applyEffects(s, choice);
    return enter(story, s, resolveNext(choice.next, s));
  }

  /** Static checks: dangling links, dead ends, missing fallbacks. */
  function validateStory(story) {
    const errors = [];
    const ids = Object.keys(story.nodes);
    const targets = (next) => (typeof next === 'string' ? [next] : next.map((n) => n.to));
    if (!story.nodes[story.start]) errors.push('start node missing: ' + story.start);
    if (!story.archetypes.length || story.archetypes[story.archetypes.length - 1].if) {
      errors.push('last archetype must be an unconditional fallback');
    }
    for (const id of ids) {
      const node = story.nodes[id];
      if (node.ending) {
        if (node.choices) errors.push(id + ': ending nodes cannot have choices');
        continue;
      }
      const choices = node.choices || [];
      if (!choices.length) errors.push(id + ': no choices and not an ending');
      // `exhaustive: true` asserts the conditions cover every state; tests verify it by exploration.
      if (!node.exhaustive && !choices.some((c) => !c.if)) {
        errors.push(id + ': needs an unconditional choice (or exhaustive: true)');
      }
      choices.forEach((c, i) => {
        if (!c.next) return errors.push(id + '#' + i + ': missing next');
        if (Array.isArray(c.next) && c.next[c.next.length - 1].if) {
          errors.push(id + '#' + i + ': conditional next needs an unconditional fallback last');
        }
        for (const t of targets(c.next)) {
          if (!story.nodes[t]) errors.push(id + '#' + i + ': unknown target ' + t);
        }
      });
    }
    return errors;
  }

  return {
    STATS,
    matches,
    renderText,
    availableChoices,
    startLife,
    choose,
    validateStory,
  };
});
