'use strict';
(() => {
 const prevInit=courseInitModule, prevQuestion=courseQuestion, prevAction=pharmAction, prevModal=courseModalHtml, prevCatalog=catalog;
 const lines=['解暑、化湿','理气和中','化湿和中','湿困状态下的整体功能变化'];
 const names={A:'胃肠动力调节',B:'肠道屏障保护',C:'抗菌活性评价',D:'免疫与代谢调节',E:'热应激相关损伤防护',F:'肠道炎症调节',G:'肠道菌群调节'};
 const confirmed=['0:E','1:A','2:B','3:D'];
 const explains={
 '0:E':'研究任务：观察藿香正气滴丸预处理后，运动性热射病动物的热应激相关损伤。依据：Li等，2025，doi:10.3389/fphar.2024.1534713。',
 '1:A':'研究任务：观察藿香正气提取物对腹泻型肠易激综合征模型胃肠动力异常的调节。依据：吕妍等，2011。',
 '2:B':'研究任务：观察湿困脾胃状态下的肠黏膜通透性与屏障结构。依据：黄庆芳等，2020，doi:10.19540/j.cnki.cjcmm.20200213.401。',
 '3:D':'研究任务：观察湿困状态下的免疫相关指标和代谢状态。依据：刘瑶、刘伟，2011。'};
 const intros={A:'这次研究胃肠动力。查阅文献，确定模型、实验队列和观察指标。',B:'这次研究肠道屏障。先安排比较组，再分别观察屏障的结构和功能。',C:'这次从体外抑菌筛选开始。查阅文献，找出值得继续研究的提取部位。',D:'这次研究湿困状态下的免疫和代谢变化。先选择模型，再安排观察指标。',E:'这次研究热应激相关损伤。请核对给药时间、分组和热负荷记录。',F:'这次研究肠道炎症。查阅模型、组织病理和炎症指标的记录。',G:'这次研究肠道菌群。先确定样本和测序方法，再查看群落结构与菌属变化。'};
 const isNew=m=>m?.bankVersion==='first-act-word-v1';
 courseInitModule=function(id,r){
   if(id!=='pharm'||r.modules.pharm||r.scoreScheme==='legacy')return prevInit(id,r);
   const q={id:'P-MATCH',stage:'功效与研究方向',title:'功效线索与研究方向匹配',points:5,options:[],source:'四条关联依据第一幕文稿所列的李等、吕妍等、黄庆芳等及刘瑶、刘伟研究；其他连线待核定。'};
   return r.modules.pharm={id:'pharm',bankVersion:'first-act-word-v1',cursor:0,bank:[q],answers:[],orders:[[]],beats:{},checks:{},started:new Date().toISOString(),finished:null,match:{intro:true,left:null,draft:[],first:null},context:null};
 };
 function matchView(m,review){
   const mt=m.match, a=m.answers[0], submitted=!!a;
   if(mt.intro&&!review)return courseFrame({title:'来自实验室的委托',rail:false,scene:'study',location:'实验室讨论区',speech:'桌上有藿香正气的功效线索和研究方向。查阅文献，把它们连起来，再选一条线继续研究。',content:'<article class="vn-letter"><small>TODAY’S COMMISSION</small><h1>来自实验室的委托</h1><p>从功效线索出发，<br>寻找对应的研究方向。</p></article>',next:'<button data-action="first-start">翻开任务单 ▷</button>'});
   const selected=mt.left,locked=review||!!a?.corrected;
   const controls=`<div class="first-match"><div class="first-match-title"><small>功效线索与研究方向 · 5分</small><h2>连接研究方向</h2><p>先选左侧线索，再选右侧方向；同一线索可以连接多个方向。本题计入四条已确认关联，其余连线保留待核对。</p></div><div class="first-match-grid"><div><h3>功效与研究线索</h3>${lines.map((t,i)=>`<button class="first-match-card ${selected===i?'active':''}" data-action="first-left" data-left="${i}" ${locked?'disabled':''}><i>${i+1}</i>${esc(t)}</button>`).join('')}</div><div><h3>研究方向</h3>${Object.entries(names).map(([k,t])=>`<button class="first-match-card" data-action="first-right" data-right="${k}" ${locked?'disabled':''}><i>${k}</i>${esc(t)}</button>`).join('')}</div></div><div class="first-links"><b>已连接</b>${mt.draft.length?mt.draft.map(key=>{let [n,k]=key.split(':');return `<span class="first-link ${submitted&&confirmed.includes(key)?'verified':''}">${esc(lines[+n])} → ${esc(names[k])}${locked?'':`<button data-action="first-remove" data-pair="${key}" aria-label="删除连线">×</button>`}</span>`}).join(''):'<p>选取两侧卡片后，连线会出现在这里。</p>'}</div>${submitted?`<div class="first-match-feedback"><b>已确认 ${confirmed.filter(k=>mt.draft.includes(k)).length} / 4 条关联 · 首次得分 ${a.points} / 5</b>${confirmed.filter(k=>mt.draft.includes(k)).map(k=>`<p>${esc(explains[k])}</p>`).join('')}<p>其他连线已保留，后续结合文献核定。</p></div>`:''}</div>`;
   const speech=review?'这是你保存的连线和首次得分。':a?.corrected?'选一条感兴趣的研究线，我们去查模型、实验设计和观察指标。':submitted?'已确认的关联已经写入记录。继续查阅文献，补全本次的四条关联。':'请查阅文献，将功效线索与相应的研究方向连接。';
   const next=review?'<button data-action="course-resume">回到当前剧情 ▷</button>':a?.corrected?'<button data-action="first-continue">选择研究方向 ▷</button>':'<button data-action="first-submit">提交连线 ▷</button>';
   return courseFrame({title:'功效线索与研究方向',rail:false,scene:'study',location:'实验室讨论区',speech,content:controls,next});
 }
 function directionView(){return courseFrame({title:'选择研究方向',rail:false,scene:'animal',location:'实验方案讨论台',speech:'选一条感兴趣的研究线，我们去查模型、实验设计和观察指标。',content:`<div class="vn-direction"><div class="vn-panel-caption">选择一条研究线</div><h2>你想深入哪一项研究？</h2>${Object.entries(names).map(([k,v])=>`<button class="vn-case" data-action="first-branch" data-branch="${k}"><i>${k}</i><span><b>${esc(v)}</b>${k==='C'?'<small>体外抑菌研究</small>':''}</span><em>进入 →</em></button>`).join('')}</div>`,next:'<span>在右侧选择研究方向</span>'});}
 courseQuestion=function(){const {m,i,review}=courseCurrent();if(courseModule==='pharm'&&isNew(m)){if(i===0)return matchView(m,review);if(!m.context)return directionView();}return prevQuestion();};
 courseModalHtml=function(){if(courseModal==='first-match-notes'){const m=courseRun()?.modules.pharm,a=m?.answers[0];return `<div class="vn-modal-shade"><section class="vn-modal" role="dialog" aria-modal="true" aria-label="连线记录"><header><h2>连线记录</h2><button data-action="course-close">×</button></header><p>首次得分：${a?.points??0} / 5</p><p>首次连接：${esc((a?.firstValue||[]).map(k=>{const [n,v]=k.split(':');return lines[+n]+' → '+names[v]}).join('；')||'尚未提交')}</p><p>已确认的四条关联各1.25分；其他连线保留待核对。</p><button class="btn" data-action="course-close">返回场景 →</button></section></div>`;}return prevModal();};
 catalog=function(){const html=prevCatalog(),p=profile();if(!p)return html;const runs=p.courseRuns||[];return html+`<section class="first-runs"><button class="text-button" data-action="first-new-run">新建新版课程批次 →</button>${runs.length?`<details><summary>切换已保存的课程批次</summary>${runs.map(x=>`<button class="text-button" data-action="first-switch-run" data-id="${esc(x.id)}">${esc(new Date(x.started).toLocaleString('zh-CN'))} · ${x.id===p.activeCourseId?'当前批次':x.scoreScheme==='legacy'?'历史批次':'课程批次'}</button>`).join('')}</details>`:''}<p>新批次独立计分，已保存的学习记录可以随时切换查看。</p></section>`;};
 function matchRender(){const old=document.querySelector('.first-match')?.scrollTop||0;render();const el=document.querySelector('.first-match');if(el)el.scrollTop=old;}
 pharmAction=function(act,b){
   if(act==='first-new-run'){if(profile()){courseCreate();view='catalog';render();}return true;}
   if(act==='first-switch-run'){const p=profile(),run=p?.courseRuns?.find(x=>x.id===b.dataset.id);if(run){p.activeCourseId=run.id;save();view='catalog';render();}return true;}
   const r=courseRun(),m=r?.modules.pharm;
   if(courseModule==='pharm'&&isNew(m)){
    const review=courseReview!==null, mt=m.match, a=m.answers[0], locked=review||a?.corrected;
    if(act==='course-notes'&&(courseReview??m.cursor)===0){courseModal='first-match-notes';render();return true;}
    if(act==='first-start'){mt.intro=false;save();render();return true;}
    if(act==='first-left'&&!locked){mt.left=Number(b.dataset.left);save();matchRender();return true;}
    if(act==='first-right'&&!locked){const right=b.dataset.right;if(mt.left!==null&&Object.hasOwn(names,right)){const key=mt.left+':'+right;if(!mt.draft.includes(key))mt.draft.push(key);save();matchRender();}return true;}
    if(act==='first-remove'&&!locked){mt.draft=mt.draft.filter(k=>k!==b.dataset.pair);save();matchRender();return true;}
    if(act==='first-submit'&&!locked){const hits=confirmed.filter(k=>mt.draft.includes(k)).length;let answer=m.answers[0];if(!answer){answer={points:hits*1.25,firstCorrect:hits>0,firstValue:[...mt.draft],corrected:false,submissions:[]};m.answers[0]=answer;mt.first=[...mt.draft];}answer.lastValue=[...mt.draft];answer.corrected=hits===4;answer.submissions.push({value:[...mt.draft],correct:hits===4,at:new Date().toISOString()});save();matchRender();return true;}
    if(act==='first-continue'&&a?.corrected&&!review){m.cursor=1;courseReview=null;save();render();return true;}
    if(act==='first-branch'&&a?.corrected&&!review&&!m.context&&Object.hasOwn(names,b.dataset.branch)){
      const key=b.dataset.branch;m.context=key;m.directionName=names[key];r.chapterContexts??={};r.chapterContexts.pharm=key;
      const qs=structuredClone(window.FIRST_ACT_DATA[key]).map((q,i)=>({...q,points:q.originalPoints,lead:'研究记录放到了桌上。',talk:intros[key]}));m.bank.push(...qs);m.orders.push(...qs.map(q=>shuffledIndices(q.options.length)));m.beats[1]=1;m.beats[2]=2;m.beats[3]=2;save();render();return true;
    }
   }
   return prevAction(act,b);
 };
})();
