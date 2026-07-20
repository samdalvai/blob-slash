import { System } from '../../engine';
import Editor from '../Editor';

export default class RenderMultipleSelectSystem extends System {
    update = (ctx: CanvasRenderingContext2D, zoom: number) => {
        if (!Editor.multipleSelectStart) {
            return;
        }

        const left = Math.min(Editor.multipleSelectStart.x, Editor.mousePositionWorld.x);
        const right = Math.max(Editor.multipleSelectStart.x, Editor.mousePositionWorld.x);
        const bottom = Math.min(Editor.multipleSelectStart.y, Editor.mousePositionWorld.y);
        const top = Math.max(Editor.multipleSelectStart.y, Editor.mousePositionWorld.y);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(left, bottom, right - left, top - bottom);
    };
}
