// Shop, weapon gacha, inventory, loot, and JunGu quests.
const weaponGachaPool=weaponDefs.filter(w=>w.rarity!=='GOD');
function chooseWeapon(){
  const p=Math.random()*100;
  if(p<0.3) return weaponGachaPool.filter(w=>w.rarity==='X')[Math.floor(Math.random()*weaponGachaPool.filter(w=>w.rarity==='X').length)];
  const q=(p-0.3)/99.7*100;
  let group;
  if(q<37.7) group=['COMMON'];
  else if(q<61.7) group=['UNCOMMON'];
  else if(q<79.7) group=['RARE'];
  else if(q<89.7) group=['EPIC'];
  else if(q<96.7) group=['S'];
  else group=['SSS','SSS+'];
  let arr=weaponGachaPool.filter(w=>group.includes(w.rarity));
  // SS weapons are included in the same 7% rarity bucket as S.
  if(group[0]==='S') arr=weaponGachaPool.filter(w=>w.rarity==='S'||w.rarity==='SS');
  return arr[Math.floor(Math.random()*arr.length)]||weaponGachaPool[0];
}
function addWeapon(id,enhance=0){
  const d=weaponDefs.find(w=>w.id===id); if(!d)return null;
  const w={uid:`w_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,id,enhance:Math.max(0,Math.min(5,enhance))}; state.weaponInventory.push(w); if(d.rarity==='S'||d.rarity==='SS'||d.rarity==='SSS'||d.rarity==='SSS+'||d.rarity==='X'||d.rarity==='GOD')state.weaponStats.sPlusOrHigher=(state.weaponStats.sPlusOrHigher||0)+1; return w;
}
function buyXpPotion(){if(state.coins<10000){alert('코인이 부족합니다.');return;}state.coins-=10000;state.potions.xp2=(state.potions.xp2||0)+1;save();renderShop();renderInventory();alert('🧪 경험치 2배 물약 1개를 구매했습니다.');}
function weaponIcon(d){const m={chair:'🪑',mop:'🧹',cup:'☕',shovel:'⛏️',chopsticks:'🥢',hammer:'🔨',crescentBlade:'⚔️',rebar:'🪨',scabbard:'🗡️',bikeChain:'⛓️',wiper:'🧽',bicycle:'🚲',steelPipe:'🔩',belt:'🥋',dagger:'🗡️',spear:'🔱',hwarangSword:'⚔️'};return m[d.id]||'⚔️';}
function weaponEffectText(d,enhance=0){const bonus=(d.bonus||0)+enhance*5000;let parts=[`모든 스킬 +${bonus.toLocaleString()}`];if(d.hp)parts.push(`HP +${d.hp.toLocaleString()}`);if(d.turns)parts.push(`자신의 턴 +${d.turns}`);if(d.special==='moonlight50')parts.push('월광검 50검식 습득');return parts.join(' · ');}
function showWeaponReveal(w){const d=weaponDefs.find(x=>x.id===w.id);if(!d)return;const high=rarityOrder(d.rarity)>=rarityOrder('SSS');const cls=rarityOrder(d.rarity)>=rarityOrder('X')?'X':high?'UR':'';document.getElementById('revealContent').innerHTML=`<div class="weapon-reveal-wrap"><div class="weapon-reveal-rarity r-${rarityClass(d.rarity)}">WEAPON ${d.rarity}</div><div class="weapon-reveal-name">${d.name}</div><div class="weapon-reveal-card ${cls}"><div class="weapon-reveal-icon">${weaponIcon(d)}</div><div class="weapon-reveal-bonus">${weaponEffectText(d,w.enhance)}</div><div class="weapon-reveal-desc">+0강 · 중복 무기도 각각 별도 보관됩니다.</div></div></div>`;document.getElementById('revealModal').classList.add('show');burst(high?45:22);if(high)playSfx('rare');}
function showWeaponMultiReveal(results){const counts={};results.forEach(w=>{counts[w.id]=(counts[w.id]||0)+1});const sorted=results.slice().sort((a,b)=>rarityOrder(weaponDefs.find(x=>x.id===b.id).rarity)-rarityOrder(weaponDefs.find(x=>x.id===a.id).rarity));const best=weaponDefs.find(x=>x.id===sorted[0].id);const html=results.map((w,i)=>{const d=weaponDefs.find(x=>x.id===w.id);return `<div class="weapon-result-tile"><div class="ico">${weaponIcon(d)}</div><div class="nm">${i+1}. ${d.name}</div><div class="rr r-${rarityClass(d.rarity)}">${d.rarity}</div><div class="ef">${weaponEffectText(d,w.enhance)}</div></div>`}).join('');const totalUnique=Object.keys(counts).length;const dup=results.length-totalUnique;document.getElementById('revealContent').innerHTML=`<div class="reveal-rarity">${results.length} PULL</div><div class="reveal-name">⚔️ 무기 뽑기 결과</div><p style="color:var(--muted);margin:0 0 12px">최고 등급 <b class="r-${rarityClass(best.rarity)}">${best.rarity}</b> · 최고 무기 <b>${best.name}</b><br><span class="weapon-result-count">총 ${results.length}개 · 종류 ${totalUnique}종 · 중복 ${dup}개</span></p><div class="weapon-results-grid">${html}</div>`;document.getElementById('revealModal').classList.add('show');burst(results.length>=100?50:30);playSfx('rare');}

function pullWeapon(n){const cost=n===100?800000:(n===10?90000:10000); if(state.coins<cost){alert('코인이 부족합니다.');return;}state.coins-=cost;const results=[];for(let i=0;i<n;i++){const w=chooseWeapon();const item=addWeapon(w.id);results.push(item);}state.weaponPulls+=n;save();renderShop();renderInventory();checkJunGuQuests();if(n===1){showWeaponReveal(results[0]);}else{showWeaponMultiReveal(results);}}
function rarityOrder(r){return ({COMMON:1,UNCOMMON:2,RARE:3,EPIC:4,S:5,SS:6,SSS:7,'SSS+':8,X:9,GOD:10})[r]||0;}
function canEquipWeaponTo(cId,w){return ['kimJunggu','weaponGeniusJunggu','hwarangJunggu'].includes(cId)&&!!w;}
function equipWeapon(uid,charId){const w=state.weaponInventory.find(x=>x.uid===uid);if(!w||!canEquipWeaponTo(charId,w))return;const arr=Array.isArray(state.equippedWeapons[charId])?state.equippedWeapons[charId]:[];const d=weaponDefs.find(x=>x.id===w.id);const limit=rarityOrder(d.rarity)>=rarityOrder('S')?2:1;if(arr.includes(uid)){state.equippedWeapons[charId]=arr.filter(x=>x!==uid);}else{if(arr.length>=limit){alert(`${d.rarity} 등급 이상 무기는 최대 ${limit}개까지 장착할 수 있습니다.`);return;}arr.push(uid);state.equippedWeapons[charId]=arr;}save();renderInventory();renderCollection();if(playerCard&&['kimJunggu','weaponGeniusJunggu','hwarangJunggu'].includes(charId))renderBattle();}
function strengthenWeapon(uid){const w=state.weaponInventory.find(x=>x.uid===uid);if(!w)return;const d=weaponDefs.find(x=>x.id===w.id);if(!d)return;if(w.enhance>=5){alert('이미 5강입니다.');return;}if(state.coins<10000){alert('강화 비용이 부족합니다.');return;}state.coins-=10000;const successRate=[1,.75,.5,.35,.15][w.enhance]||.15;if(Math.random()<successRate){w.enhance++;save();renderInventory();renderShop();alert(`✅ ${d.name} 강화 성공! +${w.enhance}강`);}else{const idx=state.weaponInventory.indexOf(w);if(idx>=0)state.weaponInventory.splice(idx,1);for(const k of Object.keys(state.equippedWeapons)){state.equippedWeapons[k]=(state.equippedWeapons[k]||[]).filter(x=>x!==uid);}save();renderInventory();renderShop();alert(`💥 ${d.name} 강화 실패! 무기가 파괴되었습니다.`);}}
function useLoot(kind){
 const n=Number(state.loot?.[kind]||0); if(n<=0)return;
 if(kind==='heal'){
   if(!playerCard){alert('먼저 캐릭터를 선택하세요.');return;}
   state.currentHp[playerCard.id]=getBattleHp(playerCard); state.loot.heal--; save();
 }else if(kind==='fullRevive'){
   cards.forEach(c=>{if(ownedCount(c.id)>0)state.currentHp[c.id]=getBattleHp(c);}); state.loot.fullRevive--; save();
 }else if(kind==='awakeningStone'){
   const id=prompt('각성할 캐릭터 ID를 입력하세요.');
   if(!id||!cards.find(c=>c.id===id)||!ownedCount(id))return;
   state.awakens[id]=(state.awakens[id]||0)+1; state.loot.awakeningStone--; save();
 }else if(kind==='fearStone'){
   openFearStoneTargetPicker(); return;
 }else if(kind==='enhanceStone'){
   const id=prompt('공격력을 +1000 할 캐릭터 ID를 입력하세요.');
   if(!id||!cards.find(c=>c.id===id)||!ownedCount(id))return;
   state.attackBonus[id]=(state.attackBonus[id]||0)+1000; state.loot.enhanceStone--; save();
 }
 renderInventory(); renderCollection();
}

function openFearStoneTargetPicker(){
 const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0);
 if(!owned.length){alert('획득한 캐릭터가 없습니다.');return;}
 const currentTraits=state.traits||{};
 const html=`<div class="section-head" style="margin-top:0"><div><h3>💎 두려움 특징의 돌</h3><p>두려움 특성을 부여할 캐릭터를 선택하세요.</p></div></div>
 <div class="trait" style="margin-top:0"><b>효과</b><br>선택한 캐릭터가 공격할 때 피해가 2배로 적용됩니다.</div>
 <div class="card-grid" style="margin-top:14px;grid-template-columns:repeat(3,minmax(0,1fr));">${owned.map(c=>{
   const hasFear=String(currentTraits[c.id]||'').includes('두려움');
   const lvl=getCardLevel(c);
   return `<button class="card" type="button" style="text-align:left" onclick="applyFearStone('${c.id}')">
     <div class="img"><img decoding="async" src="${c.img}" alt="${c.name}"></div>
     <div class="meta"><div class="name">${c.name}</div><div class="rarity r-${rarityClass(c.rarity)}">${c.rarity} · Lv.${lvl}</div><div class="small-note" style="margin-top:5px">${hasFear?'✅ 두려움 보유':'두려움 부여 가능'}</div></div>
   </button>`;
 }).join('')}</div>
 <div class="buttons" style="justify-content:flex-end;margin-top:14px"><button class="btn" onclick="closeModal('cardModal')">취소</button></div>`;
 document.getElementById('cardModalContent').innerHTML=html;
 document.getElementById('cardModal').classList.add('show');
}

function applyFearStone(id){
 const c=cards.find(x=>x.id===id); if(!c||!ownedCount(id)||Number(state.loot?.fearStone||0)<=0)return;
 const existing=String(state.traits?.[id]||'');
 if(existing.includes('두려움')){alert(`${c.name}은(는) 이미 두려움 특성을 가지고 있습니다.`);return;}
 state.traits[id]=existing?`${existing} · 두려움`:'두려움';
 state.loot.fearStone--;
 save(); closeModal('cardModal'); renderInventory(); renderCollection();
 alert(`💎 두려움 특징의 돌 사용 완료!
${c.name}에게 두려움 특성이 부여되었습니다.`);
}
function renderShop(){const el=document.getElementById('shopWeaponList');if(!el)return;el.innerHTML=weaponDefs.map(w=>`<div class="weapon-row"><div class="weapon-main"><b>${w.name} <span class="weapon-badge r-${rarityClass(w.rarity)}">${w.rarity}</span></b><span>모든 스킬 +${w.bonus.toLocaleString()}${w.hp?` · HP +${w.hp.toLocaleString()}`:''}${w.turns?` · 자신의 턴 +${w.turns}`:''}</span></div><div class="weapon-actions"><span class="small-note">보유 ${state.weaponInventory.filter(x=>x.id===w.id).length}</span></div></div>`).join('');}
function renderInventory(){const eq=document.getElementById('weaponEquipContent');if(!eq)return;const chars=cards.filter(c=>['kimJunggu','weaponGeniusJunggu','hwarangJunggu'].includes(c.id));let html=chars.map(c=>{const arr=getEquippedWeaponInstances(c.id);const slots=arr.map(w=>{const d=weaponDefs.find(x=>x.id===w.id);return `<div class="inventory-item"><h4>${d.name} <span class="weapon-level">+${w.enhance}</span></h4><p>${d.rarity} · 모든 스킬 +${(d.bonus+w.enhance*5000).toLocaleString()}${d.hp?` · HP +${d.hp.toLocaleString()}`:''}${d.turns?` · 턴 +${d.turns}`:''}</p><div class="buttons"><button class="btn" onclick="equipWeapon('${w.uid}','${c.id}')">해제</button><button class="btn" onclick="strengthenWeapon('${w.uid}')">강화 · 10,000</button></div></div>`}).join('');return `<div class="panel" style="margin-bottom:10px"><div class="detail-title">${c.name}</div><div class="detail-sub">장착 ${arr.length}/${getEquipLimitForCharacter(c.id)}</div>${slots||'<div class="empty">장착된 무기 없음</div>'}<div class="buttons" style="margin-top:10px">${state.weaponInventory.map(w=>{const d=weaponDefs.find(x=>x.id===w.id);const equipped=arr.some(x=>x.uid===w.uid);return `<button class="btn ${equipped?'selected':''}" onclick="equipWeapon('${w.uid}','${c.id}')">${equipped?'✅':'⚔️'} ${d.name} +${w.enhance}</button>`}).join('')}</div></div>`}).join('');eq.innerHTML=html||'<div class="empty">김준구 3종을 획득하면 장비를 사용할 수 있습니다.</div>';const loot=document.getElementById('lootInventory');if(loot){const items=[['heal','회복 물약','현재 캐릭터 HP를 최대치로 회복'],['fearStone','두려움 특징의 돌','원하는 캐릭터에게 두려움 특성 부여'],['enhanceStone','강화석','원하는 캐릭터 공격력 +1,000'],['fullRevive','전체 부활석','보유 중인 모든 캐릭터 HP 완전 회복'],['awakeningStone','각성석','원하는 캐릭터 1회 각성']];loot.innerHTML=items.map(([k,n,d])=>`<div class="inventory-item"><h4>${n} × ${Number(state.loot[k]||0)}</h4><p>${d}</p><button class="btn" ${(state.loot[k]||0)<=0?'disabled':''} onclick="useLoot('${k}')">사용</button></div>`).join('');}}
function getEquipLimitForCharacter(charId){const arr=state.equippedWeapons[charId]||[];return arr.some(uid=>{const w=state.weaponInventory.find(x=>x.uid===uid);const d=w&&weaponDefs.find(x=>x.id===w.id);return d&&rarityOrder(d.rarity)>=rarityOrder('S');})?2:1;}
function checkJunGuQuests(){
 const j=cards.find(c=>c.id==='kimJunggu'), g=cards.find(c=>c.id==='weaponGeniusJunggu');
 const sPlus=Number(state.weaponStats.sPlusOrHigher||0)>=1;
 if(ownedCount(j?.id)===0&&getCardLevel(cards.find(c=>c.id==='moon'))>=50&&state.weaponPulls>=1){state.junGuQuestClaimed.kim=true;grantCharacter('kimJunggu');}
 if(ownedCount(g?.id)===0&&getCardLevel(j)>=65&&state.weaponPulls>=20&&sPlus&&state.stats.jujitaeBossWins>=30&&state.junGuBossWins>=1){state.junGuQuestClaimed.genius=true;grantCharacter('weaponGeniusJunggu');}
 if(ownedCount('hwarangJunggu')===0&&state.weaponHwarangObtained&&state.stats.jonggunStageWins>=1){state.junGuQuestClaimed.hwarang=true;grantCharacter('hwarangJunggu');}
 save();renderCollection();
}
function grantWeaponLoot(enemyId){state.killsById[enemyId]=(state.killsById[enemyId]||0)+1;const r=Math.random();if(r<0.10){state.loot.heal=(state.loot.heal||0)+1;}if(enemyId==='jujitae'&&Math.random()<0.30)state.loot.fearStone=(state.loot.fearStone||0)+1;if(enemyId==='jon'&&Math.random()<0.15)state.loot.enhanceStone=(state.loot.enhanceStone||0)+1;if(enemyId==='shinSeungwoo'&&Math.random()<0.20)state.loot.fullRevive=(state.loot.fullRevive||0)+1;if(enemyId==='junseongX'&&Math.random()<0.30)state.loot.awakeningStone=(state.loot.awakeningStone||0)+1;if(enemyId==='godJunseong')state.loot.awakeningStone=(state.loot.awakeningStone||0)+1;}

function startJunGuBossBattle(){
 bossMode=true;godBossMode=false;jonggunBossMode=false;junGuBossMode=true;jonggunPage=0;
 const owned=cards.filter(c=>c.rarity!=='SECRET'&&ownedCount(c.id)>0&&getPersistentHp(c)>0); if(!owned.length){alert('사용 가능한 캐릭터가 없습니다.');go('collection');return;}
 if(state.selectedId&&ownedCount(state.selectedId)>0&&getPersistentHp(cards.find(c=>c.id===state.selectedId))>0)playerCard=cards.find(c=>c.id===state.selectedId);else{playerCard=owned[0];state.selectedId=playerCard.id;}
 enemyCard={id:'junGuBoss',name:'김준구 · 화랑검 김준구',rarity:'GOD BOSS',img:'assets/hwarang_junggu.png',hp:136000,atk:30000,def:30000,trait:'화랑검 5강 ×2',trait2:'상대 턴 5회 봉인 · 100% 치명타',trait3:'월광검 제 0 검식 · 사망 시 상대도 사망',skills:[['제 1검 초월(初月)',140000,0],['제 2검 현월(弦月)',144000,0],['제 3검 만월(滿月)',146000,0],['월광검 50검식',230000,0]],bossJunGu:true,customMaxLevel:200};
 initBattleStats(true);document.getElementById('battleLog').innerHTML='';go('battle');renderBattleSelector();renderBattle();appendLog('👑 김준구 잡기 시작! 화랑검 김준구 · 화랑검 5강 ×2');
}
function resolveJunGuBossEnemyStats(){if(!junGuBossMode)return;const temp=enemyCard;if(temp._forcedWeapons){const old=state.equippedWeapons[temp.id];state.equippedWeapons[temp.id]=temp._forcedWeapons;enemyCard=temp;playerBattleMaxHp=playerBattleMaxHp;state.equippedWeapons[temp.id]=old||[];}}
