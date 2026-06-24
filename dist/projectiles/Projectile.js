import { assets } from "../core/assetsInstance.js";
export class Projectile {
    constructor(start, target) {
        this.speed = 400;
        this.damage = 1;
        this.radius = 6;
        this.active = true;
        this.position = { ...start };
        this.target = target;
    }
    update(delta) {
        if (!this.target.isAlive) {
            this.active = false;
            return;
        }
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const dist = Math.hypot(dx, dy);
        const travel = this.speed * delta;
        const hitThreshold = this.radius + this.target.radius;
        if (dist <= hitThreshold || travel >= dist) {
            this.position = { ...this.target.position };
            this.target.health = Math.max(0, this.target.health - this.damage);
            this.active = false;
            return;
        }
        this.position.x += dx / dist * travel;
        this.position.y += dy / dist * travel;
    }
    draw(ctx) {
        const dx = this.target.position.x - this.position.x;
        const dy = this.target.position.y - this.position.y;
        const angle = Math.atan2(dy, dx);
        const adjustedAngle = angle + Math.PI / 2;
        const sprite = assets.get("projectile");
        const PROJECTILE_SIZE = 30;
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(adjustedAngle);
        if (sprite) {
            ctx.drawImage(sprite, -PROJECTILE_SIZE / 2, -PROJECTILE_SIZE / 2, PROJECTILE_SIZE, PROJECTILE_SIZE);
        }
        else {
            ctx.fillStyle = "#ffb";
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(-this.radius * 0.6, this.radius);
            ctx.lineTo(this.radius * 0.6, this.radius);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}
//# sourceMappingURL=Projectile.js.map