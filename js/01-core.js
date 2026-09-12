// Core data, state, shared helpers, and navigation.

    // Background music
    const bgm = new Audio("assets/rpg%20bgm.mp3");
    bgm.loop = true;
    bgm.volume = 0.20;

    function startBGM() {
        bgm.play().catch(() => {});
    }

const cards = [
 {id:'fighter',name:'파이터 이승우',rarity:'COMMON',img:'assets/char_36.png',hp:720,atk:110,def:65,trait:'잽의 리듬 — 첫 스킬 피해 +10%',skills:[['스킨십',120,0],['바디샷',150,1],['러시',230,3]]},
 {id:'boxing',name:'복싱글러브를 구매한 승우',rarity:'UNCOMMON',img:'assets/char_11.png',hp:820,atk:125,def:75,trait:'글러브 적응 — 방어 시 다음 피해 15% 감소',skills:[['스킨십',135,0],['카운터',170,2],['훅 폭격',250,3]]},
 {id:'muaythai',name:'무에타이 승우',rarity:'UNCOMMON',img:'assets/char_09.png',hp:900,atk:135,def:80,trait:'8지점 — 연속 스킬 적중 시 추가 25 피해',skills:[['스킨십',145,0],['엘보',175,1],['니킥 난무',265,3]]},
 {id:'cyborg',name:'개조인간 이승우',rarity:'RARE',img:'assets/char_01.png',hp:1100,atk:150,def:105,trait:'합금 외피 — 받는 피해 8% 감소',skills:[['스킨십',170,0],['부스터 러시',210,1],['오버클럭',300,3]]},
 {id:'unconscious',name:'무의식 승우',rarity:'RARE',img:'assets/char_10.png',hp:980,atk:170,def:80,trait:'무의식 반응 — HP 35% 이하에서 스킬 피해 +30%',skills:[['스킨십',160,0],['감각 삭제',205,2],['무의식 폭주',335,3]]},
 {id:'yamasaki',name:'야마자키파 이승우',rarity:'RARE',img:'assets/char_22.png',hp:1080,atk:175,def:90,trait:'파의 자존심 — HP가 더 높은 동안 피해 +12%',skills:[['스킨십',175,0],['파열격',220,1],['야마자키식 난무',320,3]]},
 {id:'tavi',name:'아라하시 타비',rarity:'RARE',img:'assets/char_21.png',hp:860,atk:165,def:70,trait:'응원 폭발 — 매 3턴마다 HP 60 회복',skills:[['응원탄',150,0],['돌진',190,1],['팬덤 폭격',280,3]]},
 {id:'huya',name:'후야',rarity:'RARE',img:'assets/char_38.png',hp:940,atk:160,def:86,trait:'야성 — 치명타 확률 18%',skills:[['돌진',155,0],['포효',185,1],['야성 난타',300,3]]},
 {id:'neon',name:'네온시티 이승우',rarity:'EPIC',img:'assets/char_05.png',hp:1180,atk:210,def:105,trait:'네온 과부하 — 스킬 쿨다운 1 감소',skills:[['스킨십',200,0],['사이버 스텝',240,1],['시티 브레이커',380,3]]},
 {id:'brainrot',name:'브레인롯 븅신',rarity:'EPIC',img:'assets/char_15.png',hp:1250,atk:195,def:95,trait:'혼돈의 논리 — 20% 확률로 스킬 피해 2배',skills:[['뇌절',180,0],['혼돈킥',240,1],['대혼란',400,3]]},
 {id:'shadow',name:'그림자 군주 승우',rarity:'EPIC',img:'assets/char_03.png',hp:1350,atk:230,def:145,trait:'암흑의 군주 — 매 턴 HP 5% 회복',skills:[['스킨십',210,0],['그림자 구속',250,2],['군주 강림',410,3]]},
 {id:'golden',name:'담배빨이 금성제',rarity:'Legendary',img:'assets/char_07.png',hp:1450,atk:245,def:130,trait:'금성의 기세 — 상대가 상태이상이면 피해 +20%',skills:[['잽',225,0],['스트레이트',260,2],['바디훅',430,3]]},
 {id:'newhuman',name:'신인류 최예강',rarity:'SS',img:'assets/char_20.png',hp:1600,atk:265,def:150,trait:'신인류 — 최대 HP +12%',skills:[['신체 강화',240,0],['초고속 베기',290,1],['인류 갱신',470,3]]},
 {id:'moon',name:'월광검 김준구',rarity:'SSS',img:'assets/char_25.png',hp:1750,atk:300,def:165,trait:'월광검 — 홀수 턴 피해 +18%',skills:[['초승베기',270,0],['월광연참',330,2],['보름달 단절',520,3]]},
 {id:'newawakened',name:'신각자 최예강',rarity:'SSS',img:'assets/char_19.png',hp:1850,atk:315,def:175,trait:'초월 각성 — 최초 1회 HP 1에서 생존',skills:[['각성타',290,0],['신각 충격파',340,2],['각자의 심판',560,3]]},
 {id:'kaiju',name:'괴수 10호 이승우',rarity:'SSS',img:'assets/char_02.png',hp:2000,atk:330,def:160,trait:'괴수 핵 — HP 50% 이하에서 공격력 +25%',skills:[['스킨십',300,0],['포효 충격',380,1],['괴수화',600,4]]},
 {id:'death',name:'죽음의 군주 이승우',rarity:'SSS',img:'assets/char_30.png',hp:2100,atk:350,def:185,trait:'사신 계약 — 처치한 상대에게서 HP 15% 흡수',skills:[['스킨십',310,0],['영혼 절단',390,2],['사형 선고',640,4]]},
 {id:'mischief',name:'짖궂은 장난꾸러기 이현도',rarity:'SSS+',img:'assets/char_31.png',hp:2150,atk:345,def:150,trait:'장난꾸러기 — 15% 확률로 상대 스킬 무효화',skills:[['장난 킥',280,0],['트릭 샷',360,1],['대형 사고',650,4]]},
 {id:'jon',name:'전과 8범 장난꾸러기 존 존스',rarity:'X',img:'assets/char_27.png',hp:8000,atk:3000,def:6000,trait:'8번째 기록 — 피해를 받을수록 공격력 +5%',skills:[['눈찌르기',2000,0],['플라잉 니킥',4000,2],['플라잉 오블리킥',7000,4]]},
 {id:'jujitae',name:'주지태',rarity:'X',img:'assets/char_29.png',hp:10000,atk:5000,def:7000,trait:'두려움 — 자신의 HP가 1이라도 깎일 시 스킬 데미지 2배',skills:[['레프트 훅',4000,0],['플라잉 암바',6000,2],['인사이드 힐훅',8000,4]]},
 {id:'yuk',name:'육성제',rarity:'S',img:'assets/char_26.png',hp:1500,atk:260,def:120,trait:'육성 완료 — 경험치 대신 공격력 강화',skills:[['훈련 펀치',230,0],['연속 차기',310,1],['완성형',480,3]]},
 {id:'jihong',name:'면상치워 김지홍',rarity:'S',img:'assets/char_08.png',hp:1380,atk:250,def:112,trait:'면상 치워 — 상대 첫 공격 피해 25% 감소',skills:[['밀어내기',210,0],['돌려차기',300,1],['면상 철거',460,3]]},
 {id:'pitiful',name:'한심한 이승우',rarity:'C',img:'assets/char_37.png',hp:560,atk:80,def:40,trait:'한심함의 힘 — 체력이 낮을수록 공격력 상승',skills:[['스킨십',90,0],['자기합리화',120,1],['마지막 발악',200,2]]},
 {id:'arrested',name:'성추행 후 체포된 승우',rarity:'COMMON',img:'assets/char_16.png',hp:650,atk:95,def:55,trait:'구속 — 첫 턴 이동 불가, 대신 피해 30% 감소',skills:[['스킨십',105,0],['철창 удар',145,1],['도주 시도',220,3]]},
 {id:'peeping',name:'여자 화장실 염탐하는 이승우',rarity:'COMMON',img:'assets/char_24.png',hp:620,atk:90,def:50,trait:'몰래보기 — 첫 공격 치명타 확률 35%',skills:[['스킨십',120,0],['몰래 이동',130,1],['도망치기',190,2]]},
 {id:'junseongX',name:'김준성',rarity:'X',img:'assets/char_04.png',hp:6000,atk:5000,def:6000,trait:'회피 — 상대의 공격을 3회 확정 회피',skills:[['로우킥',3000,0],['오버핸드 훅',5000,2],['암바',7000,4]]},
 {id:'shinSeungwoo',name:'신 이승우',rarity:'X',img:'assets/char_18.png',hp:7000,atk:3000,def:5000,trait:'도박 — 50% 확률로 전투 능력치를 2배로 올리고, 실패 시 2배로 낮춘다. 2차 특성: 부활 — HP 0에서 1회 부활.',skills:[['펀치',1500,0],['강타',5000,2],['찬스',0,3]]},
 {id:'streetFighterSeungwoo',name:'스트릿 파이터 이승우',rarity:'UNCOMMON',img:'assets/char_17.png',hp:800,atk:400,def:100,trait:'막싸움 : 5%확률로 자신의 공격력을 10% 증가시킨다.',skills:[['막치기',100,0],['뺨치기',150,1],['인중 때리기',200,2]]},
 {id:'transcendSeungwoo',name:'초월자 이승우',rarity:'X',img:'assets/char_34.png',hp:4000,atk:10000,def:5000,trait:'흡수 : 자신의 HP가 0이 되면 보유중인 생존 캐릭터의 수명과 바꾸어 자신은 부활하고 보유중인 캐릭터는 랜덤하게 사망한다.',skills:[['명치 치기',2000,0],['급소 치기',7000,2],['목치기',10000,4]],specialCode:'go beyond'},
 {id:'meatShieldChoi',name:'단단한 고기 방패 최예강',rarity:'SS',img:'assets/char_06.png',hp:10000,atk:0,def:5000,trait:'처맞아도 안뒤지기 : 강력한 위력의 데미지를 맞아도 무조건 1회 살아남는다.',skills:[['조롱',0,0],['농락',0,1],['욕설난발',0,2]]},
 {id:'transcendChoi',name:'초월자 최예강',rarity:'X',img:'assets/char_35.png',hp:20000,atk:0,def:10000,trait:'난 바퀴벌레다 좆밥들아 : 3회턴동안 무적 상태를 유지한다.',skills:[['패드립',0,0],['쌍욕개패드립',0,1],['조롱과 패드립',0,2]],specialCode:'see bar'},
 {id:'immortalChoi',name:'불멸의 최예강',rarity:'GOD',img:'assets/char_14.png',hp:50000,atk:0,def:30000,trait:'죽여보던가 : 2회동안 상대 공격을 반사한다.',skills:[['니엄마',0,0],['니애비',0,1],['니할애비',0,2]],noGacha:true},
 {id:'immortalSeungwoo',name:'불멸의 이승우',rarity:'GOD',img:'assets/char_13.png',hp:15000,atk:5000,def:7000,trait:'처 맞을 용기 : 상대가 자신보다 공격력이 높다면 자신의 HP+2000',trait2:'부활 : 사망 시 1회 부활한다.',skills:[['존나 많이 때리고 한대만 때린척 하기',8000,0],['급소 때려놓고 팔 때린척 하기',5000,0],['운동하기',0,0]],noGacha:true},
 {id:'slyJuwan',name:'얍삽한 놈 김주완',rarity:'SS',img:'assets/char_23.png',hp:1000,atk:8000,def:1000,trait:'몰빵',skills:[['몰빵',0,0]]},
 {id:'transcendJuwan',name:'초월자 김주완',rarity:'X',img:'assets/char_32.png',hp:1000,atk:1000,def:1000,trait:'영웅은 죽지 않아요 : 사망한 자신의 원하는 캐릭터를 부활시키고 초월자 김주완은 사망한다.',skills:[],noSkills:true},
 {id:'transcendSanguk',name:'초월자 박상욱',rarity:'X',img:'assets/char_33.png',hp:30000,atk:14000,def:10000,trait:'차례 회귀 : 자신의 공격턴이 2회 주어진다.',trait2:'사망회귀 : 사망 했을시 부활한다.',skills:[['오블리킥',6000,0],['아웃사이드 힐훅',10000,2],['인버티드 힐훅',11000,4]],specialCode:'god sanguk',noGacha:true,noOpponent:true,codexHidden:true},
 {id:'immortalSanguk',name:'불멸의 박상욱',rarity:'GOD',img:'assets/char_12.png',hp:990000,atk:990000,def:990000,trait:'불사의 권능 : 사망해도 죽지 않고 무한히 부활함',trait2:'불멸자의 권능 : 현재 능력치와 스킬의 위력을 5배 만큼 강화시킨다.',trait3:'지배의 권능 : 상대 캐릭터의 공격을 무조건적으로 반사함.',trait4:'속박의 권능 : 상대의 턴을 10회 봉인 시킴.',skills:[['불멸 오블리킥',990000,0],['불멸 아웃사이드 힐훅',999000,2],['불멸 인버티드 힐훅',999900,4],['핵',999999,5]],specialCode:'level 99',noGacha:true,noOpponent:true,codexHidden:true,alwaysAwaken:1000,customMaxLevel:1000,fixedXp:1000},
 {id:'godJunseong',name:'전왕 김준성',rarity:'GOD',img:'assets/char_28.png',hp:30000,atk:16000,def:20000,trait:'부활 — HP 0에서 1회 부활 · 봉인 — 상대 공격 3회 봉인 · 권능 — 한 턴에 스킬 2개 사용 가능',skills:[['업그레이드 카피',0,0],['안면 니킥',8000,2],['트라이앵글 초크',11000,4],['백초크',14000,5]]},
 {id:'jonggun',name:'박종건',rarity:'SSS+',img:'assets/jonggun_park.png',hp:10000,atk:10000,def:10000,trait:'경지 (힘, 맷집) — 공격 ×2 · HP ×2',skills:[['정권지르기',6000,0],['정권지르기 5연',9000,2]],noGacha:true,noOpponent:true},
 {id:'shirooni',name:'白鬼 시로오니',rarity:'X',img:'assets/jonggun_shirooni.png',hp:30000,atk:30000,def:30000,trait:'흑골 — 상대 공격을 3회 무시함.',trait2:'자신만의길 (신체) — 사망했을시 부활하고 모든 능력치 + 5000',skills:[['정권지르기 10연',8000,0],['바디훅',12000,2],['키신세이켄 17연',17000,4]],noGacha:true,noOpponent:true},
 {id:'yamasakiJonggun',name:'백귀 야마자키 종건',rarity:'GOD',img:'assets/jonggun_yamasaki.png',hp:90000,atk:80000,def:80000,trait:'무의식 — HP, ATK, DEF 수치를 모두 100000까지 올린다.',trait2:'죽일각오 — 자신이 사망하면 상대 캐릭터도 사망한다.',trait3:'자신만의길 (신체) — 사망했을시 부활하고 모든 능력치 + 5000',trait4:'흑골 — 상대 공격을 3회 무시함. · 경지 — 상대 공격을 3회 회피함.',skills:[['키신세이켄 81연',30000,0],['정권지르기',45000,2],['아이키도',0,4]],noGacha:true,noOpponent:true},
 {id:'kimJunggu',name:'김준구',rarity:'SSS+',img:'assets/kim_junggu.png',hp:5000,atk:3000,def:5000,trait:'경지 (기술, 속도) — 50% 확률로 공격 시 2배 치명타',skills:[['연장질',2000,0],['찌르기',4000,50],['마구 베기',5000,100]],noGacha:true,noOpponent:true,jungu:true},
 {id:'weaponGeniusJunggu',name:'무기의 천재 김준구',rarity:'X',img:'assets/weapon_genius_junggu.png',hp:10000,atk:6000,def:9000,trait:'부활 — 사망 시 최대 3회 부활',trait2:'죽음의 각오 — 자신이 죽으면 상대 캐릭터도 함께 죽음',skills:[['연장질',4000,0],['베기',5000,50],['난도질',6000,100]],noGacha:true,noOpponent:true,jungu:true},
 {id:'hwarangJunggu',name:'화랑검 김준구',rarity:'GOD',img:'assets/hwarang_junggu.png',hp:70000,atk:30000,def:30000,trait:'부활 — 사망 시 최대 3회 부활',trait2:'죽음의 각오 — 자신이 죽으면 상대 캐릭터도 함께 죽음',skills:[['제 1검 초월(初月)',10000,0],['제 2검 현월(弦月)',14000,50],['제 3검 만월(滿月)',16000,100],['월광검 50검식',100000,150]],noGacha:true,noOpponent:true,jungu:true,customMaxLevel:200},
 {id:'secret',name:'개발자 승우',rarity:'SECRET',img:'assets/char_31.png',hp:9999,atk:999,def:999,trait:'개발자 권한 — 전투 데이터가 정상적이지 않습니다.',skills:[['코드 수정',999,0],['버그 악용',1599,0],['강제 종료',9999,0]]}
];

