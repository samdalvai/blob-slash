import Engine from '../../engine/Engine';
import Entity from '../../engine/ecs/Entity';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { MouseButton } from '../../engine/types/control';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import { MouseMoveEvent, MousePressedEvent, MouseReleasedEvent } from '../../game/events';
import Editor from '../Editor';
import EntityEditor from '../entity-editor/EntityEditor';
import EntitySelectEvent from '../events/EntitySelectEvent';

export default class EntityDragSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(
        eventBus: EventBus,
        canvas: HTMLCanvasElement,
        entityEditor: EntityEditor,
        mousePressed: boolean,
    ) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event => this.onMousePressed(event, eventBus, canvas));
        eventBus.subscribeToEvent(MouseReleasedEvent, this, this.onMouseReleased);
        eventBus.subscribeToEvent(MouseMoveEvent, this, event => this.onMouseMove(event, entityEditor, mousePressed));
    }

    onMousePressed = (event: MousePressedEvent, eventBus: EventBus, canvas: HTMLCanvasElement) => {
        if (
            Engine.mousePositionScreen.x < canvas.getBoundingClientRect().x ||
            Engine.mousePositionScreen.x > canvas.getBoundingClientRect().x + canvas.getBoundingClientRect().width ||
            event.button !== MouseButton.LEFT
        ) {
            return;
        }

        const renderableEntities: {
            entity: Entity;
            sprite: SpriteComponent;
            transform: TransformComponent;
        }[] = [];

        for (const entity of this.getSystemEntities()) {
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            renderableEntities.push({ entity, sprite, transform });
        }

        renderableEntities.sort((entityA, entityB) => {
            if (entityA.sprite.zIndex === entityB.sprite.zIndex) {
                return entityB.transform.position.y - entityA.transform.position.y;
            }

            return entityB.sprite.zIndex - entityA.sprite.zIndex;
        });

        let entityClicked = false;

        for (const renderableEntity of renderableEntities) {
            const sprite = renderableEntity.sprite;
            const transform = renderableEntity.transform;

            if (
                event.coordinates.x >= transform.position.x &&
                event.coordinates.x <= transform.position.x + sprite.width * transform.scale.x &&
                event.coordinates.y >= transform.position.y &&
                event.coordinates.y <= transform.position.y + sprite.height * transform.scale.y
            ) {
                if (Editor.selectedEntity?.getId() !== renderableEntity.entity.getId()) {
                    eventBus.emitEvent(EntitySelectEvent, renderableEntity.entity);
                }

                Editor.selectedEntity = renderableEntity.entity;
                Editor.entityDragStart = {
                    x: event.coordinates.x - transform.position.x,
                    y: event.coordinates.y - transform.position.y,
                };
                entityClicked = true;
                break;
            }
        }

        if (!entityClicked) {
            Editor.selectedEntity = null;
        }
    };

    onMouseReleased = () => {
        Editor.entityDragStart = null;
    };

    onMouseMove = (event: MouseMoveEvent, entityEditor: EntityEditor, mousePressed: boolean) => {
        if (mousePressed && Editor.entityDragStart && Editor.selectedEntity !== null) {
            for (const entity of this.getSystemEntities()) {
                if (entity.getId() !== Editor.selectedEntity.getId()) {
                    continue;
                }

                const sprite = entity.getComponent(SpriteComponent);
                const transform = entity.getComponent(TransformComponent);

                if (!sprite || !transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                if (Editor.editorSettings.snapToGrid) {
                    const newPositionX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
                    const newPositionY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);

                    const nearestGridX =
                        Math.floor(newPositionX / Editor.editorSettings.gridSquareSide) *
                        Editor.editorSettings.gridSquareSide;
                    const nearestGridY =
                        Math.floor(newPositionY / Editor.editorSettings.gridSquareSide) *
                        Editor.editorSettings.gridSquareSide;

                    this.updateEntityPosition(entity, transform, nearestGridX, nearestGridY, entityEditor);

                    return;
                }

                const newPositionX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
                const newPositionY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);
                this.updateEntityPosition(entity, transform, newPositionX, newPositionY, entityEditor);
            }
        }
    };

    private updateEntityPosition = (
        entity: Entity,
        transform: TransformComponent,
        newPositionX: number,
        newPositionY: number,
        entityEditor: EntityEditor,
    ) => {
        if (transform.position.x === newPositionX && transform.position.y === newPositionY) {
            return;
        }

        transform.position.x = newPositionX;
        transform.position.y = newPositionY;

        // Update leftSidebar component position for the entity
        const positionXInput = document.getElementById('position-x-' + entity.getId()) as HTMLInputElement;
        const positionYInput = document.getElementById('position-y-' + entity.getId()) as HTMLInputElement;

        if (!positionXInput || !positionYInput) {
            throw new Error('Could not get position inputs for entity ' + entity.getId());
        }

        positionXInput.value = transform.position.x.toString();
        positionYInput.value = transform.position.y.toString();

        entityEditor.saveLevel();
    };
}
