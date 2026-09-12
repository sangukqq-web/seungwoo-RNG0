// XP, achievements, rewards, and daily claims.
function xpRewardForRarity(r){
  if(r==='X') return 10000;
  if(r==='GOD') return 10000;
  if(['Legendary','S','SS','SSS','SSS+'].includes(r)) return 2000;
  return 500;
}
function grantBattleXp(c,amount){
  if(!c||!amount||c.rarity==='SECRET')return;
  const prev=getCardLevel(c), maxLv=getMaxLevel(c); if(prev>=maxLv)return;
  state.xp[c.id]=(state.xp[c.id]||0)+amount; let leveled=false;
  while(getCardLevel(c)<maxLv){const lvl=getCardLevel(c);const need=c.fixedXp|| (500+(lvl*200));if(state.xp[c.id]<need)break;state.xp[c.id]-=need;state.levels[c.id]=lvl+1;leveled=true;}
  if(getCardLevel(c)>=maxLv)state.xp[c.id]=0; save();
  if(leveled){const now=getCardLevel(c);setTimeout(()=>alert(`🎉 ${c.name} 레벨업! Lv.${prev} → Lv.${now}`),120);}
}

function duplicateReward(c){
 const map={C:10,COMMON:20,UNCOMMON:30,RARE:50,EPIC:80,Legendary:150,SS:180,SSS:250,'SSS+':350,X:500};
 return map[c.rarity]||20;
}
const achievements=[
 {id:'first_pull',name:'첫 뽑기',desc:'카드를 1장 뽑기',need:()=>state.stats.pulls>=1,reward:100},
 {id:'ten_pulls',name:'초보 수집가',desc:'카드를 10장 뽑기',need:()=>state.stats.pulls>=10,reward:300},
 {id:'first_win',name:'첫 승리',desc:'일반 배틀에서 1회 승리',need:()=>state.stats.wins>=1,reward:150},
 {id:'ten_wins',name:'배틀 중독',desc:'일반 배틀 10회 승리',need:()=>state.stats.wins>=10,reward:500},
 {id:'boss_win',name:'보스 격파',desc:'주지태 보스전 1회 승리',need:()=>state.stats.bossWins>=1,reward:1000},
 {id:'collector',name:'도감 수집가',desc:'카드 15종 이상 보유',need:()=>Object.keys(state.owned).filter(k=>state.owned[k]>0).length>=15,reward:700}
];
function checkGodQuest(){
  const jun=getCardById('junseongX');
  const ready=!state.godUnlocked && state.stats.jujitaeBossWins>=100 && getCardLevel(jun)>=50 && state.stats.godBossWins>=1;
  if(ready){ unlockGodReward(); return true; }
  return false;
}
function renderRewards(){
  checkGodQuest();
  const dailyBtn=document.getElementById('dailyBtn');
  const today=localDateKey();
  const claimed=state.dailyClaim===today;
  dailyBtn.disabled=claimed;
  dailyBtn.textContent=claimed?'✅ 오늘 보상 수령 완료':'오늘의 보상 받기';
  document.getElementById('achievementList').innerHTML=achievements.map(a=>{
    const done=!!state.achievements[a.id], ready=a.need();
    return `<div class="skill"><div class="ico">${done?'✅':ready?'🎉':'🔒'}</div><div style="flex:1"><b>${a.name}</b><span>${a.desc} · 보상 ${a.reward} 코인</span></div><button class="btn ${ready&&!done?'primary':''}" ${!ready||done?'disabled':''} onclick="claimAchievement('${a.id}')">${done?'완료':ready?'수령':'진행중'}</button></div>`;
  }).join('');

  const jun=getCardById('junseongX');
  const q1=Math.min(50,getCardLevel(jun)), q2=Math.min(100,state.stats.jujitaeBossWins), q3=Math.min(1,state.stats.godBossWins);
  const unlocked=state.godUnlocked;
  const qHtml=[
    `<div class="quest ${q1>=50?'done':''}"><div class="qicon">${q1>=50?'✅':'1'}</div><div class="qbody"><b>김준성의 레벨을 50까지 올린다</b><span>진행도 · Lv.${q1} / 50</span></div></div>`,
    `<div class="quest ${q2>=100?'done':''}"><div class="qicon">${q2>=100?'✅':'2'}</div><div class="qbody"><b>주지태를 100번 잡는다</b><span>진행도 · ${q2} / 100 승</span></div></div>`,
    `<div class="quest ${q3>=1?'done':''}"><div class="qicon">${q3>=1?'✅':'3'}</div><div class="qbody"><b>전왕 김준성 보스를 1회 잡는다</b><span>진행도 · ${q3} / 1 승</span></div></div>`
  ].join('');
  document.getElementById('godQuestList').innerHTML=qHtml + (unlocked?`<div class="quest done"><div class="qicon">👑</div><div class="qbody"><b>전왕 김준성 획득 완료</b><span>I'AM GOD · 도감에 등록되었습니다.</span></div></div>`:`<div class="trait" style="margin-top:2px"><b>보상:</b> 전왕 김준성 (GOD)</div>`);
  renderSpecialQuests();
  const jc=document.getElementById('jonggunClearCount'); if(jc) jc.textContent=state.stats.jonggunStageWins.toLocaleString();
  const rw=document.getElementById('specialQuestList'); if(rw){rw.innerHTML = (rw.innerHTML||'') + `<div class="quest ${ownedCount('kimJunggu')?'done':''}"><div class="qicon">⚔️</div><div class="qbody"><b>김준구 획득 퀘스트</b><span>월광검 김준구 Lv.${getCardLevel(cards.find(c=>c.id==='moon'))}/50 · 무기 뽑기 ${state.weaponPulls}/1</span></div></div><div class="quest ${ownedCount('weaponGeniusJunggu')?'done':''}"><div class="qicon">🔥</div><div class="qbody"><b>무기의 천재 김준구</b><span>김준구 Lv.${getCardLevel(cards.find(c=>c.id==='kimJunggu'))}/65 · 무기 ${state.weaponPulls}/20 · S+ 이상 ${state.weaponStats.sPlusOrHigher}/1 · 주지태 ${state.stats.jujitaeBossWins}/30 · 김준구 보스 ${state.junGuBossWins}/1</span></div></div><div class="quest ${ownedCount('hwarangJunggu')?'done':''}"><div class="qicon">👑</div><div class="qbody"><b>화랑검 김준구</b><span>화랑검 획득 ${state.weaponHwarangObtained?'✅':'❌'} · 종건 잡기 ${state.stats.jonggunStageWins}/1</span></div></div>`;}
  checkJunGuQuests();
}

function getCardById(id){return cards.find(c=>c.id===id)}
function localDateKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function claimDaily(){
 const today=localDateKey();
 if(state.dailyClaim===today)return;
 state.dailyClaim=today; state.coins+=200; save(); renderRewards(); playSfx('win'); alert('일일보상 +200 코인!');
}
function claimAchievement(id){
 const a=achievements.find(x=>x.id===id); if(!a||state.achievements[id]||!a.need())return;
 state.achievements[id]=true; state.coins+=a.reward; save(); renderRewards(); playSfx('win'); alert(`${a.name} 달성! +${a.reward} 코인`);
}
