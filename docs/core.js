(function(root){
  'use strict';
  function createNode(node){return {id:node.id,phase:0,selected:[null,null,null],correct:[false,false,false],firstAnswers:{device:null,process:null,record:null},errors:[],records:{object:'',observation:''},elapsed:0,runStatus:'idle',completed:false,score:null};}
  function limits(node){return {device:2,process:node.points-4,record:2};}
  function answer(progress,node,part,isCorrect,code,detail){
    if(progress.completed||!Object.hasOwn(limits(node),part))return {first:false,earned:0};
    const first=progress.firstAnswers[part]===null;
    if(first)progress.firstAnswers[part]=Boolean(isCorrect);
    if(!isCorrect&&!progress.errors.some(e=>e.part===part&&e.code===code))progress.errors.push({part,code,detail,firstSubmission:first,time:new Date().toISOString(),corrected:false});
    if(isCorrect)progress.errors.filter(e=>e.part===part).forEach(e=>e.corrected=true);
    return {first,earned:progress.firstAnswers[part]?limits(node)[part]:0};
  }
  function earned(progress,node){return Object.entries(limits(node)).reduce((sum,[part,points])=>sum+(progress.firstAnswers?.[part]===true?points:0),0);}
  function available(progress,node){return Object.entries(limits(node)).reduce((sum,[part,points])=>sum+(progress.firstAnswers?.[part]!==false?points:0),0);}
  function canFinish(p){return p.correct.every(Boolean)&&p.elapsed>=100&&p.records.object.trim().length>=4&&p.records.observation.trim().length>=4;}
  function finish(p,n){if(p.completed)return p.score;if(!canFinish(p))throw new Error('请先纠正选择，完成记录与演示。');p.score=earned(p,n);p.completed=true;p.runStatus='done';return p.score;}
  function totals(a){const completed=a.nodes.filter(n=>n.completed);return {score:completed.reduce((sum,n)=>sum+(n.score||0),0),completed:completed.length,progress:Math.round(completed.length/a.nodes.length*100),unearnedItems:a.nodes.reduce((sum,n)=>sum+Object.values(n.firstAnswers||{}).filter(x=>x===false).length,0),corrections:a.nodes.reduce((sum,n)=>sum+n.errors.length,0)};}
  function inferRoute(extraction,forming){return ({'percolation:ethanol-liquid':'W','split-distillation:aqueous-liquid':'O','split-extraction:melt-drop':'D','split-extraction:soft-shell':'C'})[extraction+':'+forming]||null;}
  const api={createNode,limits,answer,earned,available,canFinish,finish,totals,inferRoute};root.LabCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
