/* UI layer: renders engine state, persists progress between lives. */
(function () {
  'use strict';

  const E = window.LifeEngine;
  const story = window.LifeStory;
  const SAVE_KEY = 'same-morning.v1';
  const STAT_LABELS = { health: 'Health', wealth: 'Wealth', love: 'Love', purpose: 'Purpose' };
  const ERAS = {
    'The Morning': 0,
    'Your Twenties': 1,
    'Your Thirties': 2,
    'Your Forties': 3,
    'Your Fifties': 4,
    'Your Sixties': 5,
    'The Last Morning': 6,
  };

  const $app = document.getElementById('app');
  const $meta = document.getElementById('meta');
  const $stats = document.getElementById('stats');

  // meta: what survives death. life: the one in progress (or null).
  let save = load();

  function load() {
    const fresh = { meta: { lives: 0, memories: [], endings: {}, deaths: [] }, life: null };
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? Object.assign(fresh, JSON.parse(raw)) : fresh;
    } catch (e) {
      return fresh;
    }
  }

  function persist() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch (e) {
      /* private mode etc. — the game still works, it just forgets */
    }
  }

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  function setEra(era) {
    document.body.dataset.era = String(era);
  }

  // ───── Header ─────
  function renderBar(state, prev) {
    const playing = !!state;
    $meta.hidden = !playing;
    $stats.hidden = !playing;
    if (!playing) return;
    document.getElementById('life-label').textContent = 'Life ' + state.life;
    document.getElementById('age-label').textContent = 'Age ' + state.age;
    $stats.innerHTML = E.STATS.map((k) => {
      const v = state.stats[k];
      const pips = Array.from({ length: 10 }, (_, i) => `<i class="pip${i < v ? ' on' : ''}"></i>`).join('');
      const d = prev ? v - prev.stats[k] : 0;
      const delta = d ? `<b class="delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '+' : ''}${d}</b>` : '';
      return `<span class="stat" data-k="${k}" title="${STAT_LABELS[k]}: ${v}/10">${STAT_LABELS[k]}<span class="pips">${pips}</span>${delta}</span>`;
    }).join('');
  }

  // ───── Title ─────
  function renderTitle() {
    setEra(0);
    renderBar(null);
    const m = save.meta;
    const resuming = save.life && !save.life.ended;
    const found = story.archetypes.filter((a) => m.endings[a.id]);
    const cta = resuming ? 'Continue this life' : m.lives === 0 ? 'Wake up' : 'Wake up again';

    let html = `<section class="card title-screen">
      <h1>The Same Morning</h1>
      <p class="lede">Every life begins at 6:47 a.m., the morning after graduation. What happens next is up to you. What happens after that, you'll remember.</p>
      <div class="actions">
        <button class="primary" data-action="${resuming ? 'resume' : 'new'}">${cta}</button>
        ${resuming ? '<button class="secondary" data-action="new">Start a new life</button>' : ''}
      </div>`;

    if (m.lives > 0) {
      html += `<p class="section-label">Lives lived: ${m.lives} · Endings found: ${found.length}/${story.archetypes.length}</p>
        <div class="grid">${story.archetypes
          .map((a) =>
            m.endings[a.id]
              ? `<div class="tile"><strong>${esc(a.title)}</strong><span>${esc(a.epitaph)}</span></div>`
              : `<div class="tile locked"><strong>???</strong><span>Not yet lived</span></div>`
          )
          .join('')}</div>`;
      html += renderMemories(m.memories, []);
      html += `<div class="actions"><button class="secondary" data-action="forget">Forget everything</button></div>`;
    }
    html += `</section>`;
    $app.innerHTML = html;
  }

  function renderMemories(known, fresh) {
    const ids = Object.keys(story.memories);
    return `<p class="section-label">Memories carried: ${known.length}/${ids.length}</p>
      <div class="grid">${ids
        .map((id) => {
          const mem = story.memories[id];
          if (known.includes(id) || fresh.includes(id)) {
            return `<div class="tile memory${fresh.includes(id) ? ' new' : ''}"><strong>✦ ${esc(mem.title)}</strong><span>${esc(mem.text)}</span></div>`;
          }
          return `<div class="tile locked"><strong>✦ ???</strong><span>Something you haven't lived through yet</span></div>`;
        })
        .join('')}</div>`;
  }

  // ───── Playing ─────
  function renderScene(state, prev) {
    const node = story.nodes[state.nodeId];
    setEra(ERAS[state.chapter] ?? 0);
    renderBar(state, prev);

    const paras = E.renderText(node, state);
    let html = `<section class="card"><p class="chapter">${esc(state.chapter)} · ${state.age}</p>`;
    html += `<div class="prose">${paras
      .map((p, i) => `<p style="animation-delay:${i * 0.35}s">${esc(p)}</p>`)
      .join('')}</div>`;

    const choices = E.availableChoices(node, state);
    const delay = paras.length * 0.35 + 0.2;
    html += `<ol class="choices">${choices
      .map((c, i) => {
        const isMemory = c.if && c.if.memories;
        return `<li><button class="choice${isMemory ? ' memory' : ''}" data-choice="${i}" style="animation-delay:${delay + i * 0.08}s">
          <span class="key">${i + 1}</span>
          <span>${isMemory ? '<span class="tag">✦ Déjà vu</span>' : ''}${esc(c.text)}</span>
        </button></li>`;
      })
      .join('')}</ol></section>`;
    $app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderEnding(state, prev) {
    const node = story.nodes[state.nodeId];
    const { ending } = state;
    renderBar(state, prev);
    setEra('end');

    const paras = E.renderText(node, state);
    const moments = state.log.length
      ? `<ol class="timeline">${state.log
          .map((l) => `<li><span class="age">${l.age}</span>${esc(l.text)}</li>`)
          .join('')}</ol>`
      : `<p class="lede">You didn't do much worth writing down. That's a kind of answer too.</p>`;

    $app.innerHTML = `<section class="card ending">
      <div class="prose">${paras.map((p, i) => `<p style="animation-delay:${i * 0.5}s">${esc(p)}</p>`).join('')}</div>
      <p class="section-label">Life ${state.life}</p>
      <h1>You died at ${ending.age}.</h1>
      <p class="cause">${esc(ending.cause)}</p>
      <p class="archetype">${esc(ending.archetype.title)}</p>
      <p class="epitaph">${esc(ending.archetype.epitaph)}</p>
      <p class="section-label">Your life, in moments</p>
      ${moments}
      ${state.unlocked.length ? `<p class="section-label">Next time, you'll remember</p>` : ''}
      ${
        state.unlocked.length
          ? `<div class="grid">${state.unlocked
              .map((id) => `<div class="tile memory new"><strong>✦ ${esc(story.memories[id].title)}</strong><span>${esc(story.memories[id].text)}</span></div>`)
              .join('')}</div>`
          : ''
      }
      <div class="actions">
        <button class="primary" data-action="new">${ending.archetype.id === 'peace' ? 'Wake up anyway' : 'Wake up again'}</button>
        <button class="secondary" data-action="title">All lives</button>
      </div>
    </section>`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ───── Flow ─────
  function recordDeath(state) {
    const m = save.meta;
    m.lives = state.life;
    for (const id of state.unlocked) if (!m.memories.includes(id)) m.memories.push(id);
    m.endings[state.ending.archetype.id] = (m.endings[state.ending.archetype.id] || 0) + 1;
    m.deaths.push({ life: state.life, age: state.ending.age, cause: state.ending.cause, archetype: state.ending.archetype.id });
    m.deaths = m.deaths.slice(-200);
  }

  function show(state, prev) {
    save.life = state;
    if (state.ended) {
      if (!prev || !prev.ended) recordDeath(state);
      renderEnding(state, prev);
    } else {
      renderScene(state, prev);
    }
    persist();
  }

  function newLife() {
    show(E.startLife(story, save.meta));
  }

  function pick(i) {
    const prev = save.life;
    if (!prev || prev.ended) return;
    const node = story.nodes[prev.nodeId];
    if (i >= E.availableChoices(node, prev).length) return;
    show(E.choose(story, prev, i), prev);
  }

  $app.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.choice != null) return pick(Number(btn.dataset.choice));
    switch (btn.dataset.action) {
      case 'new':
        return newLife();
      case 'resume':
        return show(save.life);
      case 'title':
        return renderTitle();
      case 'forget':
        if (confirm('Forget every life, ending, and memory? This cannot be undone.')) {
          try { localStorage.removeItem(SAVE_KEY); } catch (err) { /* ignore */ }
          save = load();
          renderTitle();
        }
    }
  });

  document.getElementById('home').addEventListener('click', renderTitle);

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (/^[1-9]$/.test(e.key)) {
      const btn = $app.querySelector(`[data-choice="${Number(e.key) - 1}"]`);
      if (btn) btn.click();
    } else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) {
      const primary = $app.querySelector('.primary');
      if (primary) primary.click();
    }
  });

  renderTitle();
})();
