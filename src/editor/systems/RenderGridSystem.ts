import { Camera, getCameraBounds, System } from '../../engine';
import Editor from '../Editor';

export default class RenderGridSystem extends System {
    update = (ctx: CanvasRenderingContext2D, camera: Camera, zoom: number) => {
        if (!Editor.editorSettings.showGrid) {
            return;
        }

        const bounds = getCameraBounds(camera);
        const gridSize = Editor.editorSettings.gridSquareSide;
        const startX = Math.floor(bounds.left / gridSize) * gridSize;
        const endX = Math.ceil(bounds.right / gridSize) * gridSize;
        const startY = Math.floor(bounds.bottom / gridSize) * gridSize;
        const endY = Math.ceil(bounds.top / gridSize) * gridSize;

        ctx.save();
        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1 / zoom;

        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(bounds.left, y);
            ctx.lineTo(bounds.right, y);
            ctx.stroke();
        }

        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, bounds.bottom);
            ctx.lineTo(x, bounds.top);
            ctx.stroke();
        }

        ctx.restore();
    };
}
