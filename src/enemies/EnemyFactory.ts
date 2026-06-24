import { pathPoints } from "../config/path.js";

import { BasicEnemy } from "./BasicEnemy.js";
import { FastEnemy } from "./FastEnemy.js";
import { TankEnemy } from "./TankEnemy.js";

export class EnemyFactory {

    static create(type: string) {

        const start = pathPoints[0];

        if (!start) {
            throw new Error("Path vide");
        }

        return new BasicEnemy(start);

    }
}