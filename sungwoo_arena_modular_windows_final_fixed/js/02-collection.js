// Collection / card UI.
function cardHTML(c){
 const count=ownedCount(c.id);
 const selected=state.selectedId===c.id && count>0;
 const lvl=count?getCardLevel(c):0;
 const hp=count?getPersistentHp(c):0;
 const maxHp=count?getBattleHp(c):0;
 return `<div class="card" onclick="openCard('${c.id}')">
   <div class="img"><img decoding="async" src="${c.img}" alt="${c.name}" loading="lazy"></div>
   <div class="meta">
     <div class="name">${c.name}</div>
     <div class="rarity r-${rarityClass(c.rarity)}">${c.rarity}</div>
     ${count?`<div style="margin-top:6px"><span class="tag">보유 ${count}</span></div><div style="margin-top:5px;color:${hp<maxHp?'#ffb36d':'#9ea9c5'};font-size:9px">Lv.${lvl}/${getMaxLevel(c)} · HP ${hp.toLocaleString()}/${maxHp.toLocaleString()}${hp<maxHp?' · 회복 필요':''}</div>`:''}
     ${selected?`<div class="selected-badge">현재 사용</div>`:''}
   </div>
 </div>`;
}
function renderFeatured(){
 const featured=['shadow','death','kaiju','neon','fighter'];
 document.getElementById('featuredGrid').innerHTML=featured.map(id=>cardHTML(cards.find(c=>c.id===id))).join('');
}
function setupFilters(){
 const rs=['ALL','COMMON','UNCOMMON','RARE','EPIC','S','SS','SSS','SSS+','X','GOD','SECRET'];
 document.getElementById('filters').innerHTML=rs.map(r=>`<button class="filter ${r==='ALL'?'active':''}" onclick="setFilter('${r}')">${r}</button>`).join('');
}
function setFilter(f){currentFilter=f;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.textContent===f));renderCollection()}

function ensureCharacterState(c){
  if(ownedCount(c.id)>0){
    if(state.levels[c.id]===undefined) state.levels[c.id]=1;
    if(state.xp[c.id]===undefined) state.xp[c.id]=0;
    if(state.currentHp[c.id]===undefined) state.currentHp[c.id]=getBattleHp(c);
  }
}

function renderCollection(){
  let list=cards.filter(c=>c.rarity!=='SECRET'||state.secret);
  list=list.filter(c=>!c.codexHidden||ownedCount(c.id)>0);
  if(currentFilter!=='ALL') list=list.filter(c=>c.rarity===currentFilter);
  const owned=list.filter(c=>ownedCount(c.id)>0), locked=list.filter(c=>ownedCount(c.id)===0);
  const sorted=[...owned,...locked];
  document.getElementById('collectionGrid').innerHTML=sorted.map(c=>{
    if(ownedCount(c.id)>0) return cardHTML(c);
    return `<div class="card" style="opacity:.5"><div class="img" style="display:grid;place-items:center"><span style="font-size:34px;color:#71809e">?</span></div><div class="meta"><div class="name">미획득 카드</div><div class="rarity">${c.rarity}</div></div></div>`;
  }).join('') || `<div class="empty">아직 카드가 없습니다.</div>`;
}

function openCard(id){
 const c=cards.find(x=>x.id===id); if(!c) return;
 const count=ownedCount(id);
 const lvl=getCardLevel(c), maxLv=getMaxLevel(c), xp=getCardXp(c), need=nextXpNeed(c);
 const pct=maxLv>lvl?Math.min(100,(xp/need)*100):100;
 const hp=getPersistentHp(c), maxHp=getBattleHp(c);
 const selected=state.selectedId===id;
 const skills=c.skills.map((s,i)=>{
   const unlocked=isSkillUnlocked(c,i,lvl);
   const damage=(c.id==='shinSeungwoo'&&i===2)?'50% 도박':(c.id==='godJunseong'&&i===0)?'상대 1번 스킬 ×2':`${getSkillDamage(c,i)} 피해`;
   return `<div class="skill ${unlocked?'':'locked-skill'}"><div class="ico">${['⚡','🔥','💀','🩸'][i]||'✦'}</div><div><b>${unlocked?s[0]:'🔒 '+s[0]}</b><span>${unlocked?damage:`Lv.${skillUnlockLevel(i)} 해금`}</span></div></div>`;
 }).join('');
 const healButton=hp<maxHp?`<button class="btn" onclick="healCharacter('${id}')">❤️ 회복 · 3,000 코인</button>`:`<button class="btn" disabled>❤️ HP 가득 참</button>`;
 const selectButton=(count && c.rarity!=='SECRET' && c.rarity!=='GOD')?`<button class="btn ${selected?'selected':''}" onclick="selectCharacter('${id}')">${selected?'✅ 현재 사용하는 캐릭터':'⚔️ 이 캐릭터 사용'}</button>`:c.rarity==='GOD'&&count?`<button class="btn ${selected?'selected':''}" onclick="selectCharacter('${id}')">${selected?'✅ 현재 사용하는 캐릭터':'👑 전왕 사용'}</button>`:'';
 document.getElementById('cardModalContent').innerHTML=`<div class="card big">
   <div class="img"><img decoding="async" src="${c.img}" alt="${c.name}"></div>
   <div>
     <div class="detail-title">${c.name}</div>
     <div class="detail-sub r-${rarityClass(c.rarity)}">${c.rarity} · 보유 ${count}</div>
     <div class="level-box">
       <div class="level-top"><span>캐릭터 레벨</span><b>Lv.${lvl} / ${maxLv}</b></div>
       <div class="xpbar"><div class="xpfill" style="width:${pct}%"></div></div>
       <div class="level-top" style="margin-top:6px"><span>${lvl>=maxLv?'MAX LEVEL':`EXP ${xp.toLocaleString()} / ${need.toLocaleString()}`}</span><span>레벨업마다 능력치/스킬 피해 +100</span></div>
     </div>
     <div class="heal-box"><div class="hp-state"><span>현재 HP</span><b>${hp.toLocaleString()} / ${maxHp.toLocaleString()}</b></div><div class="xpbar"><div class="xpfill" style="width:${maxHp?hp/maxHp*100:0}%"></div></div><div class="select-row">${healButton}</div></div>
     <div class="stats"><div class="stat"><b>${getBattleHp(c)}</b><span>HP</span></div><div class="stat"><b>${getBattleAtk(c)}</b><span>ATK</span></div><div class="stat"><b>${getBattleDef(c)}</b><span>DEF</span></div></div>
     <div class="trait"><b>특성</b><br>${c.trait}${String(state.traits?.[id]||'').includes('두려움')?' · 💎 두려움':''}</div>
     <div class="skills">${skills}</div>
     <div class="select-row">${selectButton}</div>
   </div>
 </div>`;
 document.getElementById('cardModal').classList.add('show');
}