const rarityClass = r => r==='SSS+'?'SSSplus':r;
const gachaPool = cards.filter(c=>c.rarity!=='SECRET'&&c.rarity!=='GOD'&&!c.noGacha);
let state = JSON.parse(localStorage.getItem('swArenaSave')||'null') || {coins:5000,owned:{},fragments:{},awakens:{},levels:{},xp:{},currentHp:{},selectedId:null,secret:false,godUnlocked:false,stats:{pulls:0,wins:0,bossWins:0,jujitaeBossWins:0,godBossWins:0,transcendChoiDeaths:0,jonggunStageWins:0},dailyClaim:'',achievements:{},redeemedCodes:{},specialQuestClaimed:{}};
state.stats=state.stats||{pulls:0,wins:0,bossWins:0,jujitaeBossWins:0,godBossWins:0};
state.stats.jujitaeBossWins=state.stats.jujitaeBossWins||0;
state.stats.godBossWins=state.stats.godBossWins||0;
state.stats.jonggunStageWins=state.stats.jonggunStageWins||0;
state.stats.transcendChoiDeaths=state.stats.transcendChoiDeaths||0;
state.redeemedCodes=state.redeemedCodes||{};
state.specialQuestClaimed=state.specialQuestClaimed||{};
state.specialQuestClaimed.godJunseong=!!state.specialQuestClaimed.godJunseong;
state.specialQuestClaimed.jonggunBossReward=!!state.specialQuestClaimed.jonggunBossReward;
state.specialQuestClaimed.shirooni=!!state.specialQuestClaimed.shirooni;
state.specialQuestClaimed.yamasakiJonggun=!!state.specialQuestClaimed.yamasakiJonggun;
state.currentHp=state.currentHp||{};
state.godUnlocked=!!state.godUnlocked;
state.dailyClaim=state.dailyClaim||'';
state.achievements=state.achievements||{};
state.xCodeRedeemed=!!state.xCodeRedeemed;
state.xpBoostKills=Math.max(0,Number(state.xpBoostKills||0));
state.potions=state.potions||{}; state.potions.xp2=Number(state.potions.xp2||0);
state.loot=state.loot||{}; state.killsById=state.killsById||{};
state.weaponInventory=Array.isArray(state.weaponInventory)?state.weaponInventory:[];
state.equippedWeapons=state.equippedWeapons||{}; state.weaponPulls=Number(state.weaponPulls||0);
state.weaponStats=state.weaponStats||{sPlusOrHigher:0}; state.traits=state.traits||{}; state.attackBonus=state.attackBonus||{}; state.junGuQuestClaimed=state.junGuQuestClaimed||{}; state.junGuBossWins=Number(state.junGuBossWins||0); state.weaponHwarangObtained=!!state.weaponHwarangObtained;
state.redeemedCodes=state.redeemedCodes||{};
if(state.xCodeRedeemed)state.redeemedCodes.xCode=true;
state.levels=state.levels||{};
state.xp=state.xp||{};
state.awakens=state.awakens||{};
state.owned=state.owned||{};
state.selectedId=state.selectedId||null;

