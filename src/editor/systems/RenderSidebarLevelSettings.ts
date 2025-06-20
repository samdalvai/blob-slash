import System from '../../engine/ecs/System';
import Engine from '../../engine/Engine';

export default class RenderSidebarLevelSettings extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement) {
        const gameWidthInput = sidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = sidebar.querySelector('#map-height') as HTMLInputElement;

        if (!gameWidthInput || !gameHeightInput) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();

        gameWidthInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapWidth = parseInt(target.value);
        });
        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapHeight = parseInt(target.value);
        });
    }
}
