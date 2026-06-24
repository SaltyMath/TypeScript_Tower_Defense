import { Vec2 } from "../types/Vec2";

export function distance(a: Vec2, b: Vec2) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

export function clamp(
    value: number,
    min: number,
    max: number
) {
    return Math.max(min, Math.min(max, value));
}