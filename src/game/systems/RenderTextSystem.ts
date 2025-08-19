import System from '../../engine/ecs/System';
import { Rectangle } from '../../engine/types/utils';
import { TransformComponent } from '../components';
import TextLabelComponent from '../components/TextLabelComponent';

export default class RenderTextSystem extends System {
    constructor() {
        super();
        this.requireComponent(TextLabelComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom = 1) {
        for (const entity of this.getSystemEntities()) {
            const textlabel = entity.getComponent(TextLabelComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!textlabel || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            ctx.fillStyle = `rgb(${textlabel.color.r},${textlabel.color.g},${textlabel.color.b})`;
            ctx.font = textlabel.fontSize * zoom + 'px ' + textlabel.fontFamily;

            const textX = (transform.position.x + textlabel.offset.x - camera.x) * zoom;
            const textY = (transform.position.y + textlabel.offset.y - camera.y) * zoom;

            // TODO: bring this logic to the transform component
            // const textX = textlabel.position.x - (textlabel.isFixed ? 0 : camera.x);
            // const textY = textlabel.position.y - (textlabel.isFixed ? 0 : camera.y);

            ctx.fillText(textlabel.text, textX, textY);
        }
    }
}