// 무기 정의는 저장 데이터 정규화보다 먼저 선언해서 기존 세이브를 불러올 때도 안전하게 계산합니다.
let weaponDefs=[];
weaponDefs=[
 {id:'chair',name:'의자',rarity:'COMMON',bonus:500},
 {id:'mop',name:'밀대',rarity:'COMMON',bonus:600},
 {id:'cup',name:'커피잔',rarity:'COMMON',bonus:400},
 {id:'shovel',name:'삽',rarity:'UNCOMMON',bonus:800},
 {id:'chopsticks',name:'쇠젓가락',rarity:'UNCOMMON',bonus:700},
 {id:'hammer',name:'망치',rarity:'RARE',bonus:1500},
 {id:'crescentBlade',name:'언월도',rarity:'EPIC',bonus:2000},
 {id:'rebar',name:'철근',rarity:'EPIC',bonus:3000},
 {id:'scabbard',name:'검집',rarity:'S',bonus:4500},
 {id:'bikeChain',name:'자전거 체인',rarity:'S',bonus:3500,turns:1},
 {id:'wiper',name:'와이퍼',rarity:'SS',bonus:6000,hp:1500},
 {id:'bicycle',name:'자전거',rarity:'SS',bonus:6500},
 {id:'steelPipe',name:'쇠파이프',rarity:'SSS',bonus:12000,turns:2},
 {id:'belt',name:'벨트',rarity:'SSS',bonus:10000,hp:3000},
 {id:'dagger',name:'단검',rarity:'SSS+',bonus:15000,hp:5000},
 {id:'spear',name:'창',rarity:'X',bonus:20000,turns:2},
 {id:'hwarangSword',name:'화랑검',rarity:'GOD',bonus:40000,turns:2,hp:8000,special:'moonlight50'}
];
function getBattleHpRaw(c,lvl,awaken){return c.hp + (lvl-1)*100 + awaken*100;}
const finiteNumber=(value,fallback)=>{
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
};
function getMaxLevel(c){return c.customMaxLevel||((c.rarity==='GOD')?200:100)}

