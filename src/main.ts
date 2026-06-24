import { assetPaths } from "./config/assets.js";
import { assets } from "./core/assetsInstance.js";
import { Game } from "./game/Game.js";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

if (!ctx) {
    throw new Error("Impossible de récupérer le contexte 2D du canvas.");
}

async function init() {
    try {
        await assets.load(assetPaths);
    } catch (error) {
        console.warn(
            "Some assets failed to load. The game will run with fallback shapes.",
            error
        );
    }

    const game = new Game(canvas, ctx);
    game.start();
}

init();