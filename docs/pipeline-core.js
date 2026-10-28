(function (root) {
  'use strict';
  const data = () => root.PipelineData;
  const now = () => new Date().toISOString();
  const plan = g => data().routes[g.route];
  const operation = (g, id) => plan(g).operations.find(o => o.id === id);
  const available = g => Object.values(g.tokens).filter(t => !t.consumed && t.node === t.origin);
  function create(route, random = Math.random) {
    const p = data().routes[route];
    if (!p) throw new Error('未知制剂路线');
    const g = {revision: data().revision, route, started: now(), finished: null, tokens: {}, done: {}, groups: p.groups.map(() => ({firstCorrect: null, complete: false, submissions: []})), orders: {}, trace: [], log: [], blocked: null};
    for (const id of p.initial) g.tokens[id] = {...data().materials[id], origin: data().materials[id].node, consumed: false};
    for (const o of p.operations) {
      const a = o.config?.options.map((_, i) => i) || [];
      for (let i = a.length - 1; i > 0; i--) {const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]];}
      g.orders[o.id] = a;
    }
    return g;
  }
  function log(g, type, text, extra = {}) {const x = {at: now(), type, text, ...extra}; g.log.push(x); return x;}
  function need(g, token) {return plan(g).operations.find(o => !g.done[o.id] && o.inputs.includes(token));}
  function missing(g, o) {return o.inputs.filter(id => !g.tokens[id] || g.tokens[id].consumed || g.tokens[id].node !== o.node);}
  function label(g, id) {return g.tokens[id]?.label || data().materials[id]?.label || plan(g).operations.flatMap(o => o.outputs).find(x => x.id === id)?.label || id;}
  function ready(g, o) {return !g.finished && !g.done[o.id] && missing(g, o).length === 0;}
  function fail(g, group, text, extra = {}) {
    const x = log(g, 'error', text, {group, ...extra});
    const gr = g.groups[group];
    if (gr && !gr.complete) {gr.firstCorrect = false; gr.submissions.push({at: x.at, correct: false, value: text, ...extra});}
    g.blocked = {text, group, at: x.at, ...extra};
    return {ok: false, type: 'error', text};
  }
  function drop(g, tokenId, node) {
    if (g.finished) return {ok: false, type: 'info', text: '本批已完成，回看不会改变成绩。'};
    if (g.blocked) return {ok: false, type: 'blocked', text: '先查看并关闭当前纠正提示，再继续操作。'};
    const t = g.tokens[tokenId];
    if (!t || t.consumed) return {ok: false, type: 'info', text: '这份物料已经进入后续处理。'};
    if (t.node !== t.origin) return {ok: false, type: 'info', text: '该物料已投入待运行节点；可先撤回本次投料。'};
    if (node === t.node) return {ok: true, type: 'info', text: '物料仍在原位，可拖到接收节点。'};
    const o = need(g, tokenId), destination = data().nodes.find(n => n.id === node);
    if (!o || !destination) return {ok: false, type: 'info', text: '请选择地图中可接收的节点。'};
    if (node !== o.node) {
      let text;
      if (destination.kind === 'error') text = ({badFirst:'本批需要保留初漉液，弃去会使所需流股缺失。物料保留在操作前状态，请重新选择接收节点。',badUpper:'本支路按参考制法取上清或滤液，不能将沉淀替代后续主流。请回到相选择前纠正。',badShell:'内容物与囊材应分开准备，再充填成形封合；不能倒入同一囊材胶液。请恢复两路物料。'})[node];
      else if (destination.kind === 'product') text = `“${t.label}”尚未完成本目标要求的后续工艺，不能直接登记为${destination.title}。物料没有转移，请检查中间处理。`;
      else if (destination.kind === 'input') text = `“${t.label}”不能投入“${destination.title}”的原料入口，入口身份不相符。请重新核对物料。`;
      else if (t.id === 'oil' && ['per','refB','refC','extD','warm','arecaDec','waterCD','pinPrep','aPool','bPrecip','cPin','dWater','dLic','cTotal'].includes(node)) text = '处方外加芳香油不应在这个提取、醇沉或浓缩节点提前加入。请核对本制剂的溶解、增溶或混药时点。';
      else text = `“${destination.title}”不能承接这份“${t.label}”来复原${plan(g).name}的参考制法。它可能属于其他制剂或另一处理阶段；本次不转移物料，请按目标制剂核对药材分组、流股和方法。`;
      return fail(g, o.group, text, {token: tokenId, from: t.node, attemptedNode: node, expectedNode: o.node, kind: 'route'});
    }
    const from = t.node; t.node = node;
    g.trace.push({token: tokenId, from, to: node, at: now()});
    log(g, 'transfer', `${t.label}：投入${destination.title}`, {token: tokenId, from, to: node, operation: o.id});
    return {ok: true, type: 'transfer', text: missing(g, o).length ? '已接收。待所需物料集齐后再运行。' : '物料已齐，可设置方法并运行本步。', operation: o.id};
  }
  function withdraw(g, tokenId) {
    if (g.finished || g.blocked) return false;
    const t = g.tokens[tokenId];
    if (!t || t.consumed || t.node === t.origin) return false;
    log(g, 'withdraw', `${t.label}：撤回尚未执行的投料`, {from: t.node, to: t.origin});
    t.node = t.origin;
    g.trace = g.trace.filter(x => !(x.token === tokenId && x.from === t.origin));
    return true;
  }
  function run(g, id, choice) {
    if (g.finished) return {ok: false, type: 'info', text: '本批工艺已完成。'};
    if (g.blocked) return {ok: false, type: 'blocked', text: '请先关闭纠正提示，再继续。'};
    const o = operation(g, id);
    if (!o || g.done[id]) return {ok: false, type: 'info', text: '本步已归档，不重复计分。'};
    const absent = missing(g, o);
    if (absent.length) return {ok: false, type: 'waiting', text: '合流尚未齐备：' + absent.map(id => label(g, id)).join('、') + '。', missing: absent};
    if (o.config) {
      if (!Number.isInteger(choice) || choice < 0 || choice >= o.config.options.length) return {ok: false, type: 'waiting', text: '先选定本步工艺设置，再运行设备。'};
      if (choice !== o.config.answer) return fail(g, o.group, o.config.feedback[choice] + ' 本步暂停，物料未消耗；请修订工艺设置后继续。', {operation: id, kind: 'method', choice});
    }
    for (const key of o.inputs) g.tokens[key].consumed = true;
    for (const t of o.outputs) g.tokens[t.id] = {...t, node: o.node, origin: o.node, consumed: false};
    g.done[id] = {at: now(), choice: o.config ? choice : null, method: o.config ? o.config.options[choice] : o.action};
    const gr = g.groups[o.group];
    gr.submissions.push({at: now(), correct: true, value: g.done[id].method, operation: id});
    if (plan(g).groups[o.group].operations.every(key => g.done[key])) {gr.complete = true; if (gr.firstCorrect === null) gr.firstCorrect = true;}
    log(g, 'operation', `${data().nodes.find(n => n.id === o.node).title}：${g.done[id].method}`, {operation: id, group: o.group, outputs: o.outputs.map(x => x.id)});
    if (plan(g).operations.every(o => g.done[o.id])) {g.finished = now(); log(g, 'finished', `${plan(g).name}制备完成，质量待检。`);}
    return {ok: true, type: g.finished ? 'finished' : 'operation', text: g.finished ? '本批完整工艺已完成。样品以“质量待检”状态进入下一章。' : `操作已归档${o.outputs.length ? '，生成' + o.outputs.map(x => x.label).join('、') : ''}。`, outputs: o.outputs.map(x => x.id)};
  }
  function acknowledge(g) {g.blocked = null;}
  function score(g) {return g.groups.reduce((s, x, i) => s + (x.complete && x.firstCorrect ? plan(g).groups[i].points : 0), 0);}
  function progress(g) {return {complete: g.groups.filter(x => x.complete).length, total: 8, operations: Object.keys(g.done).length, operationTotal: plan(g).operations.length};}
  root.PipelineCore = {create, plan, operation, available, need, missing, ready, label, drop, withdraw, run, acknowledge, score, progress};
})(typeof window === 'undefined' ? globalThis : window);
