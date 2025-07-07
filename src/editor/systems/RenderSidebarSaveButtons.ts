import AssetStore from '../../engine/asset-store/AssetStore';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import { saveLevelToJson, saveLevelToLocalStorage } from '../../engine/serialization/persistence';

export default class RenderSidebarSaveButtons extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement, registry: Registry, assetStore: AssetStore) {
        const saveToJsonButton = sidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const saveToLocalButton = sidebar.querySelector('#save-to-local') as HTMLButtonElement;

        if (!saveToJsonButton || !saveToLocalButton) {
            throw new Error('Could not retrieve level save button(s)');
        }

        saveToJsonButton.onclick = () => saveLevelToJson(registry, assetStore);
        saveToLocalButton.onclick = () => saveLevelToLocalStorage('level', registry, assetStore);
    }
}
