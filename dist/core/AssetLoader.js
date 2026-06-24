export class AssetLoader {
    constructor() {
        this.images = new Map();
    }
    async load(list) {
        const entries = Object.entries(list);
        await Promise.all(entries.map(([key, src]) => this.loadImage(key, src)));
    }
    get(key) {
        return this.images.get(key);
    }
    loadImage(key, src) {
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
//# sourceMappingURL=AssetLoader.js.map