function getCardLevel(c){
  const raw=Number(state.levels?.[c.id]);
  if(!Number.isFinite(raw)) return ownedCount(c.id)>0?1:0;
  return Math.max(ownedCount(c.id)>0?1:0,Math.min(getMaxLevel(c),Math.floor(raw)));
}
function getCardXp(c){
  const n=Number(state.xp?.[c.id]);
  return Number.isFinite(n)&&n>=0?n:0;
}
function skillUnlockLevel(i){return i===0?1:(i===1?50:(i===2?100:150))}
function isSkillUnlocked(c,i,lvl=getCardLevel(c)){
  if(i===0) return true;
  if(i===1) return lvl>=50;
  if(i===2) return lvl>=100;
  return c.rarity==='GOD' && lvl>=150;
}
function nextXpNeed(c){const lvl=getCardLevel(c); if(lvl>=getMaxLevel(c))return 0; return c.fixedXp|| (500+(lvl*200));}

function getAwakenLevel(c){
  const n=Number(state.awakens?.[c.id]);
  return Number.isFinite(n)&&n>=0?Math.floor(n):0;
}
function getBattleHp(c){const w=c?.jungu?getWeaponAggregate(c.id):{hp:0}; return Math.floor((c.hp + (getCardLevel(c)-1)*100 + getAwakenLevel(c)*100 + w.hp) * (c.id==='immortalSanguk'?5:1))}
function getBattleAtk(c){const w=c?.jungu?getWeaponAggregate(c.id):{attack:0}; const bonus=Number(state.attackBonus?.[c.id]||0); return Math.floor((c.atk + (getCardLevel(c)-1)*100 + getAwakenLevel(c)*100 + w.attack + bonus) * (c.id==='immortalSanguk'?5:1))}
function getBattleDef(c){return Math.floor((c.def + (getCardLevel(c)-1)*100 + getAwakenLevel(c)*100) * (c.id==='immortalSanguk'?5:1))}
function getEquippedWeaponInstances(charId){
  const ids=Array.isArray(state.equippedWeapons?.[charId])?state.equippedWeapons[charId]:[];
  return ids.map(uid=>state.weaponInventory.find(w=>w.uid===uid)).filter(Boolean);
}
function getWeaponAggregate(charId){
  if(typeof weaponDefs==='undefined') return {skill:0,hp:0,turns:0,attack:0};
  const ws=getEquippedWeaponInstances(charId);
  return ws.reduce((a,w)=>{const d=weaponDefs.find(x=>x.id===w.id); if(!d)return a; const lv=Math.max(0,Math.min(5,Number(w.enhance)||0)); const bonus=(d.bonus||0)+lv*5000; a.skill+=bonus; a.hp+=(d.hp||0); a.turns+=(d.turns||0); a.attack+=d.attack||0; return a;},{skill:0,hp:0,turns:0,attack:0});
}
function hasWeaponEquipped(c){return !!c?.jungu && getEquippedWeaponInstances(c.id).length>0;}
function getActionLimit(c){return 1 + (c?.bossJunGu?4:0) + (isDoubleTurnCharacterBase(c)?1:0) + getWeaponAggregate(c?.id).turns;}
function isDoubleTurnCharacterBase(c){return c?.id==='transcendSanguk'||c?.id==='godJunseong';}
function isDoubleTurnCharacter(c){return getActionLimit(c)>=2;}
function getSkillDamage(c,i){
  if(!c || !Array.isArray(c.skills) || !c.skills[i]) return 0;
  if(c.id==='shinSeungwoo' && i===2) return 0;
  if(c.id==='godJunseong' && i===0) return 0;
  if(c.bossJunGu) return Math.floor(c.skills[i][1]);
  if(c.jungu && !hasWeaponEquipped(c)) return 0;
  let v=c.skills[i][1] + (getCardLevel(c)-1)*100 + getAwakenLevel(c)*100;
  if(c.id==='immortalSanguk') v*=5;
  if(c.jungu) v += getWeaponAggregate(c.id).skill;
  return Math.floor(v);
}

