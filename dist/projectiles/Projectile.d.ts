import { Vec2 } from "../types/Vec2.js";
import { BaseEnemy } from "../enemies/BaseEnemy.js";
export declare class Projectile {
    position: Vec2;
    speed: number;
    damage: number;
    radius: number;
    active: boolean;
    target: BaseEnemy;
    constructor(start: Vec2, target: BaseEnemy);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
//# sourceMappingURL=Projectile.d.ts.map