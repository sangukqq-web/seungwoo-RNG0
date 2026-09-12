// Battle engine, bosses, damage, and victory handling.
function renderBattleSelector(force=false){
 const grid=document.getElementById('battleCharacterGrid');
 if(!grid)return;
 const candidates=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0);
 const key=candidates.map(c=>c.id).join('|');
 if(force||grid.dataset.key!==key){
   grid.dataset.key=key;
   if(!candidates.length){
     grid.innerHTML='<div class="empty" style="grid-column:1/-1;padding:18px">획득한 캐릭터가 없습니다.</div>';
     document.getElementById('battleSelectedName').textContent='사용 가능한 캐릭터 없음';
     return;
   }
   grid.innerHTML=candidates.map(c=>`<button class="battle-character" data-battle-id="${c.id}" type="button" onclick="selectBattleCharacter('${c.id}')">
     <img decoding="async" src="${c.img}" alt="${c.name}" loading="lazy">
     <div class="bc-meta">
       <div class="bc-name">${c.name}</div>
       <div class="bc-rarity r-${rarityClass(c.rarity)}">${c.rarity}</div>
       <div class="bc-hp">HP</div>
     </div>
   </button>`).join('');
 }
 const current=state.selectedId?cards.find(c=>c.id===state.selectedId):null;
 const nameEl=document.getElementById('battleSelectedName');
 if(nameEl)nameEl.textContent=current?`현재 선택 · ${current.name}`:'캐릭터를 선택하세요';
 grid.querySelectorAll('[data-battle-id]').forEach(btn=>{
   const c=cards.find(x=>x.id===btn.dataset.battleId); if(!c)return;
   const hp=getPersistentHp(c), max=getBattleHp(c), disabled=hp<=0, active=current&&current.id===c.id;
   btn.classList.toggle('active',!!active); btn.classList.toggle('disabled',disabled); btn.disabled=disabled;
   let badge=btn.querySelector('.bc-check');
   if(active&&!badge){badge=document.createElement('span');badge.className='bc-check';badge.textContent='사용 중';btn.prepend(badge);}
   if(!active&&badge)badge.remove();
   const hpEl=btn.querySelector('.bc-hp'); if(hpEl)hpEl.textContent=`HP ${hp.toLocaleString()} / ${max.toLocaleString()}`;
 });
}
function selectBattleCharacter(id){
  const c=cards.find(x=>x.id===id);
  if(!c||!ownedCount(id)||c.rarity==='SECRET'||getPersistentHp(c)<=0)return;
  if(!battleOver && playerHp>0){alert('현재 캐릭터가 쓰러진 뒤 다른 캐릭터로 이어서 싸울 수 있습니다.');return;}
  if(battleOver && playerHp<=0 && enemyHp>0){continueBattleWithCharacter(id);return;}
  state.selectedId=id; playerCard=c;
  if(bossMode){
    if(jonggunBossMode){ loadJonggunPage(jonggunPage||1); }
    else if(godBossMode){
      const base=cards.find(x=>x.id==='godJunseong'); enemyCard={...base,name:'전왕 김준성 · 보스',rarity:'GOD BOSS'}; initBattleStats(true); playerSealTurns=3;
    }else{
      const base=cards.find(x=>x.id==='jujitae'); enemyCard={...base,name:'주지태 · 보스',hp:10000,atk:3000,def:5000,rarity:'X',trait:'두려움 — 자신의 HP가 1이라도 깎일 시 스킬 데미지 2배',skills:[['레프트 훅',4000,0],['플라잉 암바',6000,2],['인사이드 힐훅',8000,4]]}; initBattleStats(true);
    }
  }else{
    const options=opponentPoolFor(playerCard); enemyCard=options[Math.floor(Math.random()*options.length)]||cards.find(x=>x.id!=='immortalSanguk'&&x.id!=='transcendSanguk'&&x.id!==playerCard.id&&x.rarity!=='SECRET'); initBattleStats(false);
  }
  document.getElementById('battleLog').innerHTML=''; appendLog(`⚔️ ${c.name} 선택! ${bossMode?(jonggunBossMode?'종건 잡기':(godBossMode?'전왕 김준성 보스전':'주지태 보스전')):'새 배틀'}을 시작합니다.`); save(); renderBattle();
}

function continueBattleWithCharacter(id){
  const c=cards.find(x=>x.id===id);
  if(!c||!ownedCount(id)||getPersistentHp(c)<=0||enemyHp<=0)return;
  const preservedEnemyHp=enemyHp, preservedTurn=turn, preservedSeal=playerSealTurns;
  playerCard=c; state.selectedId=id; resetEntryTraits(c);
  playerBattleAtk=getBattleAtk(c); playerBattleDef=getBattleDef(c); playerBattleMaxHp=getBattleHp(c); playerHp=Math.min(getPersistentHp(c),playerBattleMaxHp);
  enemyHp=preservedEnemyHp; turn=preservedTurn; playerSealTurns=preservedSeal; battleOver=false;
  if(c.id==='shinSeungwoo') applyShinGamble();
  if(c.id==='immortalSeungwoo' && getBattleAtk(enemyCard)>getBattleAtk(c)) playerHp=Math.min(playerBattleMaxHp,playerHp+2000);
  if(c.id==='immortalSanguk') playerImmortalSangukSealTurns=10;
  if(c.jungu) playerSealTurns=c.id==='hwarangJunggu'?5:1;
  playerHwarangResurrectUsed=false; playerJungguRevivesLeft=3;
  save(); appendLog(`🔄 ${c.name} 등장! 상대 HP ${Math.max(0,Math.floor(enemyHp)).toLocaleString()} 상태에서 전투를 계속합니다.`); playSfx('rare'); renderBattle();
}

