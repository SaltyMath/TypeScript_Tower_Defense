import { BaseEnemy } from "./BaseEnemy.js";
import { Vec2 } from "../types/Vec2.js";

export class FastEnemy extends BaseEnemy {
    constructor(start: Vec2) {
        super(start);

        this.speed = 140;
        this.maxHealth = 3;
        this.health = 3;
        this.radius = 16;
    }
}