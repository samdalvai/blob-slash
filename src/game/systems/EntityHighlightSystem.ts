import HighlightComponent from '../components/HighlightComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import { getSpriteBounds, System, Engine } from '../../engine';

export default class EntityHighlightSystem extends System {
    constructor() {
        super();
        this.requireComponent(HighlightComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update = () => {
        const mouseX = Engine.mousePositionWorld.x;
        const mouseY = Engine.mousePositionWorld.y;

        for (const entity of this.getSystemEntities()) {
            const highlight = entity.getComponent(HighlightComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!highlight || !transform || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const bounds = getSpriteBounds(
                transform.position,
                { width: sprite.width, height: sprite.height },
                transform.scale,
            );

            if (mouseX >= bounds.left && mouseX <= bounds.right && mouseY >= bounds.bottom && mouseY <= bounds.top) {
                highlight.isHighlighted = true;
            } else {
                highlight.isHighlighted = false;
            }
        }
    };
}
