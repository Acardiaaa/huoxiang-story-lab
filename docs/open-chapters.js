'use strict';
(() => {
  const originalSection = courseSection, originalInit = courseInitModule, originalQuestion = courseQuestion, originalEnd = courseEnd, originalAction = pharmAction;
  const spectrum = {id:'spectrum',chapter:2,name:'物质基础研究（谱效关系）',short:'谱效关系',art:'spectrum',max:0,intro:'观察文献图谱与分部位抑菌结果，寻找可交接的有效部位。'};
  const q = (id,stage,title,options,answer,why,figure) => ({id,stage,title,options,answer,why,figure,points:0,scene:'analysis',lead:'分析室中，秦老师递来一份研究记录。',talk:'“先看清样品和证据，再决定下一步。”',source:id==='SP-01'?'张洪坤等，中草药，2012；李焕丹等，中国医院药学杂志，2013。':+id.slice(3,5)<=4?'张洪坤等，藿香正气水抑菌作用药效物质基础及质量控制方法研究，中草药，2012，43(7):1349—1354。':'李焕丹等，藿香正气水抑菌作用化学成分的初步研究，中国医院药学杂志，2013，33(8):663—666，doi:10.13286/j.cnki.chinhosppharmacyj.2013.08.011。'});
  const fig=(n,caption)=>({url:'assets/spectrum-paper-'+n+'.png',caption});
  const spectrumBank=[
    q('SP-01','研究目标','课题组已有抑菌线索，需要交付一个可以继续研究的部位。你准备如何确定研究目标？',['追踪含量最高的单体','寻找体外抗金黄色葡萄球菌活性部位','先选择制备最方便的部位'],1,['含量较高不等于抑菌贡献最高，单体也不等同于分离部位。','以明确的效应方向寻找有比较证据支持的部位。','工艺方便与是否具有活性是不同判断。']),
    q('SP-02','观察指纹谱图','观察文献图1。图中的多条曲线对应什么样品？',['同一批样品的不同时间点','11批给药后肠道内容物的两组图谱','11种已经证实有效的纯化合物'],1,['这些曲线对应不同批次，而不是同一批的时间序列。','文献展示11批给药后肠道内容物的高、低极性分析图谱。','指纹峰是化学特征，不直接等同于已证实有效的纯品。'],fig(1,'文献[1]图1：11批给药后肠道内容物指纹图谱；A、B为不同极性分析。')),
    q('SP-03','配对化学与药效','要研究批次间化学特征与抑菌表现的关系，应怎样整理数据？',['按同一批次配对峰面积与抑菌数据','按抑菌结果排序后对应原顺序图谱','将重复测量作为新的独立批次'],0,['应保持样品身份一致，按批次配对化学和药效数据。','独立排序会破坏原有的批次对应关系。','重复测量不能自动增加独立化学样本数。']),
    q('SP-04','从相关峰到部位','文献中26号峰与抑菌效应有较强相关线索，并结合对照品指认为和厚朴酚。研究目标是交付有效部位，下一步应做什么？',['将26号峰直接命名为部位','分离不同部位并平行比较活性','将相关系数直接换算为部位贡献率'],1,['峰是化学特征，不是实际分离获得的混合部位。','相关分析可提出候选线索，还需实际分离并比较不同部位活性。','相关系数与药效贡献率不能直接互换。'],fig(2,'文献[1]图2：混合对照品与给药后样品的指纹图谱。')),
    q('SP-05','分离与登记','现在换用另一篇文献的自制藿香正气水样品，依次用石油醚、氯仿、醋酸乙酯、正丁醇萃取。为了比较活性，怎样处理各组分？',['只保留推测含和厚朴酚的部位','各有机萃取部位与剩余水层分别登记','将各萃取液重新混合'],1,['推测分布无法替代不同部位的平行活性比较。','分别收集、回收溶剂并登记各部位，同时保留水层用于比较。','重新混合会失去不同部位之间的比较信息。']),
    q('SP-06','比较部位活性','结合文献[2]的原图及结果，哪一份样品适合优先保留用于后续研究？',['石油醚萃取部位，同时记录水层也有作用','石油醚溶剂本身','仅保留和厚朴酚纯品'],0,['文献报告石油醚层抑菌圈最大，水层亦有作用；结论限于该体外实验。','有效部位是回收溶剂后获得的混合组分，不是溶剂本身。','单体可以作为物质基础线索，但不能替代本章需交付的部位。'],fig(3,'文献[2]图1：不同萃取部位的抑菌实验结果。')),
    q('SP-07','回看成分证据','文献[2]鉴定10个化合物，其中8个进行了单体活性筛选。结合原图，哪些表述适合补充部位档案？',['鉴定出的10个化合物均已证明有效','和厚朴酚活性结果可补充解释物质基础','单体有作用说明其余成分均可删除'],1,['鉴定和完成活性筛选不是同一件事，实际筛选范围需按原文核对。','和厚朴酚的单体结果可作为成分线索；两项研究样品和数据仍应分别记录。','单体结果不能排除其他成分的作用或相互影响。'],fig(4,'文献[2]图2：单体抑菌实验；筛选范围以原文为准。')),
    q('SP-08','交接有效部位','完成记录时，应该交付什么成果？',['相关色谱峰清单','和厚朴酚纯品','石油醚萃取部位及证据档案'],2,['相关峰可入档，但不能代替实际部位样品。','单体线索不能替代需要交接的混合部位。','交付石油醚萃取部位，记录分离来源、体外抑菌证据与水层结果。'])
  ];
  courseSection = id => originalSection(id);
  courseUnlocked = () => true;
  const labels={W:'藿香正气水',O:'藿香正气口服液',D:'藿香正气滴丸',C:'藿香正气软胶囊'};
  const directions={A:'胃肠动力调节',B:'肠道屏障保护',C:'抗菌活性评价',D:'免疫与代谢调节',E:'热应激相关损伤防护',F:'肠道炎症调节',G:'肠道菌群调节'};
  function bankFor(id,context) {
    const all=window.TEACHING_DATA[id]||[];
    const include=x=>{
      if(id==='quality') return x.id.startsWith('Q-'+context+'-')||x.id==='Q-05';
      if(id==='mechanism') return x.id==='M-01'||x.id==='M-02'||x.id.startsWith('M-'+context+'-');
      if(id==='indication') return ['I-01','I-02','I-04','I-'+context+'-03'].includes(x.id);
      if(id==='safety') return /^S-0[1-6]$/.test(x.id)||x.id==='S-'+context+'-07';
      return false;
    };
    return all.filter(include);
  }
  courseInitModule = function(id,r) {
    if(r.modules[id]) return r.modules[id];
    if(!['spectrum','quality','mechanism','indication','safety'].includes(id)) return originalInit(id,r);
    r.chapterContexts??={};
    if(id==='mechanism'&&!r.chapterContexts[id]&&r.modules.pharm?.finished&&r.chapterContexts.pharm)r.chapterContexts[id]=r.chapterContexts.pharm;
    if(['quality','indication','safety'].includes(id)&&!r.chapterContexts[id]&&r.modules.process?.finished&&r.route)r.chapterContexts[id]=r.route;
    const context=r.chapterContexts[id];
    if(id!=='spectrum'&&!context)return null;
    const bank=structuredClone(id==='spectrum'?spectrumBank:bankFor(id,context));
    if(!bank.length)return null;
    if(id==='spectrum'&&r.scoreScheme!=='legacy')bank.forEach((x,i)=>{x.points=[2,2,2,2,2,3,2,3][i];});
    const words={quality:'把制剂和批记录放到检验台。查阅对应的药典专论，确定检验方法和本批结果。',mechanism:'回到你选的研究方向，查阅文献，找出药效涉及的作用环节和通路。',indication:'把药典主治、研究对象和制剂资料放在一起，为这份研究确定适用范围。',safety:'我们收到一份用药后的追访记录。先核对药品和时间线，再判断报告和后续调查。'};
    const spectrumTalk=['这里有藿香正气水的抑菌研究资料。先看谱图，再比较分离得到的部位。','看看这组图谱，确认样品的来源。','按批次整理峰面积和抑菌记录，完成配对。','找到了成分线索，接下来安排部位研究。','接下来查阅另一项分离研究，样品是自制藿香正气水。','把各部位送到药效台，比较它们的抑菌作用。','部位的活性结果已经记录，再看看鉴定了哪些成分。','把部位和证据带回任务桌，完成交接。'];
    if(id==='spectrum')bank.forEach((x,i)=>{x.talk=spectrumTalk[i];});else bank[0].talk=words[id];
    const beats={};bank.forEach((x,i)=>{beats[i]=id==='spectrum'||i===0?1:2;});
    return r.modules[id]={id,bankVersion:'20261029-open-chapters-v1',context:context||null,cursor:0,bank,answers:[],orders:bank.map(x=>shuffledIndices(x.options.length)),beats,checks:{},started:new Date().toISOString(),finished:null};
  };
  courseOpen = function(id) {
    if(!courseSection(id))return;
    if(!profile()){coursePending=id;register('catalog');return;}
    const r=courseRun()||courseCreate();courseModule=id;courseReview=null;courseModal=null;
    courseInitModule(id,r);view='course';save();render();window.scrollTo(0,0);
  };
  function contextPage(r) {
    const mechanism=courseModule==='mechanism', values=mechanism?directions:labels;
    const prompt=mechanism?'选择本章要研究的药理方向':'选择本章参考的制剂';
    const guidance=mechanism?'七个方向均可独立进入。选择后展开对应文献中的机制或通路线索。':'即使尚未完成工艺，也可以选择一种制剂开展本章研习；这不会改变工艺批次。';
    return courseFrame({title:prompt,rail:false,scene:courseModule,location:'本章研习准备',speech:'“'+guidance+'”',content:`<div class="vn-direction"><div class="vn-panel-caption">独立选择 · 不计分</div><h2>${prompt}</h2>${Object.entries(values).map(([k,v],i)=>`<button class="vn-case" data-action="chapter-context" data-context="${k}"><i>0${i+1}</i><span><b>${esc(v)}</b>${!mechanism&&r.route===k?'<small>工艺章节已选目标</small>':''}</span><em>进入 →</em></button>`).join('')}<p>${guidance} 开始后本章选择与答题记录会保存在本机。</p></div>`,next:'<span>在右侧选择本章参考方向</span>'});
  }
  courseQuestion = function() {
    const r=courseRun(),m=r?.modules[courseModule];
    if(r&&!m&&['quality','mechanism','indication','safety'].includes(courseModule))return contextPage(r);
    let html=originalQuestion();
    if(courseModule==='spectrum'&&r?.scoreScheme==='legacy')html=html.replace(' · 0 分',' · 非计分练习');
    return html;
  };
  courseEnd = function(r,m) {
    if(m.id!=='spectrum')return originalEnd(r,m);
    return courseFrame({title:'有效部位交接',scene:'analysis',speech:'“部位已经找到。记得把研究样品、效应范围和不同研究的证据分别留在档案里。”',content:`<article class="vn-letter vn-ending"><small>CHAPTER COMPLETE</small><h1>有效部位交接</h1><p>藿香正气水石油醚萃取部位</p><p>文献中的抗金黄色葡萄球菌体外活性部位之一。水层亦有活性；不同研究的样品与数据应分别归档。</p><p>${r.scoreScheme==='legacy'?'本批次为非计分练习。':'本章得分：'+courseModuleScore(m)+' / 18。'}</p><div class="vn-end-buttons"><button data-action="course-replay">回看本章 →</button><button data-action="course-open" data-module="process">进入提取工艺 →</button><button data-action="home">回到研习目录 →</button></div></article>`,next:'<button data-action="home">回到目录 ▷</button>'});
  };
  pharmAction = function(act,b) {
    if(act==='chapter-context') {
      const r=courseRun(),v=b.dataset.context,allowed=courseModule==='mechanism'?directions:labels;
      if(r&&Object.hasOwn(allowed,v)&&['quality','mechanism','indication','safety'].includes(courseModule)&&!r.modules[courseModule]){
        r.chapterContexts??={};r.chapterContexts[courseModule]=v;courseInitModule(courseModule,r);save();render();
      }
      return true;
    }
    return originalAction(act,b);
  };
})();
