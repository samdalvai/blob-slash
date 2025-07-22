import AssetStore from '../../engine/asset-store/AssetStore';
import Registry from '../../engine/ecs/Registry';
import { saveCurrentLevelToLocalStorage } from '../../engine/serialization/persistence';
import Editor from '../Editor';

export default class EntityEditor {
    private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private registry: Registry;
    private assetStore: AssetStore;

    constructor(registry: Registry, assetStore: AssetStore) {
        this.registry = registry;
        this.assetStore = assetStore;
    }

    public saveWithDebounce = () => {
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }

        this.saveDebounceTimer = setTimeout(() => {
            saveCurrentLevelToLocalStorage(Editor.editorSettings.selectedLevel, this.registry, this.assetStore);
        }, 300);
    };
}
