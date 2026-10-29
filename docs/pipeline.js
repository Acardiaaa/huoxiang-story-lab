(function () {
  'use strict';
  const D = window.PipelineData, P = window.PipelineCore, PRACTICE_KEY = 'huoxiang-pipeline.practice.v1';
  const oldRender = render, oldAction = pharmAction, oldInit = courseInitModule, oldCatalog = catalog;
  const ui = {target: 'B', node: 'arom', token: null, choice: {}, zoom: window.innerWidth >= 1800 ? .9 : .8, scroll: {x: 0, y: 0}, modal: null, message: '', legacy: false};
  let practice = null, drag = null, ignoreClickUntil = 0;
  try {const x = JSON.parse(localStorage.getItem(PRACTICE_KEY)); if (x?.revision === D.revision) practice = x;} catch (_) {}
  const active = () => view === 'pipeline-demo' || view === 'course' && courseModule === 'process' && !ui.legacy;
  const demo = () => view === 'pipeline-demo';
  const game = () => demo() ? practice : courseRun()?.pipelineGame;
  const nodeMeta = id => D.nodes.find(n => n.id === id);
  const isOld = r => r?.modules?.process && r.modules.process.bankVersion !== D.revision && r.modules.process.answers?.some(Boolean);
  function keepScroll() {const e = document.querySelector('.pipe-viewport'); if (e) ui.scroll = {x: e.scrollLeft, y: e.scrollTop};}
  function sync() {
    const g = game(); if (!g) return;
    if (demo()) {try {localStorage.setItem(PRACTICE_KEY, JSON.stringify(g));} catch (_) {toast('试玩记录未能保存，可导出记录备份。');} return;}
    const r = courseRun(), p = P.plan(g); r.route = p.legacy;
    if (!r.modules.process || r.modules.process.bankVersion !== D.revision) r.modules.process = {id: 'process', bankVersion: D.revision, started: g.started, finished: null, cursor: 0, bank: p.groups.map(x => ({id: x.id, stage: x.title, title: x.title, points: x.points, source: x.source, options: []})), answers: [], orders: [], beats: {}, checks: {}};
    const m = r.modules.process;
    m.answers = g.groups.map((x, i) => x.complete || x.submissions.length ? {points: p.groups[i].points, firstCorrect: x.complete && x.firstCorrect === true, firstValue: x.submissions[0]?.value, lastValue: x.submissions.at(-1)?.value, corrected: x.complete, submissions: structuredClone(x.submissions), pipeline: true} : null);
    m.cursor = Math.max(0, g.groups.findIndex(x => !x.complete)); m.finished = g.finished;
    if (courseAllFinished(r)) r.finished = g.finished;
    save();
  }
  function freshUi() {ui.node = 'arom'; ui.token = null; ui.choice = {}; ui.modal = null; ui.message = ''; ui.scroll = {x: 0, y: 0};}
  function begin(route) {
    if (!Object.hasOwn(D.routes, route)) return;
    if (!demo() && isOld(courseRun())) return;
    const g = P.create(route);
    if (demo()) practice = g;
    else {
      const r = courseRun(); if (!r || r.pipelineGame) return;
      r.pipelineGame = g; r.route = D.routes[route].legacy; r.plan = {...r.plan, target: D.routes[route].name, pipelineRevision: D.revision, confirmedAt: g.started};
    }
    freshUi(); ui.message = '先从物料入口拿起一份药材，再把它拖入你查到的设备。独立支路可以自由安排先后。'; sync(); render();
  }
  function header(g) {
    const p = g ? P.plan(g) : null;
    return `<header class="pipe-header"><button data-action="home" class="pipe-back">← 研习目录</button><div><small>第三幕 / 提取工艺研究</small><h1>${p ? esc(p.name) + '<span>工艺管道工作台</span>' : '领取一份制备委托'}</h1></div><div class="pipe-header-status"><span>${demo() ? '自由试玩 · 不计入课程成绩' : esc(profile()?.name) + ' · ' + esc(state.currentId)}</span><b>${g ? P.score(g) : 0}<small> / 30</small></b></div></header>`;
  }
  function selection() {
    const r = !demo() && courseRun();
    if (isOld(r)) return `<section class="pipe-app">${header(null)}<div class="pipe-select"><p class="pipe-eyebrow">历史批次已保留</p><h2>这份批次来自旧版工艺练习</h2><p>原有回答、首次得分与后续课程使用的制剂保持原记录。管道工作台可用独立试玩体验；新课程批次将直接采用管道玩法。</p><div class="pipe-select-actions"><button class="pipe-primary" data-action="pipe-demo">进入管道工作台试玩</button><button data-action="pipe-legacy">${r.modules.process.finished ? '回看旧版工艺记录' : '继续原有工艺记录'}</button><button data-action="course-export">导出原课程手记</button></div></div></section>`;
    return `<section class="pipe-app">${header(null)}<div class="pipe-select"><p class="pipe-eyebrow">A COMMISSION FROM THE LAB</p><h2>先确认这次要制备的制剂</h2><p>四种制剂共用一张工艺地图。目标确定后，查阅相应制法，把各组分送入设备，完成分流、精制、合流与成型。</p><div class="pipe-target-grid">${Object.values(D.routes).map(p => `<button class="pipe-target ${ui.target === p.code ? 'selected' : ''}" data-action="pipe-target" data-route="${p.code}" style="--target-color:${p.color}" aria-pressed="${ui.target === p.code}">${product(p.legacy)}<span><b>${esc(p.name)}</b><small>同图操作 · 8个计分环节</small></span><i>${ui.target === p.code ? '✓' : '○'}</i></button>`).join('')}</div><div class="pipe-start-note"><b>秦老师</b><p>“这次先把目标写清楚。设备可以共用，分组、条件和流股去向要按你的目标逐项核对。合流之前，看看每一路是不是都到了。”</p></div><div class="pipe-select-actions"><button class="pipe-primary" data-action="pipe-start">确认目标，进入工作台 →</button><span>${demo() ? '试玩独立保存，可重新选择其他制剂。' : '确认后锁定本批目标；首次错误0分，纠正后继续。'}</span></div></div><div class="pipe-select-art" aria-hidden="true"></div></section>`;
  }
  function movable(g, at) {return P.available(g).filter(t => !at || t.node === at);}
  function tokenChip(t) {return `<button class="pipe-token ${ui.token === t.id ? 'picked' : ''}" data-action="pipe-pick" data-token="${esc(t.id)}" data-pipe-token="${esc(t.id)}" aria-pressed="${ui.token === t.id}" title="拖动，或点击拿起后再点接收节点"><i>⠿</i><span>${esc(t.label)}<small>${esc(nodeMeta(t.node)?.title)}</small></span></button>`;}
  function inspector(g) {
    const p = P.plan(g), n = nodeMeta(ui.node) || nodeMeta('arom');
    const pending = p.operations.filter(o => o.node === n.id && !g.done[o.id]);
    const op = pending.find(o => P.ready(g, o)) || pending.find(o => o.inputs.some(id => g.tokens[id] && !g.tokens[id].consumed && g.tokens[id].node === n.id));
    const held = Object.values(g.tokens).filter(t => !t.consumed && t.node === n.id && t.node !== t.origin);
    const completed = p.operations.filter(o => o.node === n.id && g.done[o.id]);
    let work = '';
    if (op) {
      const missing = P.missing(g, op);
      work += `<div class="pipe-receiving"><h3>本步接收清单</h3>${op.inputs.map(id => `<div class="${missing.includes(id) ? '' : 'received'}"><i>${missing.includes(id) ? '○' : '✓'}</i>${esc(P.label(g, id))}</div>`).join('')}</div>`;
      if (missing.length) work += '<p class="pipe-hint">尚未集齐，设备保持待机。此检查不扣分；物料到齐后再设置方法。</p>';
      else work += `<form id="pipe-operation-form" data-operation="${op.id}">${op.config ? `<fieldset><legend>本步工艺设置</legend>${g.orders[op.id].map(i => `<label class="pipe-setting"><input type="radio" name="pipe-setting" value="${i}" ${ui.choice[op.id] === i ? 'checked' : ''}><span>${esc(op.config.options[i])}</span></label>`).join('')}</fieldset>` : ''}<button class="pipe-primary pipe-run" type="submit">${esc(op.action)} ▷</button><p class="pipe-hint">虚拟操作不代表真实生产参数已经验证。</p></form>`;
    } else if (n.kind === 'error') work += '<p class="pipe-hint">这是一个可能导致流股丢失或物料不兼容的支路。实际投料后会触发本步判断。</p>';
    else if (!movable(g, n.id).length && !completed.length) work += '<p class="pipe-hint">设备待机。可以先查看方法，再从物料架拿起物料，拖到接收节点。</p>';
    if (held.length) work += `<div class="pipe-held">${held.map(t => `<div><span>${esc(t.label)}</span><button data-action="pipe-withdraw" data-token="${t.id}">撤回投料</button></div>`).join('')}</div>`;
    if (movable(g, n.id).length) work += `<h3>此处可搬运的物料</h3>${movable(g, n.id).map(tokenChip).join('')}`;
    if (completed.length) work += `<details class="pipe-past"><summary>回看此设备记录 ${completed.length} 项</summary>${completed.map(o => `<p><b>${esc(g.done[o.id].method)}</b>${o.config ? '<br>' + esc(o.config.parameters) : ''}</p>`).join('')}</details>`;
    const finished = g.finished ? `<div class="pipe-result"><span>本批工艺完成 · 质量待检</span><h2>${esc(p.name)}</h2><strong>${P.score(g)}<small> / 30</small></strong><p>制备完成与质量合格分别判断。</p>${demo() ? '<button class="pipe-primary" data-action="pipe-new-practice">换一种制剂试玩</button>' : '<button class="pipe-primary" data-action="course-open" data-module="quality">进入质量标准研究 →</button>'}<button data-action="pipe-ledger">回看路线与逐项得分</button></div>` : '';
    return `<aside class="pipe-inspector" aria-label="设备与物料操作"><div class="pipe-inspector-heading"><span>当前工作台</span><h2>${esc(n.title)}</h2></div>${finished}${work}<details class="pipe-inventory" ${!op && !g.finished ? 'open' : ''}><summary>可搬运物料架 <b>${movable(g).length}</b></summary><p>拖动物料，或点击“拿起”后点地图节点。</p>${movable(g).map(tokenChip).join('') || '<p>全部物料已进入工艺。</p>'}</details></aside>`;
  }
  function dialog(g) {
    if (g.blocked) {
      const gr = P.plan(g).groups[g.blocked.group];
      return `<div class="pipe-modal-shade"><section class="pipe-modal pipe-correction" role="dialog" aria-modal="true" aria-label="工艺纠正提示" tabindex="-1"><small>本步暂停 · 物料保持操作前状态</small><h2>先核对这一步</h2><p>${esc(g.blocked.text)}</p><p class="pipe-score-explain">${esc(gr?.title)}：首次错误，本环节0分；其他环节不扣分，纠正后继续。</p><button class="pipe-primary" data-action="pipe-ack">返回工作台，修订操作 →</button></section></div>`;
    }
    if (!ui.modal) return '';
    const p = P.plan(g);
    let title = '工艺手记与评分', body = `<table><thead><tr><th>计分环节</th><th>得分</th><th>状态</th></tr></thead><tbody>${p.groups.map((x, i) => `<tr><td>${esc(x.title)}</td><td>${g.groups[i].complete && g.groups[i].firstCorrect ? x.points : 0} / ${x.points}</td><td>${g.groups[i].complete ? '已完成' : g.groups[i].firstCorrect === false ? '首次失分，待纠正完成' : '待完成'}</td></tr>`).join('')}</tbody></table><p>本章只计选定制剂的30分，完成进度和得分分别保存。独立支路允许不同的操作先后。</p><details><summary>本批投料卡</summary><p>${esc(p.formula)}</p></details><h3>实际操作记录</h3><ol class="pipe-log">${g.log.map(x => `<li class="${x.type}">${esc(x.text)}<small>${new Date(x.at).toLocaleTimeString('zh-CN')}</small></li>`).join('') || '<li>尚未操作。</li>'}</ol>`;
    if (ui.modal === 'help') {
      title = '怎样操作管道工作台';
      body = '<ol class="pipe-help"><li>从物料架或地图中拿起物料，拖到设备；也可以先点物料，再点接收节点。</li><li>共享设备不代表处理条件相同。按目标制剂查阅文献，选择本步工艺设置。</li><li>合流节点需集齐规定的全部物料；中间液和暂存液会作为新物料出现，继续拖动。</li><li>未验证管道是中性色，正确走过的管道才显示本制剂颜色。红色提醒出现后，纠正原步骤。</li><li>工作台支持横向、纵向滚动和缩放。点“定位物料”可以回到当前物料附近。</li><li>每条制剂路线8个计分环节，共30分。首次错误0分，无扣分，纠正后不补分；刷新不会重置首次记录。</li></ol>';
    }
    if (ui.modal === 'course') {title = '全课程成绩'; body = courseScoresHtml(courseRun());}
    return `<div class="pipe-modal-shade"><section class="pipe-modal" role="dialog" aria-modal="true" aria-label="${title}" tabindex="-1"><header><h2>${title}</h2><button data-action="pipe-close" aria-label="关闭">×</button></header>${body}<footer><button data-action="pipe-export">导出本批记录 ↓</button><button class="pipe-primary" data-action="pipe-close">回到工作台 →</button></footer></section></div>`;
  }
  function board(g) {
    const p = P.plan(g), progress = P.progress(g), picked = g.tokens[ui.token];
    const speech = ui.message || (g.finished ? '“这份制剂的工艺记录已经完整了。把样品标成质量待检，带着批记录进入下一章。”' : '“方法、物料和去向要一起核对。先完成各组分支路，再看哪些液体该合并、哪些需要暂存。”');
    return `<section class="pipe-app pipe-board" style="--pipe-color:${p.color}">${header(g)}<div class="pipe-toolbar"><div><b>${demo() ? '试玩批次' : '主评批次'}</b><span>计分环节 ${progress.complete} / 8</span><span>操作 ${progress.operations} / ${progress.operationTotal}</span><span class="pipe-color-key"><i></i>正确走过的管道</span></div><div><button data-action="pipe-zoom-out" aria-label="缩小地图">−</button><span>${Math.round(ui.zoom * 100)}%</span><button data-action="pipe-zoom-in" aria-label="放大地图">＋</button><button data-action="pipe-fit">适合宽度</button><button data-action="pipe-locate">定位物料</button><button data-action="pipe-help">操作说明</button><button data-action="pipe-ledger">手记与得分</button></div></div><div class="pipe-workspace"><div class="pipe-map-wrap"><div class="pipe-picked-bar" aria-live="polite">${picked && !picked.consumed ? `<span>正在搬运：<b>${esc(picked.label)}</b> → 拖动或点接收节点</span><button data-action="pipe-cancel-pick">放下</button>` : '<span>⠿ 拖动物料标签，或先点物料再点节点。拖动空白处可平移地图。</span>'}</div><div class="pipe-viewport" tabindex="0" aria-label="可滚动和缩放的工艺地图"><div class="pipe-canvas" style="width:${D.width * ui.zoom}px;height:${D.height * ui.zoom}px">${D.svg}</div></div><div class="pipe-map-status">多入口 · 分流后物料分别搬运 · 合流齐备才运行${demo() ? '<button data-action="pipe-new-practice">新建试玩批次</button>' : '<button data-action="course-export">导出课程手记</button>'}</div></div>${inspector(g)}</div><div class="pipe-dialogue"><img src="assets/vn-qin-sprite.png" alt="秦老师立绘"><div class="pipe-name">秦老师</div><div class="pipe-speech" role="status">${esc(speech)}</div><div class="pipe-dialogue-buttons"><button data-action="pipe-ledger">回看操作</button>${demo() ? '<button data-action="home">课程目录 →</button>' : '<button data-action="pipe-course-score">全课程成绩</button>'}</div></div>${dialog(g)}</section>`;
  }
  function mountMap(g) {
    const svg = document.querySelector('.pipe-map'); if (!svg) return;
    const p = P.plan(g);
    svg.querySelectorAll('.edge').forEach(el => {
      const edge = D.edges.find(e => e.id === el.id);
      const visited = edge && edge.route === g.route && g.trace.some(t => t.from === edge.a && t.to === edge.b);
      el.classList.toggle('visited', !!visited);
      if (visited) {
        const paths = el.querySelectorAll(':scope > path'); if (paths[1]) paths[1].setAttribute('stroke', p.color);
        el.querySelectorAll('polygon').forEach(x => {x.setAttribute('fill', p.color); x.setAttribute('stroke', p.color);});
      }
    });
    svg.querySelectorAll('.node').forEach(el => {
      const id = el.dataset.pipeNode, pos = D.positions[id];
      el.classList.toggle('selected', ui.node === id);
      const ops = p.operations.filter(o => o.node === id);
      const done = ops.length && ops.every(o => g.done[o.id]);
      const ready = ops.some(o => P.ready(g, o));
      el.classList.toggle('operated', !!done); el.classList.toggle('ready', !!ready);
      if (id === p.end) el.classList.add('target-outlet');
      const tokens = Object.values(g.tokens).filter(t => !t.consumed && t.node === id);
      const label = done && !tokens.length ? '✓ 已归档' : ready ? '▷ 可运行' : tokens.length ? `⠿ 物料 ${tokens.length}` : '';
      if (label) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x + pos.w - 9); text.setAttribute('y', pos.y + pos.h - 5);
        text.setAttribute('text-anchor', 'end'); text.setAttribute('class', 'pipe-node-badge');
        text.textContent = label; el.append(text);
      }
    });
    const viewport = document.querySelector('.pipe-viewport'); viewport.scrollLeft = ui.scroll.x; viewport.scrollTop = ui.scroll.y;
  }
  function draw() {
    clearInterval(ticker);
    const g = game();
    document.querySelector('#app').innerHTML = `<main id="main">${g ? board(g) : selection()}</main>`;
    document.body.classList.add('pipeline-active');
    if (g) mountMap(g);
    if (g?.blocked || ui.modal) document.querySelector('.pipe-modal')?.focus();
  }
  function focusNode(id) {
    const viewport = document.querySelector('.pipe-viewport'), pos = D.positions[id]; if (!viewport || !pos) return;
    viewport.scrollLeft = Math.max(0, (pos.x + 48 + pos.w / 2) * ui.zoom - viewport.clientWidth / 2);
    viewport.scrollTop = Math.max(0, (pos.y + 30 + pos.h / 2) * ui.zoom - viewport.clientHeight / 2);
    ui.scroll = {x: viewport.scrollLeft, y: viewport.scrollTop};
  }
  function result(r) {keepScroll(); ui.message = r.text; sync(); render();}
  function take(id, locate = false) {
    ignoreClickUntil = 0;
    const g = game(), t = g?.tokens[id]; if (!t || t.consumed || t.node !== t.origin || g.finished || g.blocked) return;
    keepScroll(); ui.token = ui.token === id ? null : id; ui.node = t.node; render(); if (locate) focusNode(t.node);
  }
  function chooseNode(id) {
    const g = game(); if (!g || g.blocked) return;
    keepScroll();
    if (ui.token && g.tokens[ui.token]?.node !== id) {
      const r = P.drop(g, ui.token, id); if (r.ok && r.type === 'transfer') {ui.token = null; ui.node = id;} result(r); return;
    }
    ui.node = id; render();
  }
  function exportBatch() {
    const g = game(); if (!g) return;
    const value = {title:'藿香正气工艺管道实验记录',revision:D.revision,mode:demo()?'独立试玩 不计课程成绩':'课程主评',student:demo()?null:{name:profile()?.name,id:state.currentId},target:P.plan(g).name,score:P.score(g),max:30,status:g.finished?'制备完成 质量待检':'进行中',policy:'首次错误0分，无扣分，纠正不补分；独立支路允许等价先后',run:g};
    const url = URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `工艺管道记录_${P.plan(g).name}_${demo()?'试玩':state.currentId}.json`; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  render = function () {if (active()) {draw(); return;} document.body.classList.remove('pipeline-active'); oldRender();};
  courseInitModule = function (id, r) {if (id === 'process' && !r.modules.process && !r.pipelineGame) return null; return oldInit(id, r);};
  catalog = function () {
    return oldCatalog().replace('<h2>提取工艺研究</h2>', '<h2>提取工艺研究</h2><p class="pipe-catalog-description">新增管道工作台：确认目标制剂，拖动物料，选择设备，完成分流与合流。</p><button class="text-button pipe-catalog-demo" data-action="pipe-demo">自由试玩管道小游戏 ↗</button>');
  };
  pharmAction = function (act, b) {
    if (act === 'pipe-demo') {view = 'pipeline-demo'; freshUi(); ui.legacy = false; render(); return true;}
    if (act === 'course-open' && b.dataset.module === 'process') ui.legacy = false;
    if (!act.startsWith('pipe-')) {if(active())keepScroll();return oldAction(act, b);}
    const g = game(); keepScroll();
    if (act === 'pipe-target') ui.target = b.dataset.route;
    else if (act === 'pipe-start') {begin(ui.target); return true;}
    else if (act === 'pipe-legacy') {ui.legacy = true; render(); return true;}
    else if (act === 'pipe-new-practice' && demo()) {practice = null; try {localStorage.removeItem(PRACTICE_KEY);} catch (_) {} freshUi();}
    else if (!g) return true;
    else if (act === 'pipe-pick') {take(b.dataset.token); return true;}
    else if (act === 'pipe-cancel-pick') ui.token = null;
    else if (act === 'pipe-withdraw') {P.withdraw(g, b.dataset.token); sync();}
    else if (act === 'pipe-ack') {P.acknowledge(g); ui.message = '物料仍保留在操作前的位置。查清原因后，修订同一步即可继续；首次记录会保留。'; sync();}
    else if (act === 'pipe-ledger') ui.modal = 'ledger';
    else if (act === 'pipe-help') ui.modal = 'help';
    else if (act === 'pipe-course-score') ui.modal = 'course';
    else if (act === 'pipe-close') ui.modal = null;
    else if (act === 'pipe-export') {exportBatch(); return true;}
    else if (act === 'pipe-zoom-in' || act === 'pipe-zoom-out') {
      const v = document.querySelector('.pipe-viewport'), z = ui.zoom;
      ui.zoom = Math.max(.35, Math.min(1.8, ui.zoom + (act.endsWith('in') ? .15 : -.15)));
      ui.scroll = {x:(v.scrollLeft + v.clientWidth/2)/z*ui.zoom-v.clientWidth/2,y:(v.scrollTop + v.clientHeight/2)/z*ui.zoom-v.clientHeight/2};
    } else if (act === 'pipe-fit') {ui.zoom = Math.max(.35, Math.min(1.2, (document.querySelector('.pipe-viewport').clientWidth-12)/D.width)); ui.scroll = {x:0,y:0};}
    else if (act === 'pipe-locate') {focusNode(g.tokens[ui.token]?.node || ui.node); return true;}
    render(); return true;
  };
  document.addEventListener('change', e => {if (active() && e.target.name === 'pipe-setting') {const f = e.target.closest('form'); ui.choice[f.dataset.operation] = Number(e.target.value);}});
  document.addEventListener('submit', e => {
    if (e.target.id !== 'pipe-operation-form') return; e.preventDefault();
    const g = game(), id = e.target.dataset.operation, r = P.run(g, id, ui.choice[id]);
    if (r.ok) ui.token = null; result(r);
  });
  document.addEventListener('click', e => {
    if (!active() || performance.now() < ignoreClickUntil || e.target.closest('.pipe-modal-shade')) return;
    const n = e.target.closest('[data-pipe-node]'); if (n) chooseNode(n.dataset.pipeNode);
  });
  document.addEventListener('keydown', e => {
    if (!active()) return;
    if (e.key === 'Escape') {if (game()?.blocked) return; ui.modal = null; ui.token = null; render();}
    const n = e.target.closest?.('[data-pipe-node]');
    if (n && ['Enter',' '].includes(e.key)) {e.preventDefault(); chooseNode(n.dataset.pipeNode);}
  });
  // Pointer dragging works with mouse, stylus and touch; click-to-pick is the keyboard fallback.
  document.addEventListener('pointerdown', e => {
    if (!active() || !game() || game().blocked || ui.modal || e.button !== 0 || e.target.closest('button:not([data-pipe-token]),input,summary')) return;
    const direct = e.target.closest('[data-pipe-token]'), n = e.target.closest('[data-pipe-node]');
    let token = direct?.dataset.pipeToken;
    if (!token && n) {const list = movable(game(), n.dataset.pipeNode); if (list.length === 1) token = list[0].id;}
    const v = document.querySelector('.pipe-viewport');
    if (token) drag = {token,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,moved:false,pointer:e.pointerId};
    else if (e.target === v || e.target.closest('.pipe-canvas') && !n) drag = {pan:true,startX:e.clientX,startY:e.clientY,x:v.scrollLeft,y:v.scrollTop,moved:false};
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    const distance = Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY);
    if (!drag.moved && distance < 7) return; drag.moved = true; e.preventDefault();
    const v = document.querySelector('.pipe-viewport');
    if (drag.pan) {v.scrollLeft=drag.x-(e.clientX-drag.startX);v.scrollTop=drag.y-(e.clientY-drag.startY);return;}
    drag.x=e.clientX;drag.y=e.clientY;
    if (!document.querySelector('.pipe-drag-ghost')) {const el=document.createElement('div');el.className='pipe-drag-ghost';el.textContent=game().tokens[drag.token].label;document.body.append(el);}
    const ghost=document.querySelector('.pipe-drag-ghost');ghost.style.left=(e.clientX+16)+'px';ghost.style.top=(e.clientY+14)+'px';
    document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));
    document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-pipe-node]')?.classList.add('drop-target');
    const rect=v.getBoundingClientRect();
    if(e.clientX>rect.left&&e.clientX<rect.right&&e.clientY>rect.top&&e.clientY<rect.bottom){if(e.clientX>rect.right-40)v.scrollLeft+=18;if(e.clientX<rect.left+40)v.scrollLeft-=18;if(e.clientY>rect.bottom-40)v.scrollTop+=18;if(e.clientY<rect.top+40)v.scrollTop-=18;}
  },{passive:false});
  document.addEventListener('pointerup', e => {
    if(!drag)return;const d=drag;drag=null;document.querySelector('.pipe-drag-ghost')?.remove();document.querySelectorAll('.drop-target').forEach(x=>x.classList.remove('drop-target'));
    if(!d.moved)return;ignoreClickUntil=performance.now()+250;keepScroll();
    if(d.pan)return;
    const dest=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-pipe-node]');
    if(dest){const r=P.drop(game(),d.token,dest.dataset.pipeNode);if(r.ok&&r.type==='transfer'){ui.token=null;ui.node=dest.dataset.pipeNode;}result(r);}
  });
  document.addEventListener('pointercancel',()=>{drag=null;document.querySelector('.pipe-drag-ghost')?.remove();});
  COURSE_SECTIONS.find(s=>s.id==='process').intro='先确认目标制剂，再在统一管道地图上拖动物料、选择设备与方法，完成各组分支路、精制、合流和成型。';
  if(new URLSearchParams(location.search).get('play')==='pipeline') view='pipeline-demo';
  render();
})();
