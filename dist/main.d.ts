type Vec2 = {
    x: number;
    y: number;
};
declare const canvas: HTMLCanvasElement;
declare const ctx: CanvasRenderingContext2D | null;
declare const CANVAS_WIDTH: number;
declare const CANVAS_HEIGHT: number;
declare class Enemy {
    position: Vec2;
    speed: number;
    radius: number;
    health: number;
    constructor(x: number, y: number);
    update(delta: number): void;
    draw(ctx: CanvasRenderingContext2D): void;
    get isAlive(): boolean;
}
declare class Tower {
    position: Vec2;
    range: number;
    cooldown: number;
    fireRate: number;
    radius: number;
    constructor(x: number, y: number);
    update(delta: number, enemies: Enemy[]): void;
    fire(enemy: Enemy): void;
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Game {
    enemies: Enemy[];
    towers: Tower[];
    elapsed: number;
    lastSpawn: number;
    lastTime: number;
    score: number;
    start(): void;
    placeTower(event: MouseEvent): void;
    spawnEnemy(): void;
    update(delta: number): void;
    draw(): void;
    gameLoop(currentTime: number): void;
}
declare const game: Game;
//# sourceMappingURL=main.d.ts.map