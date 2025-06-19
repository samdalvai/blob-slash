import System from '../../core/ecs/System';
import Game from '../../game/Game';

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

        gameWidthInput.value = Game.mapWidth.toString();
        gameHeightInput.value = Game.mapHeight.toString();

        gameWidthInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Game.mapWidth = parseInt(target.value);
        });
        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Game.mapHeight = parseInt(target.value);
        });
    }
}
