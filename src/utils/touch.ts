/**
 * @Author:XYH
 * @Date:2025-11-24
 * @Description: 处理移动端滑动手势，阻止页面滚动
 */
export type SwipeDirection = "up" | "down" | "left" | "right" | null;

export interface SwipeHandlers {
  onSwipe: (dir: SwipeDirection) => void;
}

export function attachSwipeListener(el: HTMLElement, handlers: SwipeHandlers) {
  let startX = 0;
  let startY = 0;
  let moving = false;

  function onStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    moving = true;
  }

  function onMove(e: TouchEvent) {
    if (!moving) return;
    // 阻止页面跟随手势滚动
    e.preventDefault();
  }

  function onEnd(e: TouchEvent) {
    if (!moving) return;
    moving = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < 30) return;
    let dir: SwipeDirection;
    if (absX > absY) {
      dir = dx > 0 ? "right" : "left";
    } else {
      dir = dy > 0 ? "down" : "up";
    }
    handlers.onSwipe(dir);
  }

  el.addEventListener("touchstart", onStart, { passive: false });
  el.addEventListener("touchmove", onMove, { passive: false });
  el.addEventListener("touchend", onEnd);

  return () => {
    el.removeEventListener("touchstart", onStart);
    el.removeEventListener("touchmove", onMove);
    el.removeEventListener("touchend", onEnd);
  };
}