function getPersistentHp(c){
  const max=getBattleHp(c);
  const raw=Number(state.currentHp?.[c.id]);
  if(!Number.isFinite(raw)) state.currentHp[c.id]=max;
  else state.currentHp[c.id]=Math.max(0,Math.min(max,raw));
  return state.currentHp[c.id];
}

function isSpecialNoSkill(c){return !!c?.noSkills;}
function isDoubleTurnCharacter(c){return c?.id==='transcendSanguk'||c?.id==='godJunseong';}
function isNonOpponent(c){return !!c?.noOpponent || c?.rarity==='SECRET' || c?.rarity==='GOD' && c?.noOpponent;}
function opponentPoolFor(player){return cards.filter(c=>c.rarity!=='SECRET'&&!c.noOpponent&&c.id!==player.id&&!c.codexHidden);}
function grantCharacter(id,opts={}){
  const c=cards.find(x=>x.id===id); if(!c) return;
  state.owned[id]=(state.owned[id]||0)+1;
  state.fragments[id]=(state.fragments[id]||0)+1;
  if(state.levels[id]===undefined) state.levels[id]=opts.level||1;
  if(state.xp[id]===undefined) state.xp[id]=0;
  if(opts.awaken!==undefined) state.awakens[id]=opts.awaken;
  else if(state.awakens[id]===undefined) state.awakens[id]=0;
  if(c.alwaysAwaken!==undefined) state.awakens[id]=c.alwaysAwaken;
  state.currentHp[id]=getBattleHp(c);
  if(!state.selectedId) state.selectedId=id;
}
function checkSpecialQuests(){
  if(!state.specialQuestClaimed.immortalChoi && state.stats.transcendChoiDeaths>=30 && state.stats.jujitaeBossWins>=3){
    state.specialQuestClaimed.immortalChoi=true;
    grantCharacter('immortalChoi');
    appendLog('🛡️ 불멸의 최예강 퀘스트 달성! 즉시 획득했습니다.');
    setTimeout(()=>showReveal(cards.find(c=>c.id==='immortalChoi'),false),120);
  }
  if(!state.specialQuestClaimed.immortalSeungwoo && state.stats.jujitaeBossWins>=10 && getCardLevel(cards.find(c=>c.id==='transcendSeungwoo'))>=50){
    state.specialQuestClaimed.immortalSeungwoo=true;
    grantCharacter('immortalSeungwoo');
    appendLog('♾️ 불멸의 이승우 퀘스트 달성! 즉시 획득했습니다.');
    setTimeout(()=>showReveal(cards.find(c=>c.id==='immortalSeungwoo'),false),180);
  }
  const jonggunLv=getCardLevel(cards.find(c=>c.id==='jonggun'));
  if(!state.specialQuestClaimed.shirooni && jonggunLv>=50 && state.stats.jonggunStageWins>=10 && state.stats.godBossWins>=10 && getCardLevel(cards.find(c=>c.id==='moon'))>=100){
    state.specialQuestClaimed.shirooni=true;
    grantCharacter('shirooni');
    appendLog('👹 白鬼 시로오니 퀘스트 달성! 즉시 획득했습니다.');
    setTimeout(()=>showReveal(cards.find(c=>c.id==='shirooni'),false),220);
  }
  if(!state.specialQuestClaimed.yamasakiJonggun && state.stats.jonggunStageWins>=100){
    state.specialQuestClaimed.yamasakiJonggun=true;
    grantCharacter('yamasakiJonggun');
    appendLog('👺 백귀 야마자키 종건 퀘스트 달성! 즉시 획득했습니다.');
    setTimeout(()=>showReveal(cards.find(c=>c.id==='yamasakiJonggun'),false),260);
  }
  checkGodQuest();
  save();
}
function resetEntryTraits(c){
  playerActionsThisTurn=0;
  playerGambleApplied=false;
  playerChanceUsed=false;
  playerResurrectUsed=false;
  playerDodgeLeft=(c.id==='junseongX')?3:0;
  playerMeatShieldUsed=false;
  playerTranscendChoiInvulTurns=(c.id==='transcendChoi')?3:0;
  playerImmortalChoiReflectLeft=(c.id==='immortalChoi')?2:0;
  playerImmortalSeungwooResurrectUsed=false;
  playerTranscendSangukResurrected=false;
  playerAbsorbUsed=false;
  playerImmortalSangukSealTurns=(c.id==='immortalSanguk')?10:0;
}
function applySangukAlwaysAwaken(c){
  if(c.id==='immortalSanguk') state.awakens[c.id]=1000;
}

