승우 아레나 — modular build

index.html is the UI shell. Game logic is split into classic JavaScript files, preserving the existing inline onclick/localStorage architecture and gameplay behavior.

Modules:
01-core.js                 shared data/state/helpers/navigation
02-collection.js           collection/card UI
03-gacha.js                character gacha/reveal
04-rewards.js              XP/achievements/rewards/daily
05-shop-inventory.js       shop/weapons/inventory/loot/JunGu quests
06-developer.js            developer codes/secret
07-awakening-quests.js     awakening/special quests
08-battle.js               battle engine/bosses/damage
09-effects-audio.js        particles/audio
99-boot.js                 final initialization

Assets are copied directly from the previous full-game ZIP without changing their bytes or archive names.
