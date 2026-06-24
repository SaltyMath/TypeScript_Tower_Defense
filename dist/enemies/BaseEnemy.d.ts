import { Vec2 } from "../types/Vec2.js";
import { SpriteKey } from "../config/assets.js";
export declare abstract class BaseEnemy {
    position: Vec2;
    pathIndex: number;
    progress: number;
    speed: number;
    maxHealth: number;
    health: number;
    radius: number;
    frame: number;
    frameTimer: number;
    currentSprite: SpriteKey;
    readonly frameWidth = 64;
    readonly frameHeight = 64;
    readonly frameCount = 8;
    readonly animationSpeed = 0.1;
    constructor(start: Vec2);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    protected drawFallback(ctx: CanvasRenderingContext2D): void;
    protected drawHealthBar(ctx: CanvasRenderingContext2D): void;
    get isAlive(): boolean;
    get reachedEnd(): boolean;
}
//# sourceMappingURL=BaseEnemy.d.ts.map