import { Vec2 } from "../types/Vec2.js";
import { BaseEnemy } from "../enemies/BaseEnemy.js";
import { Tower } from "../towers/Tower.js";
import { Projectile } from "../projectiles/Projectile.js";
export declare class Game {
    private canvas;
    private ctx;
    enemies: BaseEnemy[];
    towers: Tower[];
    projectiles: Projectile[];
    lives: number;
    money: number;
    score: number;
    waveTimer: number;
    enemySpawnTimer: number;
    enemiesToSpawn: number;
    waveIndex: number;
    lastTime: number;
    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D);
    start(): void;
    handleClick(event: MouseEvent): void;
    isOnPath(position: Vec2): boolean;
    spawnWave(): void;
    spawnEnemy(): void;
    update(delta: number): void;
    drawPath(): void;
    drawGrid(): void;
    drawCastles(): void;
    drawUI(): void;
    drawGameOver(): void;
    draw(): void;
    loop(currentTime: number): void;
}
//# sourceMappingURL=Game.d.ts.map