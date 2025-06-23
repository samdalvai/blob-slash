import Engine from '../../engine/Engine';
import Entity from '../../engine/ecs/Entity';
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

            const mousePositionX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragOffset.x);
            const mousePositionY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragOffset.y);

            if (Editor.snapToGrid) {
                const diffX = mousePositionX % Editor.gridSquareSide;
                const diffY = mousePositionY % Editor.gridSquareSide;

                if (diffX <= Editor.gridSquareSide / 2 || diffY <= Editor.gridSquareSide / 2) {
                    this.updateEntityPosition(entity, transform, mousePositionX - diffX, mousePositionY - diffY);
                    return;
                }
            }

            this.updateEntityPosition(entity, transform, mousePositionX, mousePositionY);
        }
    };

    private updateEntityPosition = (
        entity: Entity,
        transform: TransformComponent,
        newPositionX: number,
        newPositionY: number,
    ) => {
        transform.position.x = newPositionX;
        transform.position.y = newPositionY;

        // Update sidebar component position for the entity
        const positionXInput = document.getElementById('position-x-' + entity.getId()) as HTMLInputElement;
        const positionYInput = document.getElementById('position-y-' + entity.getId()) as HTMLInputElement;

        if (!positionXInput || !positionYInput) {
            throw new Error('Could not get position inputs for entity ' + entity.getId());
        }

        positionXInput.value = transform.position.x.toString();
        positionYInput.value = transform.position.y.toString();
    };
}
