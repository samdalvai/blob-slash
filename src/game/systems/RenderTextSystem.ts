import { System } from '../../engine';
import { TransformComponent } from '../components';
import TextLabelComponent from '../components/TextLabelComponent';

export default class RenderTextSystem extends System {
    constructor() {
        super();
        this.requireComponent(TextLabelComponent);
        this.requireComponent(TransformComponent);
    }

    update(ctx: CanvasRenderingContext2D) {
        for (const entity of this.getSystemEntities()) {
            const textlabel = entity.getComponent(TextLabelComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!textlabel || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            ctx.save();
            if (transform.isFixed) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }

            ctx.translate(transform.position.x + textlabel.offset.x, transform.position.y + textlabel.offset.y);
            // Keep glyphs upright while the enclosing world pass uses Y-up.
            ctx.scale(1, -1);
            ctx.fillStyle = `rgb(${textlabel.color.r},${textlabel.color.g},${textlabel.color.b})`;
            ctx.font = textlabel.fontSize + 'px ' + textlabel.fontFamily;
            ctx.fillText(textlabel.text, 0, 0);
            ctx.restore();
        }
    }
}
