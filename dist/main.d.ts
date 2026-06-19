type Vec2 = {
    x: number;
    y: number;
};
type SpriteKey = "background" | "path" | "tower" | "enemy" | "projectile" | "allyCastle" | "enemyCastle";
declare class AssetLoader {
    private images;
    load(list: Record<SpriteKey, string>): Promise<void>;
    get(key: SpriteKey): HTMLImageElement | undefined;
    private loadImage;
}
declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D;
declare const CANVAS_WIDTH: number;
declare const CANVAS_HEIGHT: number;
declare const GRID_SIZE = 64;
declare const START_LIVES = 10;
declare const START_MONEY = 200;
declare const pathPoints: Vec2[];
declare const assetPaths: Record<SpriteKey, string>;
declare const assets: AssetLoader;
declare function distance(a: Vec2, b: Vec2): number;
declare function clamp(value: number, min: number, max: number): number;
declare class Enemy {
    position: Vec2;
    pathIndex: number;
    speed: number;
    maxHealth: number;
    health: number;
    radius: number;
    progress: number;
    constructor(start: Vec2);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    get isAlive(): boolean;
    get reachedEnd(): boolean;
}
declare class Projectile {
    position: Vec2;
    speed: number;
    target: Enemy;
    damage: number;
    radius: number;
    active: boolean;
    constructor(start: Vec2, target: Enemy);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Tower {
    position: Vec2;
    range: number;
    fireRate: number;
    cooldown: number;
    radius: number;
    damage: number;
    constructor(position: Vec2);
    update(delta: number, enemies: Enemy[], projectiles: Projectile[]): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Game {
    enemies: Enemy[];
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
    start(): void;
    handleClick(event: MouseEvent): void;
    isOnPath(position: Vec2): boolean;
    spawnWave(): void;
    spawnEnemy(): void;
    update(delta: number): void;
    drawPath(ctx: CanvasRenderingContext2D): void;
    drawGrid(ctx: CanvasRenderingContext2D): void;
    draw(ctx: CanvasRenderingContext2D): void;
    loop(currentTime: number): void;
}
declare function init(): Promise<void>;
//# sourceMappingURL=main.d.ts.map