function endNoSkillTurn(){
  if(battleOver || !playerCard || !isSpecialNoSkill(playerCard)) return;
  playerActionsThisTurn=1; enemyTurn();
}
function reviveWithJuwan(id){
  if(!battleOver||playerHp>0||enemyHp<=0||playerCard?.id!=='transcendJuwan')return;
  const c=cards.find(x=>x.id===id); if(!c||!ownedCount(id)||getPersistentHp(c)>0)return;
  state.currentHp[id]=getBattleHp(c); playerCard=c; state.selectedId=id;
  resetEntryTraits(c); playerBattleAtk=getBattleAtk(c); playerBattleDef=getBattleDef(c); playerBattleMaxHp=getBattleHp(c); playerHp=playerBattleMaxHp;
  battleOver=false; appendLog(`♻️ 초월자 김주완이 ${c.name}을(를) 부활시켰습니다. 김주완은 사망했습니다.`); save(); renderBattle();
}
function applyShinGamble(){
  const success=Math.random()<.5, mult=success?2:.5;
  playerBattleAtk=Math.max(1,Math.floor(playerBattleAtk*mult)); playerBattleDef=Math.max(1,Math.floor(playerBattleDef*mult)); playerBattleMaxHp=Math.max(1,Math.floor(playerBattleMaxHp*mult)); playerHp=Math.min(playerHp,playerBattleMaxHp);
  appendLog(`${success?'🎲 도박 성공!':'🎲 도박 실패!'} 전투 능력치가 ${success?'2배':'절반'}로 적용됩니다.`);
}
function maybeTriggerPassiveOnEntry(c){
  if(c.id==='shinSeungwoo') applyShinGamble();
  if(c.id==='immortalSeungwoo' && getBattleAtk(enemyCard)>getBattleAtk(c)) playerHp=Math.min(playerBattleMaxHp,playerHp+2000);
}
function setupBattle(){
  bossMode=false; godBossMode=false; jonggunBossMode=false; junGuBossMode=false; jonggunPage=0;
  const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0&&getPersistentHp(c)>0);
  if(!owned.length){alert('사용 가능한 캐릭터가 없습니다. HP를 회복하거나 다른 캐릭터를 획득하세요.');go('collection');return;}
  if(state.selectedId&&ownedCount(state.selectedId)>0&&getPersistentHp(cards.find(c=>c.id===state.selectedId))>0) playerCard=cards.find(c=>c.id===state.selectedId); else {playerCard=owned[0];state.selectedId=playerCard.id;save();}
  const options=opponentPoolFor(playerCard); enemyCard=options[Math.floor(Math.random()*options.length)]||cards.find(c=>c.id!==playerCard.id&&c.rarity!=='SECRET'&&!c.noOpponent);
  initBattleStats(false); document.getElementById('battleLog').innerHTML=''; renderBattle(true);
}

function startBossBattle(){
  bossMode=true; godBossMode=false; jonggunBossMode=false; junGuBossMode=false; jonggunPage=0;
  const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0&&getPersistentHp(c)>0);
  if(!owned.length){alert('사용 가능한 캐릭터가 없습니다.');go('collection');return;}
  if(state.selectedId&&ownedCount(state.selectedId)>0&&getPersistentHp(cards.find(c=>c.id===state.selectedId))>0) playerCard=cards.find(c=>c.id===state.selectedId); else {playerCard=owned[0];state.selectedId=playerCard.id;save();}
  const base=cards.find(c=>c.id==='jujitae'); enemyCard={...base,name:'주지태 · 보스',hp:10000,atk:3000,def:5000,rarity:'X',trait:'두려움 — 자신의 HP가 1이라도 깎일 시 스킬 데미지 2배',skills:[['레프트 훅',4000,0],['플라잉 암바',6000,2],['인사이드 힐훅',8000,4]]};
  initBattleStats(true); document.getElementById('battleLog').innerHTML=''; go('battle'); renderBattle(true); appendLog('👹 주지태 보스전 시작! HP 10,000 · 승리 시 +1,000 코인 · 10,000 EXP');
}

