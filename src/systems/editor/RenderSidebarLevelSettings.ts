import System from '../../ecs/System';

export default class RenderSidebarLevelSettings extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement) {
        const levelSettings = sidebar.querySelector('#level-settings');

        if (!levelSettings) {
            throw new Error('Could not retrieve level settings element');
        }
    }
}
