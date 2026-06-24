export function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
//# sourceMappingURL=math.js.map