function setupJonggunPage(page){
  const defs={
    1:{id:'jonggun',name:'박종건 · PAGE 1',rarity:'SSS+',img:'assets/jonggun_park.png',hp:20000,atk:20000,def:10000,trait:'경지 (힘, 맷집) — 공격 ×2 · HP ×2',skills:[['정권지르기',6000,0],['정권지르기 5연',9000,2]]},
    2:{id:'shirooni',name:'白鬼 시로오니 · PAGE 2',rarity:'X',img:'assets/jonggun_shirooni.png',hp:30000,atk:30000,def:30000,trait:'흑골 — 상대 공격을 3회 무시함.',trait2:'자신만의길 (신체) — 사망했을시 부활하고 모든 능력치 + 5000',skills:[['정권지르기 10연',8000,0],['바디훅',12000,2],['키신세이켄 17연',17000,4]]},
    3:{id:'yamasakiJonggun',name:'백귀 야마자키 종건 · PAGE 3',rarity:'GOD',img:'assets/jonggun_yamasaki.png',hp:100000,atk:100000,def:100000,trait:'무의식 — HP, ATK, DEF 수치를 모두 100000까지 올린다.',trait2:'죽일각오 — 자신이 사망하면 상대 캐릭터도 사망한다.',trait3:'자신만의길 (신체) — 사망했을시 부활하고 모든 능력치 + 5000',trait4:'흑골 — 상대 공격 3회 무시 · 경지 — 상대 공격 3회 회피',skills:[['키신세이켄 81연',30000,0],['정권지르기',45000,2],['아이키도',0,4]]}
  };
  return defs[page];
}
function loadJonggunPage(page, revived=false){
  jonggunPage=page;
  const d=setupJonggunPage(page);
  enemyCard={...d};
  if(revived){ enemyCard.hp+=5000; enemyCard.atk+=5000; enemyCard.def+=5000; if(page===3){enemyCard.hp=Math.min(100000,enemyCard.hp);enemyCard.atk=Math.min(100000,enemyCard.atk);enemyCard.def=Math.min(100000,enemyCard.def);} }
  enemyHp=enemyCard.hp;
  jonggunBlackBoneLeft=(page>=2)?3:0;
  jonggunDodgeLeft=(page===3)?3:0;
  jonggunLastPlayerDamage=0;
  battleOver=false;
  playerActionsThisTurn=0;
  renderBattle();
}
function startJonggunBossBattle(){
  bossMode=true; godBossMode=false; jonggunBossMode=true; junGuBossMode=false; jonggunPage=1; jonggunWhiteReviveUsed=false; jonggunYamazakiReviveUsed=false;
  const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0&&getPersistentHp(c)>0);
  if(!owned.length){alert('사용 가능한 캐릭터가 없습니다.');go('collection');return;}
  if(state.selectedId&&ownedCount(state.selectedId)>0&&getPersistentHp(cards.find(c=>c.id===state.selectedId))>0) playerCard=cards.find(c=>c.id===state.selectedId); else {playerCard=owned[0];state.selectedId=playerCard.id;save();}
  resetEntryTraits(playerCard); playerBattleAtk=getBattleAtk(playerCard); playerBattleDef=getBattleDef(playerCard); playerBattleMaxHp=getBattleHp(playerCard); playerHp=Math.min(getPersistentHp(playerCard),playerBattleMaxHp);
  loadJonggunPage(1);
  document.getElementById('battleLog').innerHTML=''; go('battle'); renderBattleSelector(); renderBattle(); appendLog('👹 종건 잡기 시작! PAGE 1 · 박종건');
}
function finishJonggunPage(){
  const defeatedPage=jonggunPage;
  battleOver=true;
  if(defeatedPage===2 && !jonggunWhiteReviveUsed){
    jonggunWhiteReviveUsed=true;
    appendLog('♻️ 白鬼 시로오니의 자신만의길! 부활하며 모든 능력치 +5,000.');
    loadJonggunPage(2,true);
    return;
  }
  if(defeatedPage===3 && !jonggunYamasakiReviveUsed){
    jonggunYamasakiReviveUsed=true;
    appendLog('♻️ 백귀 야마자키 종건의 자신만의길! 부활을 발동합니다.');
    loadJonggunPage(3,true);
    return;
  }
  if(defeatedPage<3){
    appendLog(`🔥 PAGE ${defeatedPage} 클리어! ${defeatedPage+1}페이지로 진입합니다.`);
    loadJonggunPage(defeatedPage+1);
    return;
  }
  if(enemyCard.id==='yamasakiJonggun'){
    // 죽일각오: 마지막 페이지가 쓰러질 때 현재 캐릭터도 함께 쓰러짐.
    playerHp=0; state.currentHp[playerCard.id]=0;
  }
  state.stats.jonggunStageWins++;
  let firstReward=false;
  if(!state.specialQuestClaimed.jonggunBossReward && ownedCount('jonggun')===0){
    state.specialQuestClaimed.jonggunBossReward=true;
    grantCharacter('jonggun');
    firstReward=true;
  }
  checkSpecialQuests();
  save();
  appendLog(`🏆 종건 잡기 3페이지 완전 클리어! 누적 ${state.stats.jonggunStageWins}회`);
  renderBattle(); renderCollection(); renderAwakening(); renderRewards(); playSfx('win');
  if(firstReward){setTimeout(()=>showReveal(cards.find(c=>c.id==='jonggun'),false),220);}
}

function startGodBossBattle(){
  bossMode=true; godBossMode=true; jonggunBossMode=false; junGuBossMode=false; jonggunPage=0;
  const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0&&getPersistentHp(c)>0);
  if(!owned.length){alert('사용 가능한 캐릭터가 없습니다.');go('collection');return;}
  if(state.selectedId&&ownedCount(state.selectedId)>0&&getPersistentHp(cards.find(c=>c.id===state.selectedId))>0) playerCard=cards.find(c=>c.id===state.selectedId); else {playerCard=owned[0];state.selectedId=playerCard.id;save();}
  const base=cards.find(c=>c.id==='godJunseong'); enemyCard={...base,name:'전왕 김준성 · 보스',rarity:'GOD BOSS'};
  initBattleStats(true); playerSealTurns=3; godResurrectUsed=false; document.getElementById('battleLog').innerHTML=''; go('battle'); renderBattleSelector(); renderBattle(); appendLog('👑 전왕 김준성 보스전 시작! 상대 공격 3회 봉인 · 권능 발동');
}

function initBattleStats(isBoss=false){
  resetEntryTraits(playerCard);
  applySangukAlwaysAwaken(playerCard);
  playerBattleAtk=getBattleAtk(playerCard); playerBattleDef=getBattleDef(playerCard); playerBattleMaxHp=getBattleHp(playerCard); playerHp=Math.min(getPersistentHp(playerCard),playerBattleMaxHp);
  enemyHp=isBoss?enemyCard.hp:getBattleHp(enemyCard); turn=1; battleOver=false;
  if(playerCard.id==='shinSeungwoo') applyShinGamble();
  if(playerCard.id==='immortalSeungwoo' && getBattleAtk(enemyCard)>getBattleAtk(playerCard)) playerHp=Math.min(playerBattleMaxHp,playerHp+2000);
  if(playerCard.id==='immortalSanguk') playerImmortalSangukSealTurns=10;
  if(playerCard.jungu) playerSealTurns=playerCard.id==='hwarangJunggu'?5:1;
  playerHwarangResurrectUsed=false; playerJungguRevivesLeft=3;
}

