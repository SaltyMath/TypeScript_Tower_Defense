import { BaseEnemy } from "./BaseEnemy.js";
import { Vec2 } from "../types/Vec2.js";

export class TankEnemy extends BaseEnemy {
    constructor(start: Vec2) {
        super(start);

        this.speed = 45;
        this.maxHealth = 20;
        this.health = 20;
        this.radius = 24;
    }
}