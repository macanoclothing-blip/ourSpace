export const TICK_FREQUENCY = 20; // ticks per second
export const PERSON_W = 40;
export const PERSON_H = 120;

export type Player = {
    name: string;
    character: string;
}

export type Rectangle = {
    x: number; // x position of the top left corner
    y: number; // y position of the top left corner
    w: number; // width
    h: number; // height
}

export const mod = (n: number, m: number) => ((n % m) + m) % m;

export const smoothChange = (from: number, to: number, dt: number, halfLife: number): number => {
    return to + (from - to) * Math.pow(2, -dt / halfLife)
}

export type CollisionSide = "top" | "bottom" | "left" | "right" | "none";

export const getCollisionSide = (rect1: Rectangle, rect2: Rectangle): CollisionSide => {
    // 1. Calculate the overlap on all four sides
    const overlapLeft = (rect1.x + rect1.w) - rect2.x; // rect1's right edge past rect2's left edge
    const overlapRight = (rect2.x + rect2.w) - rect1.x; // rect2's right edge past rect1's left edge
    const overlapTop = (rect1.y + rect1.h) - rect2.y; // rect1's bottom edge past rect2's top edge
    const overlapBottom = (rect2.y + rect2.h) - rect1.y; // rect2's bottom edge past rect1's top edge

    // 2. If any overlap is 0 or negative, they are not colliding at all.
    if (overlapLeft <= 0 || overlapRight <= 0 || overlapTop <= 0 || overlapBottom <= 0) {
        return "none";
    }

    // 3. Find the smallest overlap. The axis with the least penetration is the axis of collision.
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    // 4. Return the side of rect2 that rect1 collided with
    if (minOverlap === overlapTop) return "top";       // rect1 hit the TOP of rect2 (landing on it)
    if (minOverlap === overlapBottom) return "bottom"; // rect1 hit the BOTTOM of rect2 (hitting head)
    if (minOverlap === overlapLeft) return "left";     // rect1 hit the LEFT side of rect2
    if (minOverlap === overlapRight) return "right";   // rect1 hit the RIGHT side of rect2

    return "none";
}