function getPlayerMaxForBattle(){return playerBattleMaxHp}
function getPlayerAtkForBattle(){return playerBattleAtk}
function getPlayerDefForBattle(){return playerBattleDef}
function updateFighterDynamicUI(el,c,hp,enemy){
  if(!el)return;
  const max=enemy?((godBossMode||junGuBossMode)?enemyCard.hp:getBattleHp(c)):getPlayerMaxForBattle();
  const safeMax=Math.max(1,max), pct=Math.max(0,Math.min(100,hp/safeMax*100));
  const hpText=el.querySelector('.hp-top b'); if(hpText)hpText.textContent=`${Math.max(0,Math.floor(hp)).toLocaleString()} / ${Math.floor(max).toLocaleString()}`;
  const fill=el.querySelector('.hpfill'); if(fill)fill.style.width=`${pct}%`;
}
function updateBattleControls(){
  const turnEl=document.getElementById('turnInfo');
  if(turnEl){const actionLimit=getActionLimit(playerCard);turnEl.textContent=battleOver?'전투 종료':(godBossMode&&playerSealTurns>0?`봉인 ${playerSealTurns}회`:(actionLimit>1?`내 턴 · ${playerActionsThisTurn}/${actionLimit}`:(bossMode?(jonggunBossMode?`종건 잡기 · PAGE ${jonggunPage}`:(godBossMode?'전왕 보스전 · 내 턴':'보스전 · 내 턴')):'내 턴')));}
  const hint=document.getElementById('battleHint');
  if(hint){const nextAvailable=cards.some(x=>x.rarity!=='SECRET'&&ownedCount(x.id)>0&&x.id!==playerCard.id&&getPersistentHp(x)>0);hint.textContent=(battleOver&&playerHp<=0&&enemyHp>0&&nextAvailable)?'캐릭터가 쓰러졌습니다. 아래에서 다음 캐릭터를 골라 전투를 이어가세요.':(battleOver?'전투가 끝났습니다. 새 상대를 눌러 다시 시작할 수 있습니다.':(bossMode?'보스전에서도 캐릭터가 쓰러지면 다른 캐릭터로 이어갈 수 있습니다.':'캐릭터가 쓰러지면 다른 캐릭터로 이어서 싸울 수 있습니다.'));}
  const playerEl=document.getElementById('playerFighter');
  if(playerEl){playerEl.querySelectorAll('.skill-btn').forEach((btn,i)=>{const unlocked=isSkillUnlocked(playerCard,i,getCardLevel(playerCard)); const sealed=godBossMode&&playerSealTurns>0; btn.disabled=battleOver||!unlocked||sealed; btn.classList.toggle('locked-skill',battleOver||!unlocked||sealed);});}
}
function renderBattle(full=true){
  if(!playerCard||!enemyCard)return;
  renderBattleSelector(false);
  const pf=document.getElementById('playerFighter'), ef=document.getElementById('enemyFighter');
  if(full||!pf?.dataset.characterId||pf.dataset.characterId!==playerCard.id){pf.innerHTML=fighterHTML(playerCard,playerHp,false);pf.dataset.characterId=playerCard.id;}
  if(full||!ef?.dataset.characterId||ef.dataset.characterId!==enemyCard.id){ef.innerHTML=fighterHTML(enemyCard,enemyHp,true);ef.dataset.characterId=enemyCard.id;}
  updateFighterDynamicUI(pf,playerCard,playerHp,false);
  updateFighterDynamicUI(ef,enemyCard,enemyHp,true);
  updateBattleControls();
  renderBattleSelector(false);
}

