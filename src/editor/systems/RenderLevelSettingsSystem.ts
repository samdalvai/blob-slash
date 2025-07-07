import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import Editor from '../Editor';

export default class RenderLevelSettingsSystem extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement) {
        const gameWidthInput = sidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = sidebar.querySelector('#map-height') as HTMLInputElement;
        const snapGridInput = sidebar.querySelector('#snap-grid') as HTMLInputElement;
        const showGridInput = sidebar.querySelector('#show-grid') as HTMLInputElement;
        const gridSideInput = sidebar.querySelector('#grid-side') as HTMLInputElement;

        if (!gameWidthInput || !gameHeightInput || !snapGridInput || !showGridInput || !gridSideInput) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();
        snapGridInput.checked = Editor.snapToGrid;
        showGridInput.checked = Editor.showGrid;
        gridSideInput.value = Editor.gridSquareSide.toString();

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

        showGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.showGrid = target.checked;
        });

        gridSideInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.gridSquareSide = parseInt(target.value);
        });
    }
}
