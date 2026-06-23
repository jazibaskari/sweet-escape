import { playerScaleFactor } from "../constants";

type PlayerState =
  | "breathe-side"
  | "breathe-up"
  | "breathe-down"
  | "walk-side"
  | "walk-up"
  | "walk-down";

export function createPlayer(k, spawnPoint: { x: number; y: number }) {
  const PLAYER_SPEED = 200;

  const player = k.add([
    k.sprite("player-sprite", { anim: "breathe-down" }),
    k.pos(spawnPoint.x, spawnPoint.y),
    k.anchor("center"),
    k.scale(playerScaleFactor),
    k.area({ shape: new k.Rect(k.vec2(0, 23), 32, 15) }),
    k.body(),
    k.z(90),
    "player",
    {
      state: "breathe-down" as PlayerState,
      isBlinking: false,
      timers: [] as number[],
    },
  ]);

  player.onUpdate(() => {
    if (
      !player.isBlinking &&
      !k.isKeyDown("left") &&
      !k.isKeyDown("right") &&
      !k.isKeyDown("up") &&
      !k.isKeyDown("down")
    ) {
      const direction = player.state.includes("side")
        ? "side"
        : player.state.includes("up")
        ? "up"
        : "down";
      const breatheAnim = `breathe-${direction}`;
      if (player.curAnim() !== breatheAnim) {
        player.play(breatheAnim);
        player.state = breatheAnim as PlayerState;
      }
    }
  });

  return {
    instance: player,
    moveLeft: (triggerMusic: () => void) => {
      triggerMusic();
      if (player.isBlinking) return;
      player.move(-PLAYER_SPEED, 0);
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.state = "walk-side";
    },
    moveRight: (triggerMusic: () => void) => {
      triggerMusic();
      if (player.isBlinking) return;
      player.move(PLAYER_SPEED, 0);
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.state = "walk-side";
    },
    moveUp: (triggerMusic: () => void) => {
      triggerMusic();
      if (player.isBlinking) return;
      player.move(0, -PLAYER_SPEED);
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.state = "walk-up";
    },
    moveDown: (triggerMusic: () => void) => {
      triggerMusic();
      if (player.isBlinking) return;
      player.move(0, PLAYER_SPEED);
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.state = "walk-down";
    },
    stopHorizontal: () => {
      if (player.isBlinking) return;
      if (!k.isKeyDown("left") && !k.isKeyDown("right")) {
        player.play("breathe-side");
        player.state = "breathe-side";
      }
    },
    stopUp: () => {
      if (player.isBlinking) return;
      if (!k.isKeyDown("up")) {
        player.play("breathe-up");
        player.state = "breathe-up";
      }
    },
    stopDown: () => {
      if (player.isBlinking) return;
      if (!k.isKeyDown("down")) {
        player.play("breathe-down");
        player.state = "breathe-down";
      }
    },
    playEffectAnimation: (effect: "damage" | "power") => {
      if (!player) return;
      player.isBlinking = true;
      const direction = player.state.includes("side")
        ? "side"
        : player.state.includes("up")
        ? "up"
        : "down";
      const animName = `${effect}-${direction}`;
      player.play(animName);
      let blinkCount = 0;
      const maxBlinks = 3;
      const blinkInterval = window.setInterval(() => {
        player.hidden = !player.hidden;
        blinkCount++;
        if (blinkCount >= maxBlinks * 2) {
          clearInterval(blinkInterval);
          player.hidden = false;
          player.isBlinking = false;
          if (k.isKeyDown("left") || k.isKeyDown("right")) {
            player.play("walk-side");
            player.state = "walk-side";
            player.flipX = k.isKeyDown("left");
          } else if (k.isKeyDown("up")) {
            player.play("walk-up");
            player.state = "walk-up";
          } else if (k.isKeyDown("down")) {
            player.play("walk-down");
            player.state = "walk-down";
          } else {
            const restDirection = player.state.includes("side")
              ? "side"
              : player.state.includes("up")
              ? "up"
              : "down";
            player.play(`breathe-${restDirection}`);
            player.state = `breathe-${restDirection}` as PlayerState;
          }
        }
      }, 100);
      player.timers.push(blinkInterval);
    },
  };
}