function fighterHTML(c,hp,enemy){
  const max=enemy?((godBossMode||junGuBossMode)?enemyCard.hp:getBattleHp(c)):getPlayerMaxForBattle();
  const safeMax=Math.max(1,max), pct=Math.max(0,Math.min(100,hp/safeMax*100)),lvl=getCardLevel(c);
  let skillsHtml='';
  if(!enemy){
    if(isSpecialNoSkill(c)){
      skillsHtml=`<div class="trait" style="margin-top:12px"><b>행동</b><br>${c.id==='immortalSanguk'?'스킬 없음 · 상대 턴 10회 봉인 및 공격 반사':c.id==='transcendJuwan'?'스킬 없음 · 사망 시 원하는 캐릭터 부활':'스킬 없음'}</div>`;
      if(!battleOver) skillsHtml+=`<div class="select-row"><button class="btn primary" onclick="endNoSkillTurn()">⏭️ 턴 넘기기</button></div>`;
    }else{
      const count=c.skills.length;
      const sealed=godBossMode&&playerSealTurns>0;
      skillsHtml=`<div class="skills-battle">${c.skills.slice(0,count).map((s,i)=>{
        const unlocked=isSkillUnlocked(c,i,lvl) && !(c.id==='hwarangJunggu'&&i===3&&!getEquippedWeaponInstances(c.id).some(w=>w.id==='hwarangSword'));
        const skillLabel=c.id==='hwarangJunggu'&&i===3&&!getEquippedWeaponInstances(c.id).some(w=>w.id==='hwarangSword')?'화랑검 장착 필요':c.id==='shinSeungwoo'&&i===2?'재도박':c.id==='godJunseong'&&i===0?'상대 1번 스킬 ×2':c.id==='slyJuwan'&&i===0?'HP+ATK+DEF':c.id==='immortalSeungwoo'&&i===2?'ATK +3000':`${getSkillDamage(c,i)} 피해`;
        return `<button class="skill-btn ${unlocked&&!sealed?'':'locked-skill'}" ${battleOver||!unlocked||sealed?'disabled':''} onclick="useSkill(${i})">${unlocked?['⚡','🔥','💀','🩸'][i]:'🔒'} ${s[0]}<br><span style="color:#8f9bbb;font-weight:700">${unlocked?skillLabel:`Lv.${skillUnlockLevel(i)} 해금`}</span></button>`;
      }).join('')}</div>`;
      if(getActionLimit(c)>1&&!battleOver&&playerActionsThisTurn>0&&playerActionsThisTurn<getActionLimit(c)){skillsHtml+=`<div class="select-row"><button class="btn" onclick="endGodTurn()">턴 종료</button></div>`;}
      if(godBossMode&&playerSealTurns>0&&!battleOver){skillsHtml+=`<div class="select-row"><button class="btn" onclick="endSealedTurn()">⛓️ 봉인 견디기 · ${playerSealTurns}회 남음</button></div>`;}
    }
  }
  if(!enemy&&battleOver&&hp<=0&&enemyHp>0){
    if(c.id==='transcendJuwan'){
      const dead=cards.filter(x=>x.id!=='transcendJuwan'&&x.rarity!=='SECRET'&&ownedCount(x.id)>0&&getPersistentHp(x)<=0);
      if(dead.length){skillsHtml+=`<div class="switch-box"><b>♻️ 영웅은 죽지 않아요</b><p>부활시킬 캐릭터를 선택하세요. 초월자 김주완은 사망합니다.</p><div class="switch-actions">${dead.map(x=>`<button class="switch-btn" type="button" onclick="reviveWithJuwan('${x.id}')"><img decoding="async" src="${x.img}" alt="${x.name}"><span class="sb-name">${x.name}</span><span class="sb-hp">부활 · HP ${getBattleHp(x).toLocaleString()}</span></button>`).join('')}</div></div>`;}
      else skillsHtml+=`<div class="switch-box"><b>💀 부활시킬 캐릭터가 없습니다.</b><p>이번 배틀은 종료됩니다.</p></div>`;
    }else{
      const next=cards.filter(x=>x.rarity!=='SECRET'&&ownedCount(x.id)>0&&x.id!==c.id&&getPersistentHp(x)>0);
      if(next.length) skillsHtml+=`<div class="switch-box"><b>💀 ${c.name} 쓰러짐</b><p>상대 HP는 그대로 유지됩니다. 다른 캐릭터를 골라 전투를 이어가세요.</p><div class="switch-actions">${next.map(x=>`<button class="switch-btn" type="button" onclick="continueBattleWithCharacter('${x.id}')"><img decoding="async" src="${x.img}" alt="${x.name}"><span class="sb-name">${x.name}</span><span class="sb-hp">HP ${getPersistentHp(x).toLocaleString()} / ${getBattleHp(x).toLocaleString()}</span></button>`).join('')}</div></div>`;
      else skillsHtml+=`<div class="switch-box"><b>💀 모든 캐릭터가 쓰러졌습니다.</b><p>이번 배틀에서 더 이상 이어서 싸울 캐릭터가 없습니다.</p></div>`;
    }
  }
  const traitHtml=`<div class="trait" style="margin-top:10px"><b>특성</b> · ${c.trait}${c.trait2?`<br><b>특성2</b> · ${c.trait2}`:''}${c.trait3?`<br><b>특성3</b> · ${c.trait3}`:''}${c.trait4?`<br><b>특성4</b> · ${c.trait4}`:''}</div>`;
  return `<div class="fighter-head"><div><div class="fighter-name">${c.name}</div><div class="battle-level">Lv.${lvl} / ${getMaxLevel(c)}</div></div><div class="rarity r-${rarityClass(c.rarity)}">${c.rarity}</div></div>
  <div class="hp-wrap"><div class="hp-top"><span>HP</span><b>${Math.max(0,Math.floor(hp)).toLocaleString()} / ${Math.floor(max).toLocaleString()}</b></div><div class="hpbar"><div class="hpfill" style="width:${pct}%"></div></div></div>
  <div class="portrait"><img decoding="async" src="${c.img}" alt="${c.name}"></div>${traitHtml}${godBossMode&&enemy?'<div class="trait" style="margin-top:8px"><b>권능</b> · 부활 · 봉인 · 권능</div>':''}${!enemy&&c.id==='transcendChoi'&&playerTranscendChoiInvulTurns>0?`<div class="trait"><b>무적</b> · ${playerTranscendChoiInvulTurns}회 남음</div>`:''}${!enemy&&c.id==='immortalChoi'&&playerImmortalChoiReflectLeft>0?`<div class="trait"><b>반사</b> · ${playerImmortalChoiReflectLeft}회 남음</div>`:''}${!enemy&&c.id==='immortalSanguk'&&playerImmortalSangukSealTurns>0?`<div class="trait"><b>속박</b> · 상대 턴 ${playerImmortalSangukSealTurns}회 봉인</div>`:''}${skillsHtml}`;
}

