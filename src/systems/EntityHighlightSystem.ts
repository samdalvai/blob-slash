import BoxColliderComponent from '../components/BoxColliderComponent';
import HighlightableComponent from '../components/HighlightableComponent';
import TransformComponent from '../components/TransformComponent';
import System from '../ecs/System';
import { Rectangle, Vector } from '../types';

export default class EntityHighlightSystem extends System {
    constructor() {
        super();
        this.requireComponent(HighlightableComponent);
        this.requireComponent(TransformComponent);
        this.requireComponent(BoxColliderComponent);
    }

    update = (mousePosition: Vector, camera: Rectangle) => {
        const mouseX = mousePosition.x + camera.x;
        const mouseY = mousePosition.y + camera.y;

        for (const entity of this.getSystemEntities()) {
            const highlight = entity.getComponent(HighlightableComponent);
            const transform = entity.getComponent(TransformComponent);
            const collider = entity.getComponent(BoxColliderComponent);

            if (!highlight || !transform || !transform || !collider) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const minX = transform.position.x + collider.offset.x;
            const minY = transform.position.y + collider.offset.y;

            const maxX = transform.position.x + collider.offset.x + collider.width * transform.scale.x;
            const maxY = transform.position.y + collider.offset.y + collider.height * transform.scale.y;

            if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
                console.log('Is highlighted');
                highlight.isHighlighted = true;
            } else {
                highlight.isHighlighted = false;
            }
        }
    };
}
