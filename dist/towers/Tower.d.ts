import { Vec2 } from "../types/Vec2.js";
import { BaseEnemy } from "../enemies/BaseEnemy.js";
import { Projectile } from "../projectiles/Projectile.js";
export declare class Tower {
    position: Vec2;
    range: number;
    fireRate: number;
    cooldown: number;
    radius: number;
    damage: number;
    frame: number;
    frameTimer: number;
    currentRow: number;
    readonly frameWidth = 64;
    readonly frameHeight = 64;
    readonly frameCount = 12;
    readonly animationSpeed = 0.12;
    constructor(position: Vec2);
    update(delta: number, enemies: BaseEnemy[], projectiles: Projectile[]): void;
    getDirectionRow(target: Vec2): 0 | 5 | 1 | 2 | 6 | 3 | 7 | 4;
    draw(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Tower.d.ts.map