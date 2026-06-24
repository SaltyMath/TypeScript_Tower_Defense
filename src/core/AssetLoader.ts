import { SpriteKey } from "../config/assets.js";

export class AssetLoader {
    private images = new Map<string, HTMLImageElement>();

    async load(list: Record<SpriteKey, string>): Promise<void> {
        const entries = Object.entries(list) as Array<[SpriteKey, string]>;

        await Promise.all(
            entries.map(([key, src]) => this.loadImage(key, src))
        );
    }

    get(key: SpriteKey): HTMLImageElement | undefined {
        return this.images.get(key);
    }

    private loadImage(key: SpriteKey, src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = src;

            image.onload = () => {
                this.images.set(key, image);
                resolve();
            };

            image.onerror = () => {
                reject(new Error(`Failed to load asset: ${src}`));
            };
        });
    }
}