function useSkill(i){
  if(battleOver)return;
  if(godBossMode&&playerSealTurns>0)return;
  if(!isSkillUnlocked(playerCard,i)){alert(`이 스킬은 Lv.${skillUnlockLevel(i)}에서 해금됩니다.`);return;}
  const actionLimit=getActionLimit(playerCard);
  if(actionLimit>1&&playerActionsThisTurn>=actionLimit)return;
  const s=playerCard.skills[i]; let dmg=0; let specialAction=false;
  if(playerCard.id==='shinSeungwoo'&&i===2){
    if(playerChanceUsed){alert('찬스는 전투당 한 번만 사용할 수 있습니다.');return;}
    playerChanceUsed=true; const success=Math.random()<.5;
    if(success){playerBattleAtk=Math.max(1,playerBattleAtk*2);playerBattleDef=Math.max(1,playerBattleDef*2);dmg=5000+Math.floor(playerBattleAtk*.25)-Math.floor(getBattleDef(enemyCard)*.08);appendLog('🎲 찬스 성공! 능력치 2배 + 스킬 도박 2배!');}
    else{playerBattleAtk=Math.max(1,Math.floor(playerBattleAtk*.5));playerBattleDef=Math.max(1,Math.floor(playerBattleDef*.5));dmg=2500+Math.floor(playerBattleAtk*.25)-Math.floor(getBattleDef(enemyCard)*.08);appendLog('🎲 찬스 실패! 능력치가 절반으로 내려갔습니다.');}
  }else if(playerCard.id==='godJunseong'&&i===0){const copied=getSkillDamage(enemyCard,0);dmg=copied*2+Math.floor(playerBattleAtk*.25)-Math.floor(getBattleDef(enemyCard)*.08);}
  else if(playerCard.id==='slyJuwan'&&i===0){dmg=getBattleHp(playerCard)+getBattleAtk(playerCard)+getBattleDef(playerCard);}
  else if(playerCard.id==='immortalSeungwoo'&&i===2){playerBattleAtk+=3000;specialAction=true;appendLog('💪 운동하기! 자신의 공격력이 3,000 증가했습니다.');}
  else if(jonggunBossMode){
    // 종건 잡기에서도 김준구 계열은 일반 전투와 동일하게 무기 효과를 반영한다.
    // getSkillDamage()가 무기 미장착 상태를 0으로 처리하므로 무기 없이는 피해가 발생하지 않는다.
    dmg=getSkillDamage(playerCard,i)+Math.floor(playerBattleAtk*.25)-Math.floor(getBattleDef(enemyCard)*.08);
  }
  else {
    // 김준구 계열은 무기가 없으면 공격 자체가 0이어야 한다.
    // 이 조건을 치명타/후속 보정 전에 먼저 확정해 무기 없이 0이 아닌 피해가 나오지 않게 한다.
    if(playerCard.jungu&&!hasWeaponEquipped(playerCard)){
      dmg=0;
    }else{
      dmg=getSkillDamage(playerCard,i)+Math.floor(playerBattleAtk*.25)-Math.floor(getBattleDef(enemyCard)*.08);
    }
  }

  if(playerCard.id==='streetFighterSeungwoo'&&Math.random()<.05){playerBattleAtk=Math.floor(playerBattleAtk*1.1);appendLog('🥊 막싸움 발동! 공격력이 10% 증가했습니다.');}
  if(playerCard.id==='brainrot'&&Math.random()<.20){dmg*=2;appendLog('🌀 혼돈의 논리! 피해 2배!');}
  if(playerCard.jungu){
    if(hasWeaponEquipped(playerCard)){
      const critChance=playerCard.id==='hwarangJunggu'?1:.5;
      if(Math.random()<critChance){dmg*=2;appendLog('⚔️ 경지(기술·속도)! 2배 치명타 발동!');}
    }else{
      // 무기 미장착 상태에서는 치명타도 발동하지 않고 최종 피해를 0으로 고정한다.
      dmg=0;
    }
    // 이전 버전의 김준구 계열 턴 봉인 효과는 이미 제거했으므로 여기서는 봉인을 건드리지 않는다.
  }
  if(['meatShieldChoi','transcendChoi','immortalChoi'].includes(playerCard.id) || (playerCard.jungu&&!hasWeaponEquipped(playerCard))) dmg=Math.max(0,Math.floor(dmg)); else if(!specialAction)dmg=Math.max(30,Math.floor(dmg));
  if(jonggunBossMode && !specialAction){
    if(jonggunBlackBoneLeft>0){jonggunBlackBoneLeft--;appendLog(`🦴 흑골 발동! ${enemyCard.name}이 공격을 무시했습니다. (${jonggunBlackBoneLeft}회 남음)`);dmg=0;}
    else if(jonggunDodgeLeft>0){jonggunDodgeLeft--;appendLog(`💨 경지 발동! ${enemyCard.name}이 공격을 회피했습니다. (${jonggunDodgeLeft}회 남음)`);dmg=0;}
  }

  if(!specialAction){
    jonggunLastPlayerDamage=dmg;
    enemyHp=Math.max(0,enemyHp-dmg);
    appendLog(`내 스킬 <b>${s[0]}</b> → ${dmg.toLocaleString()} 피해`);
    playSfx('hit');
    // 공격 직후 현재 enemyHp를 즉시 화면에 반영한다.
    // 특히 한 번에 처치하는 공격은 finishPlayerVictory() 전에 0 HP가 렌더링되도록 한다.
    renderBattle(false);
  }
  if(actionLimit>1){
    playerActionsThisTurn++;
    renderBattle();
    if(enemyHp<=0){finishPlayerVictory();return;}
    if(playerActionsThisTurn<actionLimit){document.getElementById('turnInfo').textContent=`내 턴 · ${playerActionsThisTurn}/${actionLimit}`;return;}
  }
  else if(enemyHp<=0){finishPlayerVictory();return;}
  enemyTurn();
}

function endGodTurn(){
  if(battleOver||getActionLimit(playerCard)<=1||playerActionsThisTurn<1)return;
  enemyTurn();
}

