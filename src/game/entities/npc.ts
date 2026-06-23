import { playerScaleFactor } from "../constants";

export interface Waypoint {
  x: number;
  y: number;
  name?: string;
}

export function spawnWaypointNPC(
  k,
  spriteName: string,
  waypoints: Waypoint[],
  startDelay: number,
  speed: number,
  finalAnim: string,
  width: number,
  height: number,
  offX: number,
  offY: number,
  defaultFlipX: boolean,
  animateDoor: (door) => void,
  playerInstance,
  _clearDialogues: () => void,
  onReachEnd?: (npc) => void,
  getWaypointsCallback?: (
    layerName: string,
    pointNames: string[]
  ) => Waypoint[] | null
) {
  if (!waypoints || waypoints.length === 0) return null;

  const npc = k.add([
    k.sprite(spriteName, { anim: "breathe-down" }),
    k.pos(waypoints[0].x, waypoints[0].y),
    k.anchor("center"),
    k.scale(playerScaleFactor),
    k.area({ shape: new k.Rect(k.vec2(offX, offY), width, height) }),
    k.body({ isStatic: true }),
    k.z(80),
    spriteName,
    {
      moving: false,
      waypoints: waypoints,
      curIndex: 1,
      alertActive: false,
      hasTriggeredText: false,
      hasCompletedInteraction: false,
      isParentWindowActive: false,
      alertSprite: null,
      isExiting: false,
      hasWaited: false,
    },
  ]);

  const startNextLeg = () => {
    if (npc.curIndex >= npc.waypoints.length) {
      npc.moving = false;
      npc.play(finalAnim);
      npc.flipX = defaultFlipX;
      if (onReachEnd) onReachEnd(npc);
      if (npc.isExiting) npc.destroy();
      return;
    }
    const target = npc.waypoints[npc.curIndex];
    const dx = target.x - npc.pos.x;
    const dy = target.y - npc.pos.y;
    if (Math.abs(dy) > Math.abs(dx)) {
      npc.play(dy > 0 ? "walk-down" : "walk-up");
      npc.flipX = false;
    } else {
      npc.play("walk-side");
      npc.flipX = dx < 0;
    }
  };

  npc.startNextLeg = startNextLeg;

  k.wait(startDelay, () => {
    npc.moving = true;
    startNextLeg();
  });

  npc.onUpdate(() => {
    if (spriteName === "boy-1") {
      const doors = k.get("door");
      for (const door of doors) {
        if (npc.pos.dist(door.pos) <= 70) {
          animateDoor(door);
        }
      }
    }

    if (npc.alertSprite) {
      npc.alertSprite.pos = npc.pos.add(0, -30);
    }

    if (!npc.moving) {
      if (npc.isExiting && spriteName === "child") return;

      const anim = npc.curAnim();
      if (anim && anim.includes("walk")) {
        npc.play(finalAnim);
        npc.flipX = defaultFlipX;
      }

      const dist = npc.pos.dist(playerInstance.pos);
      if (dist < 50) {
        const deltaX = playerInstance.pos.x - npc.pos.x;
        const deltaY = playerInstance.pos.y - npc.pos.y;
        const angleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        let targetAnim: string;
        if (angleDeg >= -45 && angleDeg < 45) {
          npc.flipX = false;
          targetAnim = "breathe-side";
        } else if (angleDeg >= 45 && angleDeg < 135) {
          targetAnim = "breathe-down";
          npc.flipX = false;
        } else if (angleDeg >= 135 || angleDeg < -135) {
          npc.flipX = true;
          targetAnim = "breathe-side";
        } else {
          targetAnim = "breathe-up";
          npc.flipX = false;
        }
        if (npc.curAnim() !== targetAnim) npc.play(targetAnim);
      } else {
        if (npc.curAnim() !== finalAnim || npc.flipX !== defaultFlipX) {
          npc.play(finalAnim);
          npc.flipX = defaultFlipX;
        }
      }
      return;
    }

    const target = npc.waypoints[npc.curIndex];
    const dx = target.x - npc.pos.x;
    const dy = target.y - npc.pos.y;

    if (
      npc.isExiting &&
      spriteName === "boy-1" &&
      target.name === "turn_up_point" &&
      Math.abs(dx) <= 5 &&
      Math.abs(dy) <= 5 &&
      !npc.hasWaited
    ) {
      npc.moving = false;
      npc.hasWaited = true;
      npc.play("breathe-side");

      k.wait(1, () => {
        const childEntities = k.get("child");
        if (childEntities.length > 0 && getWaypointsCallback) {
          const childNpc = childEntities[0];
          const childExit = getWaypointsCallback("child_exit_points", [
            "turn_left_point",
            "end_point",
          ]);

          if (childExit) {
            childNpc.waypoints = [childNpc.pos, ...childExit];
            childNpc.curIndex = 1;
            childNpc.isExiting = true;
            childNpc.moving = false;
            childNpc.play("breathe-side");

            k.wait(1, () => {
              childNpc.moving = true;
              childNpc.flipX = false;
              childNpc.play("walk-side");
            });
          }
        }
      });

      k.wait(2, () => {
        npc.moving = true;
        npc.curIndex++;
        npc.startNextLeg();
      });
      return;
    }

    if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) {
      npc.pos = k.vec2(target.x, target.y);
      npc.curIndex++;
      startNextLeg();
    } else {
      const dir = k.vec2(dx, dy).unit();
      npc.pos.x += dir.x * speed * k.dt();
      npc.pos.y += dir.y * speed * k.dt();
    }
  });

  return npc;
}