function selectCharacter(id){
  const c=cards.find(x=>x.id===id);
  if(!c || !ownedCount(id)) return;
  if(getPersistentHp(c)<=0){
    alert('이 캐릭터는 HP가 0입니다. 3,000 코인으로 회복한 뒤 선택할 수 있습니다.');
    openCard(id);
    return;
  }
  state.selectedId=id;
  applySangukAlwaysAwaken(c);
  save();
  renderCollection();
  closeModal('cardModal');
}
function healCharacter(id){
  const c=cards.find(x=>x.id===id); if(!c||!ownedCount(id)) return;
  const max=getBattleHp(c), hp=getPersistentHp(c);
  if(hp>=max){alert('이미 HP가 가득합니다.');return;}
  if(state.coins<3000){alert('회복에는 3,000 코인이 필요합니다.');return;}
  state.coins-=3000;
  state.currentHp[id]=max;
  save(); renderCollection(); renderAwakening(); openCard(id);
  playSfx('win');
}
function xpRewardForRarity(r){
  if(r==='X') return 10000;
  if(r==='GOD') return 10000;
  if(['Legendary','S','SS','SSS','SSS+'].includes(r)) return 2000;
  return 500;
}
for(const c of cards){
  const owned=finiteNumber(state.owned[c.id],0);
  state.owned[c.id]=owned;
  if(owned>0){
    const maxLv=getMaxLevel(c);
    const rawLv=finiteNumber(state.levels[c.id],1);
    state.levels[c.id]=Math.max(1,Math.min(maxLv,Math.floor(rawLv)));
    state.xp[c.id]=Math.max(0,finiteNumber(state.xp[c.id],0));
    state.awakens[c.id]=Math.max(0,Math.floor(finiteNumber(state.awakens[c.id],0)));
    if(c.alwaysAwaken!==undefined) state.awakens[c.id]=c.alwaysAwaken;
    const maxHp=getBattleHp(c);
    const rawHp=finiteNumber(state.currentHp[c.id],maxHp);
    state.currentHp[c.id]=Math.max(0,Math.min(maxHp,rawHp));
  }
}
if(!Number.isFinite(Number(state.coins))) state.coins=5000; else state.coins=Number(state.coins);
if(state.selectedId && !ownedCount(state.selectedId)) state.selectedId=null;
let currentFilter='ALL';
let playerCard=null, enemyCard=null, playerHp=0, enemyHp=0, turn=1, battleOver=false, bossMode=false, godBossMode=false, jonggunBossMode=false, junGuBossMode=false, jonggunPage=0, jonggunWhiteReviveUsed=false, jonggunYamasakiReviveUsed=false, jonggunBlackBoneLeft=0, jonggunDodgeLeft=0, jonggunLastPlayerDamage=0, playerBattleAtk=0, playerBattleDef=0, playerBattleMaxHp=0, playerActionsThisTurn=0, playerSealTurns=0, playerDodgeLeft=0, playerResurrectUsed=false, playerGambleApplied=false, playerChanceUsed=false, playerMeatShieldUsed=false, playerTranscendChoiInvulTurns=0, playerImmortalChoiReflectLeft=0, playerImmortalSeungwooResurrectUsed=false, playerTranscendSangukResurrected=false, playerImmortalSangukSealTurns=0, playerAbsorbUsed=false, playerHwarangResurrectUsed=false, godResurrectUsed=false;
let devClicks=0;

