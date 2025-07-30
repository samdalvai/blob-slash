import { Asset } from '../types/map';

export default class AssetStore {
    private textures: Map<string, HTMLImageElement>;
    private sounds: Map<string, HTMLAudioElement>;
    private jsons: Map<string, any>;

    private texturesFilePaths: Asset[];
    private soundsFilePaths: Asset[];

    constructor() {
        this.textures = new Map<string, HTMLImageElement>();
        this.sounds = new Map<string, HTMLAudioElement>();
        this.jsons = new Map<string, any>();

        this.texturesFilePaths = [];
        this.soundsFilePaths = [];
    }

    addTexture(assetId: string, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const texture = new Image();
            texture.src = filePath;

            texture.onload = () => {
                console.log('Texture added to the AssetStore with id ' + assetId);
                this.textures.set(assetId, texture);

                if (assetId !== '__default__') {
                    this.texturesFilePaths.push({ assetId, filePath });
                }
                resolve();
            };

            texture.onerror = () => {
                console.error('Failed to load texture ', filePath);
                reject(new Error(`Failed to load texture from ${filePath}`));
            };
        });
    }

    getTexture(assetId: string) {
        const texture = this.textures.get(assetId);

        if (!texture) {
            throw new Error('Could not find texture with asset id: ' + assetId);
        }

        return texture;
    }

    getAllTexturesIds() {
        return Array.from(this.textures.keys());
    }

    addSound(assetId: string, filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const sound = new Audio();
            sound.src = filePath;

            sound.onloadeddata = () => {
                console.log('Sound added to the AssetStore with id ' + assetId);
                this.sounds.set(assetId, sound);
                this.soundsFilePaths.push({ assetId, filePath });
                resolve();
            };

            sound.onerror = () => {
                console.error('Failed to load sound ', filePath);
                reject(new Error(`Failed to load sound from ${filePath}`));
            };
        });
    }

    getSound(assetId: string) {
        const sound = this.sounds.get(assetId);

        if (!sound) {
            throw new Error('Could not find sound with asset id: ' + assetId);
        }

        return sound;
    }

    addJson(assetId: string, filePath: string): Promise<void> {
        return fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch JSON from ${filePath}, status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('JSON added to the AssetStore with id ' + assetId);
                this.jsons.set(assetId, data);
            })
            .catch(error => {
                console.error('Failed to load JSON:', error);
                throw error;
            });
    }

    getJson(assetId: string) {
        const json = this.jsons.get(assetId);

        if (!json) {
            throw new Error('Could not find JSON with asset id: ' + assetId);
        }

        return json;
    }

    getTexturesFilePaths() {
        return this.texturesFilePaths;
    }

    getSoundsFilePaths() {
        return this.soundsFilePaths;
    }

    clear() {
        this.textures.clear();
        this.sounds.clear();
        this.jsons.clear();

        this.texturesFilePaths = [];
        this.soundsFilePaths = [];
    }
}
