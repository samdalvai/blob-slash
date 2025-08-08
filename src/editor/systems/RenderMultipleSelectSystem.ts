import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Editor from '../Editor';

export default class RenderMultipleSelectSystem extends System {
    update = (ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) => {
        if (Editor.multipleSelectStart) {
            const posXStart = (Editor.multipleSelectStart.x - camera.x) * zoom;
            const posYStart = (Editor.multipleSelectStart.y - camera.y) * zoom;
            const posXEnd = (Editor.mousePositionWorld.x - camera.x) * zoom;
            const posYEnd = (Editor.mousePositionWorld.y - camera.y) * zoom;

            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.strokeRect(posXStart, posYStart, posXEnd - posXStart, posYEnd - posYStart);
        }
    };
}