function save(){localStorage.setItem('swArenaSave',JSON.stringify(state)); updateTop();}
function updateTop(){
 const owned=Object.keys(state.owned).filter(k=>state.owned[k]>0).length;
 document.querySelectorAll('#coinTop,#coinSide').forEach(e=>e.textContent=state.coins.toLocaleString());
 document.querySelectorAll('#ownedTop,#ownedSide').forEach(e=>e.textContent=owned);
 document.querySelector('#awakeningSide').textContent=Object.keys(state.awakens).filter(k=>state.awakens[k]>0).length;
 const visibleTotal=cards.filter(c=>c.rarity!=='SECRET'&&!c.codexHidden).length + cards.filter(c=>c.codexHidden&&ownedCount(c.id)>0).length;
  document.querySelector('#collectionCount').textContent=`${owned} / ${visibleTotal} 수집`;
 const selected=state.selectedId?cards.find(c=>c.id===state.selectedId):null;
 const side=document.querySelector('#selectedSide');
 if(side) side.textContent=selected?selected.name:'없음';
}
function ownedCount(id){
  const n=Number(state.owned?.[id]);
  return Number.isFinite(n)&&n>0?n:0;
}
function cardPower(c){return c.hp + c.atk*4 + c.def*3 + (c.rarity==='SECRET'?9999:0)}
function go(screen){junGuBossMode=!!junGuBossMode;document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen));document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById('screen-'+screen).classList.add('active');document.getElementById('pageTitle').textContent={home:'승우 아레나',gacha:'승우 뽑기',collection:'승우 도감',battle:bossMode?(jonggunBossMode?'종건 잡기':(godBossMode?'전왕 김준성 보스전':(junGuBossMode?'김준구 보스전':'보스전'))):'1 : 1 배틀',awakening:'각성 연구소',rewards:'보상 센터',shop:'상점',inventory:'인벤토리',code:'개발자 코드'}[screen];if(screen==='collection')renderCollection();if(screen==='awakening')renderAwakening();if(screen==='rewards')renderRewards();if(screen==='shop')renderShop();if(screen==='inventory')renderInventory();if(screen==='battle'&&!playerCard)setupBattle(); else if(screen==='battle') renderBattleSelector();}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.screen)));

document.getElementById('devLogo').addEventListener('click',()=>{devClicks++; if(devClicks>=5){devClicks=0; document.getElementById('devModal').classList.add('show')}});
function closeModal(id){document.getElementById(id).classList.remove('show')}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.querySelectorAll('.modal-wrap.show').forEach(m=>m.classList.remove('show'))}});
document.querySelectorAll('.modal-wrap').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')}));
