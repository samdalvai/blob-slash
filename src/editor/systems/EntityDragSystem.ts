import Engine from '../../engine/Engine';
import Entity from '../../engine/ecs/Entity';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { MouseButton } from '../../engine/types/control';
import { Rectangle } from '../../engine/types/utils';
import { rectanglesOverlap } from '../../engine/utils/rectangle';
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
        shiftPressed: boolean,
    ) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event =>
            this.onMousePressed(event, eventBus, canvas, shiftPressed),
        );
        eventBus.subscribeToEvent(MouseReleasedEvent, this, () => this.onMouseReleased(canvas));
        eventBus.subscribeToEvent(MouseMoveEvent, this, () => this.onMouseMove(entityEditor));
    }

    onMousePressed = (
        event: MousePressedEvent,
        eventBus: EventBus,
        canvas: HTMLCanvasElement,
        shiftPressed: boolean,
    ) => {
        if (
            Engine.mousePositionScreen.x < canvas.getBoundingClientRect().x ||
            Engine.mousePositionScreen.x > canvas.getBoundingClientRect().x + canvas.getBoundingClientRect().width ||
            Engine.mousePositionScreen.y > canvas.getBoundingClientRect().height ||
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
                return entityA.transform.position.y - entityB.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        if (!shiftPressed) {
            let entityClicked = false;

            for (const entity of renderableEntities) {
                const sprite = entity.sprite;
                const transform = entity.transform;

                if (
                    event.coordinates.x >= transform.position.x &&
                    event.coordinates.x <= transform.position.x + sprite.width * transform.scale.x &&
                    event.coordinates.y >= transform.position.y &&
                    event.coordinates.y <= transform.position.y + sprite.height * transform.scale.y
                ) {
                    if (Editor.selectedEntities.length === 0 || !this.isEntitySelected(entity.entity)) {
                        eventBus.emitEvent(EntitySelectEvent, entity.entity);
                        Editor.selectedEntities = [entity.entity];
                    }

                    entityClicked = true;
                    Editor.entityDragStart = {
                        x: event.coordinates.x,
                        y: event.coordinates.y,
                    };
                    Editor.isDragging = true;

                    continue;
                }
            }

            if (!entityClicked) {
                Editor.selectedEntities.length = 0;
            }
        } else {
            // Select multiple behaviour
            Editor.multipleSelectStart = {
                x: event.coordinates.x,
                y: event.coordinates.y,
            };
        }
    };

    onMouseReleased = (canvas: HTMLCanvasElement) => {
        if (
            Engine.mousePositionScreen.x < canvas.getBoundingClientRect().x ||
            Engine.mousePositionScreen.x > canvas.getBoundingClientRect().x + canvas.getBoundingClientRect().width ||
            Engine.mousePositionScreen.y > canvas.getBoundingClientRect().height
        ) {
            return;
        }

        if (!Editor.multipleSelectStart) {
            Editor.entityDragStart = null;
            Editor.isDragging = false;
        } else {
            // Select multiple behaviour
            const overlappingEnties: Entity[] = [];

            for (const entity of this.getSystemEntities()) {
                const sprite = entity.getComponent(SpriteComponent);
                const transform = entity.getComponent(TransformComponent);

                if (!sprite || !transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                const spriteRect: Rectangle = {
                    x: transform.position.x,
                    y: transform.position.y,
                    width: sprite.width * transform.scale.x,
                    height: sprite.height * transform.scale.y,
                };

                const selectionXStart = Editor.multipleSelectStart.x;
                const selectionYStart = Editor.multipleSelectStart.y;
                const selectionXEnd = Editor.mousePositionWorld.x;
                const selectionYEnd = Editor.mousePositionWorld.y;

                const rectSelection: Rectangle = {
                    x: selectionXStart < selectionXEnd ? selectionXStart : selectionXEnd,
                    y: selectionYStart < selectionYEnd ? selectionYStart : selectionYEnd,
                    width: Math.abs(selectionXEnd - selectionXStart),
                    height: Math.abs(selectionYEnd - selectionYStart),
                };

                if (rectanglesOverlap(rectSelection, spriteRect)) {
                    overlappingEnties.push(entity);
                }
            }

            if (overlappingEnties.length > 0) {
                Editor.selectedEntities = overlappingEnties;
            }

            Editor.multipleSelectStart = null;
        }
    };

    onMouseMove = (entityEditor: EntityEditor) => {
        // console.log('Entity drag start: ', Editor.entityDragStart);
        if (Editor.entityDragStart && Editor.selectedEntities.length > 0) {
            if (Editor.editorSettings.snapToGrid) {
                // TODO: implement logic for grid snapping
                // Idea: 
                // take the entity in the left upper corner
                // compute the difference needed for that entity to snap to the nearest square to the mouse position
                // translate all entities by that difference

                return;
            }

            const diffX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
            const diffY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);

            for (const entity of Editor.selectedEntities) {
                const sprite = entity.getComponent(SpriteComponent);
                const transform = entity.getComponent(TransformComponent);
                if (!sprite || !transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                const newPositionX = transform.position.x + diffX;
                const newPositionY = transform.position.y + diffY;
                this.updateEntityPosition(entity, transform, newPositionX, newPositionY, entityEditor);
            }

            Editor.entityDragStart.x = Editor.mousePositionWorld.x;
            Editor.entityDragStart.y = Editor.mousePositionWorld.y;
        }

        // TODO: handle dragging multiple entities
        // if (Editor.isDragging && Editor.entityDragStart && Editor.selectedEntity) {
        //     for (const entity of this.getSystemEntities()) {
        //         if (entity.getId() !== Editor.selectedEntities.getId()) {
        //             continue;
        //         }
        //         const sprite = entity.getComponent(SpriteComponent);
        //         const transform = entity.getComponent(TransformComponent);
        //         if (!sprite || !transform) {
        //             throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
        //         }
        //         if (Editor.editorSettings.snapToGrid) {
        //             const newPositionX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
        //             const newPositionY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);
        //             const nearestGridX =
        //                 Math.floor(newPositionX / Editor.editorSettings.gridSquareSide) *
        //                 Editor.editorSettings.gridSquareSide;
        //             const nearestGridY =
        //                 Math.floor(newPositionY / Editor.editorSettings.gridSquareSide) *
        //                 Editor.editorSettings.gridSquareSide;
        //             this.updateEntityPosition(entity, transform, nearestGridX, nearestGridY, entityEditor);
        //             return;
        //         }
        //         const newPositionX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
        //         const newPositionY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);
        //         this.updateEntityPosition(entity, transform, newPositionX, newPositionY, entityEditor);
        //     }
        // }
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

    private isEntitySelected = (entity: Entity) => {
        for (const selectedEntity of Editor.selectedEntities) {
            if (selectedEntity.getId() === entity.getId()) {
                console.log('is selected');
                return true;
            }
        }

        return false;
    };
}