function endSealedTurn(){
  if(battleOver||!godBossMode||playerSealTurns<=0)return;
  playerSealTurns--; appendLog(`⛓️ 봉인 발동. 남은 봉인 횟수: ${playerSealTurns}`); enemyTurn();
}

function finishPlayerVictory(){
  if(jonggunBossMode){ finishJonggunPage(); return; }
  battleOver=true;
  const reward=junGuBossMode?0:(bossMode?(godBossMode?3000:1000):100); state.coins+=reward;
  if(godBossMode){state.stats.godBossWins++;} else if(bossMode){state.stats.bossWins++;state.stats.jujitaeBossWins++;} else state.stats.wins++;
  state.currentHp[playerCard.id]=Math.max(0,playerHp);
  const xpMult=(state.xpBoostKills||0)>0?2:1; const baseXpGain=bossMode?10000:xpRewardForRarity(enemyCard.rarity); const xpGain=baseXpGain*xpMult; grantBattleXp(playerCard,xpGain); if((state.xpBoostKills||0)>0)state.xpBoostKills=Math.max(0,state.xpBoostKills-1); grantWeaponLoot(enemyCard.id); if(junGuBossMode){state.junGuBossWins++;if(Math.random()<0.10){addWeapon('hwarangSword');state.weaponHwarangObtained=true;appendLog('🗡️ 김준구 보스 격파 보상! 화랑검 획득!');}state.coins+=30000;grantBattleXp(playerCard,100000*xpMult);appendLog('👑 김준구 보스 보상: +30,000 코인 · +100,000 EXP');} checkJunGuQuests();
  save(); appendLog(`🏆 승리! +${reward.toLocaleString()} 코인`); appendLog(`✨ ${playerCard.name} 경험치 +${xpGain.toLocaleString()} EXP`);
  checkSpecialQuests();
  if(godBossMode && checkGodQuest()){return;}
  renderBattle();renderCollection();renderAwakening();renderRewards();playSfx('win');
}

