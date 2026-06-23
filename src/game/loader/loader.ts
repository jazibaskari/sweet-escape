export const doorAnimConfig = {
  sliceX: 5,
  sliceY: 2,
  anims: {
    closed: 0,
    "o-25": 1,
    "o-50": 2,
    "o-75": 3,
    "o-100": 4,
    "door-open": { from: 0, to: 4, loop: false },
    "door-closed": { from: 5, to: 9, loop: false },
  },
};

export const spriteAnimConfig = {
  sliceX: 6,
  sliceY: 13,
  anims: {
    "idle-side": 0,
    "idle-up": 1,
    "idle-down": 3,
    "damage-side": 66,
    "damage-up": 67,
    "damage-down": 69,
    "power-side": 72,
    "power-up": 73,
    "power-down": 75,
    "walk-side": { from: 6, to: 11, loop: true },
    "walk-up": { from: 12, to: 17, loop: true },
    "walk-down": { from: 24, to: 29, loop: true },
    "breathe-side": { from: 30, to: 35, loop: true },
    "breathe-up": { from: 36, to: 41, loop: true },
    "breathe-down": { from: 48, to: 53, loop: true },
  },
};

export function loadAssets(k) {
  k.loadSprite("map-base", "./sweet_escape_map.png");
  k.loadSprite("map-boss-desk", "./sweet_escape_map_boss_desk.png");
  k.loadSprite("map-top", "./sweet_escape_map_top.png");
  k.loadSprite("good-item-1", "./cake_1.png");
  k.loadSprite("good-item-2", "./cake_2.png");
  k.loadSprite("good-item-3", "./cake_3.png");
  k.loadSprite("bad-item-1", "./veggies.png");
  k.loadSprite("alert", "./alert.png");
  k.loadFont("monogram", "./monogram.ttf");

  k.loadSprite("player-sprite", "./player.png", spriteAnimConfig);
  k.loadSprite("boss-sprite", "./boss.png", spriteAnimConfig);
  k.loadSprite("child", "./child.png", spriteAnimConfig);
  k.loadSprite("door", "./doors.png", doorAnimConfig);
  k.loadSprite("boy-1", "./parent.png", spriteAnimConfig);
  k.loadSprite("guard", "./guard.png", spriteAnimConfig);
}
