import { Vec2 } from "../types/Vec2.js";
import { SpriteKey } from "../config/assets.js";
import { pathPoints } from "../config/path.js";
import { distance } from "../utils/math.js";
import { assets } from "../core/assetsInstance.js";

export abstract class BaseEnemy {
    position: Vec2;

    pathIndex = 0;
    progress = 0;

    speed = 80;
    maxHealth = 5;
    health = 5;
    radius = 18;

    frame = 0;
    frameTimer = 0;
    currentSprite: SpriteKey = "enemyWalkE";

    readonly frameWidth = 64;
    readonly frameHeight = 64;
    readonly frameCount = 8;
    readonly animationSpeed = 0.1;

    constructor(start: Vec2) {
        this.position = { ...start };
    }

    update(delta: number) {
        const target = pathPoints[this.pathIndex + 1];

        if (!target) return;

        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const distanceToTarget = Math.hypot(dx, dy);
        const travel = this.speed * delta;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.currentSprite = dx > 0 ? "enemyWalkE" : "enemyWalkO";
        } else {
            this.currentSprite = dy > 0 ? "enemyWalkS" : "enemyWalkN";
        }

        if (travel >= distanceToTarget) {
            this.position = { ...target };
            this.pathIndex += 1;
        } else {
            this.position.x += (dx / distanceToTarget) * travel;
            this.position.y += (dy / distanceToTarget) * travel;
        }

        this.frameTimer += delta;

        if (this.frameTimer >= this.animationSpeed) {
            this.frame = (this.frame + 1) % this.frameCount;
            this.frameTimer = 0;
        }

        const totalDistance = pathPoints
            .slice(0, this.pathIndex + 1)
            .reduce((sum, point, index, arr) => {
                if (index === 0) return 0;
                return sum + distance(arr[index - 1]!, point);
            }, 0);

        this.progress =
            totalDistance + distance(pathPoints[this.pathIndex]!, this.position);
    }

    draw(ctx: CanvasRenderingContext2D) {
        const sprite = assets.get(this.currentSprite);

        if (sprite) {
            const DISPLAY_SIZE = 96;

            ctx.drawImage(
                sprite,
                this.frame * this.frameWidth,
                0,
                this.frameWidth,
                this.frameHeight,
                this.position.x - DISPLAY_SIZE / 2,
                this.position.y - DISPLAY_SIZE / 2,
                DISPLAY_SIZE,
                DISPLAY_SIZE
            );
        } else {
            this.drawFallback(ctx);
        }

        this.drawHealthBar(ctx);
    }

    protected drawFallback(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#d43";
        ctx.beginPath();
        ctx.arc(
            this.position.x,
            this.position.y,
            this.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    protected drawHealthBar(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "#222";
        ctx.fillRect(
            this.position.x - 24,
            this.position.y + 26,
            48,
            6
        );

        ctx.fillStyle = "#5f5";
        ctx.fillRect(
            this.position.x - 24,
            this.position.y + 26,
            (48 * this.health) / this.maxHealth,
            6
        );
    }

    get isAlive() {
        return this.health > 0;
    }

    get reachedEnd() {
        return (
            this.pathIndex >= pathPoints.length - 1 &&
            distance(this.position, pathPoints[pathPoints.length - 1]!) < 2
        );
    }
}