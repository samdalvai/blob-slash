import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { MouseButton } from '../../engine/types/control';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import { MousePressedEvent, MouseReleasedEvent } from '../../game/events';
import Editor from '../Editor';
import EntitySelectEvent from '../events/EntitySelectEvent';

export default class EntityDragSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event => this.onMousePressed(event, eventBus));
        eventBus.subscribeToEvent(MouseReleasedEvent, this, this.onMouseReleased);
    }

    onMousePressed = (event: MousePressedEvent, eventBus: EventBus) => {
        if (event.button !== MouseButton.LEFT) {
            return;
        }

        let entityClicked = false;

        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (
                event.coordinates.x >= transform.position.x &&
                event.coordinates.x <= transform.position.x + sprite.width * transform.scale.x &&
                event.coordinates.y >= transform.position.y &&
                event.coordinates.y <= transform.position.y + sprite.height * transform.scale.y
            ) {
                entityClicked = true;
                Editor.selectedEntity = entity.getId();
                Editor.entityDragOffset = {
                    x: event.coordinates.x - transform.position.x,
                    y: event.coordinates.y - transform.position.y,
                };
                eventBus.emitEvent(EntitySelectEvent, entity);
            }
        }

        if (!entityClicked) {
            Editor.selectedEntity = null;
        }
    };

    onMouseReleased = () => {
        Editor.entityDragOffset = null;
    };

    update = () => {
        if (!Editor.entityDragOffset || Editor.selectedEntity === null) {
            return;
        }

        for (const entity of this.getSystemEntities()) {
            if (entity.getId() !== Editor.selectedEntity) {
                continue;
            }

            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            transform.position.x = Engine.mousePositionWorld.x - Editor.entityDragOffset.x;
            transform.position.y = Engine.mousePositionWorld.y - Editor.entityDragOffset.y;
        }
    };
}
