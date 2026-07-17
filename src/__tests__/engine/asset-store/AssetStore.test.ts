import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';

import AssetStore from '../../../engine/asset-store/AssetStore';
import { DEFAULT_SPRITE } from '../../../engine/utils/constants';

class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private value = '';

    set src(value: string) {
        this.value = value;
        queueMicrotask(() => this.onload?.());
    }

    get src() {
        return this.value;
    }
}

describe('AssetStore built-in assets', () => {
    const originalImage = globalThis.Image;

    beforeEach(() => {
        globalThis.Image = MockImage as unknown as typeof Image;
    });

    afterEach(() => {
        globalThis.Image = originalImage;
    });

    test('keeps the built-in default texture after level assets are cleared', async () => {
        const assetStore = new AssetStore();

        await assetStore.initialize();
        const defaultTexture = assetStore.getTexture(DEFAULT_SPRITE);
        await assetStore.addTexture('level-texture', 'assets/sprites/level.png');

        expect(assetStore.getAllTexturesIds()).toEqual([DEFAULT_SPRITE, 'level-texture']);
        expect(assetStore.getTexture('missing-texture')).toBe(defaultTexture);
        expect(assetStore.getTexturesFilePaths()).toEqual([{ assetId: 'level-texture', filePath: 'assets/sprites/level.png' }]);

        assetStore.clear();

        expect(assetStore.getAllTexturesIds()).toEqual([DEFAULT_SPRITE]);
        expect(assetStore.getTexture(DEFAULT_SPRITE)).toBe(defaultTexture);
        expect(assetStore.getTexture('missing-texture')).toBe(defaultTexture);
        expect(assetStore.getTexturesFilePaths()).toEqual([]);
    });
});
