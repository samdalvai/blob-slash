import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import Editor from '../Editor';

export default class RenderSidebarLevelSettings extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement) {
        const gameWidthInput = sidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = sidebar.querySelector('#map-height') as HTMLInputElement;
        const snapGridInput = sidebar.querySelector('#snap-grid') as HTMLInputElement;

        if (!gameWidthInput || !gameHeightInput || !snapGridInput) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();
        snapGridInput.checked = Editor.snapToGrid;

        gameWidthInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapWidth = parseInt(target.value);
        });
        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapHeight = parseInt(target.value);
        });
        snapGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.snapToGrid = target.checked;
        });
    }
}