function unlockGodReward(){
 const c=cards.find(x=>x.id==='godJunseong');
 if(!c)return false;
 if(ownedCount(c.id)>0){state.godUnlocked=true;save();return true;}
 state.godUnlocked=true;
 state.specialQuestClaimed.godJunseong=true;
 state.owned[c.id]=(state.owned[c.id]||0)+1;
 state.fragments[c.id]=(state.fragments[c.id]||0)+1;
 state.levels[c.id]=Math.max(1,state.levels[c.id]||1);
 state.xp[c.id]=0;
 state.currentHp[c.id]=getBattleHp(c);
 save();
 setTimeout(()=>{
   closeModal('revealModal');
   document.getElementById('revealContent').innerHTML=`<div class="reveal-rarity" style="color:#fff08a">GOD</div><div class="special-text" style="color:#fff08a">I'AM GOD</div><div class="reveal-name">${c.name}</div><div class="reveal-card UR"><img decoding="async" src="${c.img}" alt="${c.name}"></div><p style="color:var(--muted);margin-top:14px">특별 퀘스트 보상으로 전왕 김준성을 획득했습니다.</p>`;
   document.getElementById('revealModal').classList.add('show');
   burst(90); playSfx('rare');
 },250);
}
function enemyTurn(){
  if(battleOver)return;
  document.getElementById('turnInfo').textContent='상대 턴';
  setTimeout(()=>{
    if(battleOver)return;
    if(playerCard.id==='immortalSeungwoo'&&getBattleAtk(enemyCard)>playerBattleAtk) playerHp=Math.min(playerBattleMaxHp,playerHp+2000);
    const sealedAll=playerCard.id==='immortalSanguk'&&playerImmortalSangukSealTurns>0;
    const hitCount=(godBossMode?2:(junGuBossMode?3:1));
    for(let h=0;h<hitCount&&!battleOver;h++){
      let enemySkillIndex=Math.floor(Math.random()*Math.max(1,enemyCard.skills.length));
      let s=enemyCard.skills[enemySkillIndex];
      let baseDamage=0;
      if(sealedAll){appendLog(`⛓️ 불멸의 박상욱의 속박 권능! 상대 턴을 봉인했습니다. (${Math.max(0,playerImmortalSangukSealTurns)}회 남음)`);break;}
      const isAikido=jonggunBossMode&&enemyCard.id==='yamasakiJonggun'&&enemySkillIndex===2;
      if(godBossMode&&enemyCard.id==='godJunseong'&&enemySkillIndex===0) baseDamage=getSkillDamage(playerCard,0)*2; else if(isAikido) baseDamage=Math.max(0,jonggunLastPlayerDamage*3); else if(junGuBossMode) baseDamage=enemyCard.skills[enemySkillIndex]?.[1]||0; else baseDamage=enemyCard.skills[enemySkillIndex]?.[1]||0;
      let fearBoost=((enemyCard.id==='jujitae'&&enemyHp<enemyCard.hp)||String(state.traits?.[playerCard.id]||'').includes('두려움'))?2:1;
      const bossAtkValue=(jonggunBossMode||junGuBossMode)?enemyCard.atk:getBattleAtk(enemyCard);
      let dmg=isAikido?baseDamage:(baseDamage*fearBoost+Math.floor(bossAtkValue*.22)-Math.floor(playerBattleDef*.07)); dmg=Math.max(0,Math.floor(dmg));
      if(playerCard.id==='junseongX'&&playerDodgeLeft>0){playerDodgeLeft--;appendLog(`💨 ${playerCard.name}의 회피 발동! 공격을 확정 회피했습니다. (${playerDodgeLeft}회 남음)`);continue;}
      if(playerCard.id==='transcendChoi'&&playerTranscendChoiInvulTurns>0){appendLog(`🪳 ${playerCard.name} 무적! 상대 공격을 무시했습니다.`);continue;}
      if(playerCard.id==='immortalChoi'&&playerImmortalChoiReflectLeft>0){playerImmortalChoiReflectLeft--;enemyHp=Math.max(0,enemyHp-dmg);appendLog(`🔁 ${playerCard.name} 반사! ${dmg.toLocaleString()} 피해를 상대에게 돌려줬습니다.`);if(enemyHp<=0){finishPlayerVictory();return;}continue;}
      if(playerCard.id==='meatShieldChoi'&&!playerMeatShieldUsed&&dmg>=playerHp){playerMeatShieldUsed=true;playerHp=1;appendLog(`🛡️ ${playerCard.name}의 특성 발동! 치명타를 맞고도 HP 1로 생존했습니다.`);continue;}
      if(playerCard.id==='immortalSanguk'){enemyHp=Math.max(0,enemyHp-dmg);appendLog(`👑 지배의 권능 반사! ${dmg.toLocaleString()} 피해`);if(enemyHp<=0){finishPlayerVictory();return;}continue;}
      playerHp=Math.max(0,playerHp-dmg); appendLog(`상대 스킬 <b>${s?.[0]||'공격'}</b> → ${dmg.toLocaleString()} 피해${fearBoost===2?' ⚠️ 두려움 발동!':''}`); playSfx('hit');
    }
    if(playerCard.id==='transcendChoi'&&playerTranscendChoiInvulTurns>0)playerTranscendChoiInvulTurns--;
    if(playerCard.id==='immortalSanguk'&&playerImmortalSangukSealTurns>0)playerImmortalSangukSealTurns=Math.max(0,playerImmortalSangukSealTurns-1);
    if(playerCard.id==='immortalChoi'&&playerImmortalChoiReflectLeft<=0)playerImmortalChoiReflectLeft=0;
    turn++;
    if(playerHp<=0){
      // transcend Seungwoo: sacrifice one other living owned character and revive.
      if(playerCard.id==='transcendSeungwoo'){
        const survivors=cards.filter(x=>x.id!=='transcendSeungwoo'&&x.rarity!=='SECRET'&&ownedCount(x.id)>0&&getPersistentHp(x)>0);
        if(survivors.length){
          const victim=survivors[Math.floor(Math.random()*survivors.length)]; state.currentHp[victim.id]=0; playerHp=playerBattleMaxHp; state.currentHp[playerCard.id]=playerHp; playerActionsThisTurn=0; appendLog(`♻️ 흡수 발동! ${victim.name}의 생존을 대가로 ${playerCard.name}이 부활했습니다.`);
          battleOver=false;save();renderBattle();return;
        }
      }
      // transcend Choi death quest.
      if(playerCard.id==='transcendChoi'){state.stats.transcendChoiDeaths++;checkSpecialQuests();}
      // immortal Seungwoo one-time revival.
      if(playerCard.id==='immortalSeungwoo'&&!playerImmortalSeungwooResurrectUsed){playerImmortalSeungwooResurrectUsed=true;playerHp=playerBattleMaxHp;playerActionsThisTurn=0;appendLog(`♾️ ${playerCard.name}의 부활 발동!`);state.currentHp[playerCard.id]=playerHp;save();renderBattle();return;}
      // transcend Sanguk one-time revival.
      if((playerCard.id==='weaponGeniusJunggu'||playerCard.id==='hwarangJunggu')&&playerJungguRevivesLeft>0){playerJungguRevivesLeft--;playerHp=playerBattleMaxHp;playerActionsThisTurn=0;appendLog(`♻️ ${playerCard.name}의 부활! 남은 부활 ${playerJungguRevivesLeft}회.`);state.currentHp[playerCard.id]=playerHp;save();renderBattle();return;}
      if(playerCard.id==='weaponGeniusJunggu'||playerCard.id==='hwarangJunggu'){enemyHp=0;appendLog(`☠️ ${playerCard.name}의 죽음의 각오! 상대도 함께 쓰러졌습니다.`);finishPlayerVictory();return;}
      if(playerCard.id==='transcendSanguk'&&!playerTranscendSangukResurrected){playerTranscendSangukResurrected=true;playerHp=playerBattleMaxHp;playerActionsThisTurn=0;appendLog(`🔁 ${playerCard.name}의 사망회귀 발동! 부활했습니다.`);state.currentHp[playerCard.id]=playerHp;save();renderBattle();return;}
      // existing God / Shin revival.
      if(!playerResurrectUsed&&(playerCard.id==='shinSeungwoo'||playerCard.id==='godJunseong')){playerResurrectUsed=true;playerHp=1;playerActionsThisTurn=0;appendLog(`♻️ ${playerCard.name}의 부활 발동! HP 1로 재기.`);state.currentHp[playerCard.id]=playerHp;save();renderBattle();return;}
      // immortal Sanguk infinite revival.
      if(playerCard.id==='immortalSanguk'){playerHp=playerBattleMaxHp;playerActionsThisTurn=0;appendLog(`👑 불사의 권능! ${playerCard.name}이(가) 무한히 부활했습니다.`);state.currentHp[playerCard.id]=playerHp;save();renderBattle();return;}
      battleOver=true;state.currentHp[playerCard.id]=0;save();appendLog(`💀 ${playerCard.name}이(가) 쓰러졌습니다.`);
    }else{state.currentHp[playerCard.id]=playerHp;save();}
    playerActionsThisTurn=0;renderBattle(false);
  },420);
}

function appendLog(t){const el=document.getElementById('battleLog');if(!el)return;const row=document.createElement('div');row.innerHTML=`• ${t}`;el.appendChild(row);el.scrollTop=el.scrollHeight}
