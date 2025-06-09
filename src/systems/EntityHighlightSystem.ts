import HighlightComponent from '../components/HighlightComponent';
import SpriteComponent from '../components/SpriteComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import Game from '../game/Game';
import {  Vector } from '../types/utils';

export default class EntityHighlightSystem extends System {
    constructor() {
        super();
        this.requireComponent(HighlightComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    update = () => {
        const mouseX = Game.mousePositionWorld.x;
        const mouseY = Game.mousePositionWorld.y;

        for (const entity of this.getSystemEntities()) {
            const highlight = entity.getComponent(HighlightComponent);
            const transform = entity.getComponent(TransformComponent);
            const sprite = entity.getComponent(SpriteComponent);

            if (!highlight || !transform || !transform || !sprite) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const minX = transform.position.x;
            const minY = transform.position.y;

            const maxX = transform.position.x + sprite.width * transform.scale.x;
            const maxY = transform.position.y + sprite.height * transform.scale.y;

            if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
                highlight.isHighlighted = true;
            } else {
                highlight.isHighlighted = false;
            }
        }
    };
}
