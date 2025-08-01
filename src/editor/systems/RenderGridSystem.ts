import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import Editor from '../Editor';

export default class RenderGridSystem extends System {
    constructor() {
        super();
    }

    update = (ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) => {
        if (!Editor.editorSettings.showGrid) {
            return;
        }

        ctx.save();

        ctx.strokeStyle = 'lightgray';
        ctx.lineWidth = 1;

        const gridSize = Editor.editorSettings.gridSquareSide;

        const canvasWidth = ctx.canvas.width;
        const canvasHeight = ctx.canvas.height;

        const worldLeft = camera.x;
        const worldRight = camera.x + canvasWidth / zoom;
        const worldTop = camera.y;
        const worldBottom = camera.y + canvasHeight / zoom;

        const startX = Math.floor(worldLeft / gridSize) * gridSize;
        const endX = Math.ceil(worldRight / gridSize) * gridSize;

        const startY = Math.floor(worldTop / gridSize) * gridSize;
        const endY = Math.ceil(worldBottom / gridSize) * gridSize;

        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo((worldLeft - camera.x) * zoom, (y - camera.y) * zoom);
            ctx.lineTo((worldRight - camera.x) * zoom, (y - camera.y) * zoom);
            ctx.stroke();
        }

        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo((x - camera.x) * zoom, (worldTop - camera.y) * zoom);
            ctx.lineTo((x - camera.x) * zoom, (worldBottom - camera.y) * zoom);
            ctx.stroke();
        }

        ctx.restore();
    };
}
