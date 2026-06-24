import { BaseEnemy } from "./BaseEnemy.js";
import { Vec2 } from "../types/Vec2.js";

export class BasicEnemy extends BaseEnemy {
    constructor(start: Vec2) {
        super(start);

        this.speed = 80;
        this.maxHealth = 5;
        this.health = 5;
        this.radius = 18;
    }
}