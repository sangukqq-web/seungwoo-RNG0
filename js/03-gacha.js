// Character gacha and reveal UI.
function chooseGacha(){
  const p=Math.random()*100;
  if(p<0.3){
    const x=gachaPool.filter(c=>c.rarity==='X');
    return x[Math.floor(Math.random()*x.length)];
  }
  const q=(p-0.3)/99.7*100;
  let group;
  if(q<37.7) group=['COMMON','C'];
  else if(q<61.7) group=['UNCOMMON'];
  else if(q<79.7) group=['RARE'];
  else if(q<89.7) group=['EPIC'];
  else if(q<96.7) group=['Legendary','S','SS'];
  else group=['SSS','SSS+'];
  const arr=gachaPool.filter(c=>group.includes(c.rarity));
  return arr[Math.floor(Math.random()*arr.length)] || gachaPool[0];
}
function pull(n){
 const cost=n===1000?80000:(n===100?8000:(n===10?900:100)); if(state.coins<cost){alert('코인이 부족합니다.');return;} state.coins-=cost;
 const results=[];
 let duplicateCoins=0;
 for(let i=0;i<n;i++){
   const c=chooseGacha();
   const before=state.owned[c.id]||0;
   state.owned[c.id]=before+1;
   state.fragments[c.id]=(state.fragments[c.id]||0)+1;
   if(before===0){
     state.levels[c.id]=1;
     state.xp[c.id]=0;
     state.currentHp[c.id]=getBattleHp(c);
     if(!state.selectedId) state.selectedId=c.id;
   }
   if(before>0) duplicateCoins += duplicateReward(c);
   results.push(c);
 }
 state.stats.pulls += n;
 if(duplicateCoins>0){state.coins += duplicateCoins; setTimeout(()=>alert(`중복 카드 보상!\n+${duplicateCoins} 코인`),180)}
 save(); playSfx('pull');
 const best=results.reduce((a,b)=>cardPower(a)>cardPower(b)?a:b);
 document.getElementById('machineImg').src=best.img;document.getElementById('machineCard').classList.remove('reveal');void document.getElementById('machineCard').offsetWidth;document.getElementById('machineCard').classList.add('reveal');
 document.getElementById('gachaMessage').textContent=n===1?`${best.rarity} · ${best.name}`:`${n}연차 완료 · 최고 ${best.rarity}`;
 if(n===1){showReveal(best, false)} else {showMultiReveal(results)}
 renderCollection(); renderAwakening();
}
function showReveal(c,secret){
 const special=['SSS','SSS+','X','Legendary'].includes(c.rarity)||secret;
 const specialText=c.id==='junseongX'?`<div class="special-text r-X">I'AM ATOMIC</div>`:'';
  document.getElementById('revealContent').innerHTML=`<div class="reveal-rarity r-${rarityClass(c.rarity)}">${secret?'SECRET':c.rarity}</div>${specialText}<div class="reveal-name">${c.name}</div><div class="reveal-card ${secret?'SECRET':special?'UR':''}"><img decoding="async" src="${c.img}" alt="${c.name}"></div><p style="color:var(--muted);margin-top:14px">${secret?'개발자 전용 카드가 도감에 등록되었습니다.':'카드가 도감에 등록되었습니다.'}</p>`;
 document.getElementById('revealModal').classList.add('show'); burst(c.id==='junseongX'?70:(special||secret?40:18)); if(special||secret||c.id==='junseongX') playSfx('rare');
}
function showMultiReveal(results){
 const n=results.length;
 const html=results.map((c,idx)=>`<div class="card" style="cursor:default"><div class="img"><img decoding="async" src="${c.img}" alt="${c.name}" loading="lazy"></div><div class="meta"><div class="name">${idx+1}. ${c.name}</div><div class="rarity r-${rarityClass(c.rarity)}">${c.rarity}</div></div></div>`).join('');
 const rareCount=results.filter(c=>['Legendary','SS','SSS','SSS+','X'].includes(c.rarity)).length;
 document.getElementById('revealContent').innerHTML=`<div class="reveal-rarity">${n} PULL</div><div class="reveal-name">승우 ${n}연차 결과</div><p style="color:var(--muted);margin:0 0 12px">최고 등급 <b>${results.reduce((a,b)=>cardPower(a)>cardPower(b)?a:b).rarity}</b> · 고등급 ${rareCount}장</p><div class="gacha-results-grid">${html}</div>`;
 document.getElementById('revealModal').classList.add('show'); burst(n>=100?45:25); playSfx('rare');
}
