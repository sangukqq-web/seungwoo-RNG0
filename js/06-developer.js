// Developer codes and secret unlocks.
function redeemDeveloperCode(){
  const input=document.getElementById('developerCodeInput');
  const msg=document.getElementById('developerCodeMsg');
  const raw=input.value.trim();
  const code=raw.toLowerCase();
  if(code==='all8320'){
    if(state.redeemedCodes.all8320){msg.textContent='ℹ️ 이 코드는 이미 사용되었습니다.';return;}
    const allCharacters=cards.filter(c=>c.rarity!=='SECRET');
    allCharacters.forEach(c=>grantCharacter(c.id));
    state.redeemedCodes.all8320=true;
    save();
    msg.textContent=`✅ 전체 캐릭터 ${allCharacters.length}종을 지급했습니다!`;
    playSfx('rare');
    input.value='';
    renderCollection();
    renderAwakening();
    renderRewards();
    if(typeof renderInventory==='function') renderInventory();
    if(typeof renderBattleSelector==='function') renderBattleSelector();
    return;
  }
  if(code==='coincoin'){
    if(state.redeemedCodes.coincoin){msg.textContent='ℹ️ 이 코드는 이미 사용되었습니다.';return;}
    state.coins += 1000000;
    state.redeemedCodes.coincoin=true;
    save();
    msg.textContent='✅ 1,000,000 코인을 지급했습니다!';
    playSfx('rare');
    input.value='';
    updateTop();
    return;
  }
  if(code==='sword'){
    addWeapon('hwarangSword'); state.weaponHwarangObtained=true; save(); msg.textContent='✅ 화랑검을 획득했습니다! (코드 사용 제한 없음)'; playSfx('rare'); input.value=''; renderShop(); renderInventory(); checkJunGuQuests(); return;
  }
  if(code==='1035048320'){
    if(state.redeemedCodes.xCode){msg.textContent='ℹ️ 이 개발자 코드는 이미 사용되었습니다.';return;}
    const xCards=cards.filter(c=>c.rarity==='X'&&!c.specialCode);
    xCards.forEach(c=>grantCharacter(c.id));
    state.redeemedCodes.xCode=true;
    save(); msg.textContent='✅ 기존 X 등급 카드 4종을 지급했습니다!'; playSfx('rare'); input.value=''; renderCollection();renderAwakening();return;
  }
  const special={
    'go beyond':{id:'transcendSeungwoo',key:'goBeyond',label:'초월자 이승우'},
    'see bar':{id:'transcendChoi',key:'seeBar',label:'초월자 최예강'},
    'god sanguk':{id:'transcendSanguk',key:'godSanguk',label:'초월자 박상욱'},
    'level 99':{id:'immortalSanguk',key:'level99',label:'불멸의 박상욱'},
    'korea11':{id:'transcendJuwan',key:'korea11',label:'초월자 김주완'}
  }[code];
  if(!special){msg.textContent='❌ 올바른 개발자 코드가 아닙니다.';playSfx('bad');return;}
  if(state.redeemedCodes[special.key]){msg.textContent='ℹ️ 이 코드는 이미 사용되었습니다.';return;}
  if(special.id==='immortalSanguk') grantCharacter(special.id,{awaken:1000});
  else grantCharacter(special.id);
  state.redeemedCodes[special.key]=true;
  applySangukAlwaysAwaken(cards.find(c=>c.id===special.id));
  save(); msg.textContent=`✅ ${special.label}을(를) 즉시 획득했습니다!`; playSfx('rare'); input.value=''; renderCollection();renderAwakening();renderBattleSelector();
  setTimeout(()=>showReveal(cards.find(c=>c.id===special.id),false),120);
}

function unlockSecret(){const v=document.getElementById('devCode').value.trim();if(v==='SW-DEV-2026'){state.secret=true;state.owned.secret=(state.owned.secret||0)+1;save();document.getElementById('devMsg').textContent='✅ SECRET 승우가 지급되었습니다!';playSfx('rare');setTimeout(()=>{closeModal('devModal');showReveal(cards.find(c=>c.id==='secret'),true);renderCollection()},500)}else{document.getElementById('devMsg').textContent='❌ 코드가 아닙니다.';playSfx('bad')}}
