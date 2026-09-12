// Awakening and special quest UI.
function renderAwakening(){
  const candidates=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>=3&&c.alwaysAwaken===undefined);
  if(!candidates.length){document.getElementById('awakeningContent').innerHTML='<div class="empty">각성 가능한 카드가 아직 없습니다.<br>같은 카드를 3장 이상 모아보세요.</div>';return;}
  document.getElementById('awakeningContent').innerHTML=candidates.map(c=>{const awakened=state.awakens[c.id]||0;return `<div class="panel" style="margin-bottom:12px"><div class="card big"><div class="img"><img decoding="async" src="${c.img}" alt="${c.name}"></div><div><div class="detail-title">${c.name}</div><div class="detail-sub r-${rarityClass(c.rarity)}">${c.rarity} · 각성 ${awakened} · Lv.${getCardLevel(c)}/${getMaxLevel(c)}</div><div class="stats"><div class="stat"><b>${getBattleHp(c)}</b><span>현재 HP</span></div><div class="stat"><b>${getBattleAtk(c)}</b><span>현재 ATK</span></div><div class="stat"><b>${getBattleDef(c)}</b><span>현재 DEF</span></div></div><div class="trait"><b>각성 효과</b><br>각성 1회마다 HP/ATK/DEF +100<br>모든 스킬 피해 +100</div><div class="buttons"><button class="btn primary" onclick="awaken('${c.id}')">✨ 각성하기 · 조각 3개</button></div></div></div></div>`}).join('');
  if(ownedCount('immortalSanguk')>0){document.getElementById('awakeningContent').innerHTML += `<div class="panel" style="margin-bottom:12px"><div class="trait"><b>불멸의 박상욱</b><br>획득 즉시 각성 1000 · 수동 각성 불가</div></div>`;}
}

function awaken(id){
  const c=cards.find(x=>x.id===id); if(!c)return;
  if(c.alwaysAwaken!==undefined){alert('이 캐릭터는 획득 즉시 각성 상태가 적용됩니다.');return;}
  if((state.fragments[id]||0)<3){alert('조각이 부족합니다.');return;}
  state.fragments[id]-=3;state.awakens[id]=(state.awakens[id]||0)+1;save();playSfx('rare');renderAwakening();openCard(id)
}

function renderSpecialQuests(){
  const el=document.getElementById('specialQuestList'); if(!el)return;
  const aDone=!!state.specialQuestClaimed.immortalChoi;
  const bDone=!!state.specialQuestClaimed.immortalSeungwoo;
  const cDone=!!state.specialQuestClaimed.shirooni;
  const dDone=!!state.specialQuestClaimed.yamasakiJonggun;
  const p1=Math.min(30,state.stats.transcendChoiDeaths);
  const p2=Math.min(3,state.stats.jujitaeBossWins);
  const p3=Math.min(10,state.stats.jujitaeBossWins);
  const p4=Math.min(50,getCardLevel(cards.find(c=>c.id==='transcendSeungwoo')));
  const jonggunLv=Math.min(50,getCardLevel(cards.find(c=>c.id==='jonggun')));
  const jonggunClears=Math.min(100,state.stats.jonggunStageWins);
  const godClears=Math.min(10,state.stats.godBossWins);
  const moonLv=Math.min(100,getCardLevel(cards.find(c=>c.id==='moon')));
  el.innerHTML=`
    <div class="quest ${aDone?'done':''}"><div class="qicon">${aDone?'✅':'A'}</div><div class="qbody"><b>불멸의 최예강 — 퀘스트 1</b><span>초월자 최예강을 사용하여 30회 사망 · ${p1} / 30</span></div></div>
    <div class="quest ${p2>=3?'done':''}"><div class="qicon">${p2>=3?'✅':'B'}</div><div class="qbody"><b>불멸의 최예강 — 퀘스트 2</b><span>주지태를 3회 처치 · ${p2} / 3</span></div></div>
    <div class="quest ${bDone?'done':''}"><div class="qicon">${bDone?'✅':'C'}</div><div class="qbody"><b>불멸의 이승우 — 퀘스트 1</b><span>주지태를 10회 처치 · ${p3} / 10</span></div></div>
    <div class="quest ${p4>=50?'done':''}"><div class="qicon">${p4>=50?'✅':'D'}</div><div class="qbody"><b>불멸의 이승우 — 퀘스트 2</b><span>초월자 이승우를 Lv.50까지 강화 · Lv.${p4} / 50</span></div></div>
    <div class="quest ${jonggunLv>=50?'done':''}"><div class="qicon">${jonggunLv>=50?'✅':'1'}</div><div class="qbody"><b>白鬼 시로오니 — 퀘스트 1</b><span>박종건을 Lv.50까지 올린다 · Lv.${jonggunLv} / 50</span></div></div>
    <div class="quest ${jonggunClears>=10&&godClears>=10?'done':''}"><div class="qicon">${jonggunClears>=10&&godClears>=10?'✅':'2'}</div><div class="qbody"><b>白鬼 시로오니 — 퀘스트 2</b><span>종건 잡기 ${jonggunClears} / 10회 · 전왕 김준성 ${godClears} / 10회</span></div></div>
    <div class="quest ${moonLv>=100?'done':''}"><div class="qicon">${moonLv>=100?'✅':'3'}</div><div class="qbody"><b>白鬼 시로오니 — 퀘스트 3</b><span>월광검 김준구를 Lv.100까지 올린다 · Lv.${moonLv} / 100</span></div></div>
    <div class="quest ${dDone?'done':''}"><div class="qicon">${dDone?'✅':'4'}</div><div class="qbody"><b>백귀 야마자키 종건 — 퀘스트 1</b><span>종건 잡기 스테이지를 100회 클리어한다 · ${jonggunClears} / 100</span></div></div>
    ${cDone?'<div class="trait"><b>보상 수령 완료</b> · 白鬼 시로오니 (X)</div>':''}
    ${dDone?'<div class="trait"><b>보상 수령 완료</b> · 백귀 야마자키 종건</div>':''}`;
}
let battleSelectorKey='';
