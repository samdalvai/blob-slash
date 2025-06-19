import Registry from '../../core/ecs/Registry';
import System from '../../core/ecs/System';
import { saveLevelToJson, saveLevelToLocalStorage } from '../../core/serialization/persistence';

export default class RenderSidebarSaveButtons extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement, registry: Registry) {
        const saveToJsonButton = sidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const saveToLocalButton = sidebar.querySelector('#save-to-local') as HTMLButtonElement;

        if (!saveToJsonButton || !saveToLocalButton) {
            throw new Error('Could not retrieve level save button(s)');
        }

        saveToJsonButton.onclick = () => saveLevelToJson(registry);
        saveToLocalButton.onclick = () => saveLevelToLocalStorage(registry);
    }
}
