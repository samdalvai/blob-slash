import {
    DEFAULT_SPRITE,
    Engine,
    Entity,
    EventBus,
    MouseButton,
    System,
    WorldBounds,
    getSpriteBounds,
    worldBoundsOverlap,
} from '../../engine';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import { KeyPressedEvent, MouseMoveEvent, MousePressedEvent, MouseReleasedEvent } from '../../game/events';
import Editor from '../Editor';
import EntityEditor from '../entity-editor/EntityEditor';
import EntitySelectEvent from '../events/EntitySelectEvent';

export default class EntityDragSystem extends System {
    constructor() {
        super();
        this.requireComponent(TransformComponent);
    }

    subscribeToEvents(
        eventBus: EventBus,
        canvas: HTMLCanvasElement,
        entityEditor: EntityEditor,
        shiftPressed: boolean,
        commandPressed: boolean,
    ) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event =>
            this.onMousePressed(event, eventBus, canvas, shiftPressed),
        );
        eventBus.subscribeToEvent(MouseReleasedEvent, this, event =>
            this.onMouseReleased(event, canvas, eventBus, commandPressed),
        );
        eventBus.subscribeToEvent(MouseMoveEvent, this, () => this.onMouseMove(entityEditor));
        eventBus.subscribeToEvent(KeyPressedEvent, this, event => this.onKeyboardPressed(event, eventBus));
    }

    onMousePressed = (
        event: MousePressedEvent,
        eventBus: EventBus,
        canvas: HTMLCanvasElement,
        shiftPressed: boolean,
    ) => {
        if (
            Engine.mousePositionScreen.x < 0 ||
            Engine.mousePositionScreen.x > canvas.width ||
            Engine.mousePositionScreen.y < 0 ||
            Engine.mousePositionScreen.y > canvas.height ||
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
            const transform = entity.getComponent(TransformComponent);

            if (!transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            if (entity.hasComponent(SpriteComponent)) {
                const sprite = entity.getComponent(SpriteComponent);
                if (!sprite) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                renderableEntities.push({ entity, sprite, transform });
                continue;
            }

            const mockSprite = new SpriteComponent(DEFAULT_SPRITE, 32, 32, 0);
            renderableEntities.push({ entity, sprite: mockSprite, transform });
        }

        renderableEntities.sort((entityA, entityB) => {
            if (entityA.sprite.zIndex === entityB.sprite.zIndex) {
                return entityB.transform.position.y - entityA.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

        let entityClicked = false;

        if (!shiftPressed) {
            for (const entity of renderableEntities) {
                const sprite = entity.sprite;
                const transform = entity.transform;

                const bounds = getSpriteBounds(
                    transform.position,
                    { width: sprite.width, height: sprite.height },
                    transform.scale,
                );

                if (
                    event.coordinates.x >= bounds.left &&
                    event.coordinates.x <= bounds.right &&
                    event.coordinates.y >= bounds.bottom &&
                    event.coordinates.y <= bounds.top
                ) {
                    if (Editor.selectedEntities.length === 0 || !this.isEntitySelected(entity.entity)) {
                        Editor.selectedEntities = [entity.entity];
                        eventBus.emitEvent(EntitySelectEvent, [entity.entity]);
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
        }

        if (!entityClicked) {
            Editor.selectedEntities.length = 0;
            eventBus.emitEvent(EntitySelectEvent, []);
        }

        if (!entityClicked || shiftPressed) {
            Editor.multipleSelectStart = {
                x: event.coordinates.x,
                y: event.coordinates.y,
            };
        }
    };

    onMouseReleased = (
        event: MouseReleasedEvent,
        canvas: HTMLCanvasElement,
        eventBus: EventBus,
        commandPressed: boolean,
    ) => {
        // TODO: if command remains pressed and we paste entities the entity is not pasted
        // check if command pressed is used to allow dragging map
        if (
            Engine.mousePositionScreen.x < 0 ||
            Engine.mousePositionScreen.x > canvas.width ||
            Engine.mousePositionScreen.y < 0 ||
            Engine.mousePositionScreen.y > canvas.height ||
            event.button !== MouseButton.LEFT ||
            commandPressed
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
                const transform = entity.getComponent(TransformComponent);

                if (!transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                let spriteWidth = 32;
                let spriteHeight = 32;

                if (entity.hasComponent(SpriteComponent)) {
                    const sprite = entity.getComponent(SpriteComponent);
                    if (!sprite) {
                        throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                    }
                    spriteWidth = sprite.width;
                    spriteHeight = sprite.height;
                }

                const spriteBounds = getSpriteBounds(
                    transform.position,
                    { width: spriteWidth, height: spriteHeight },
                    transform.scale,
                );

                const selectionXStart = Editor.multipleSelectStart.x;
                const selectionYStart = Editor.multipleSelectStart.y;
                const selectionXEnd = Editor.mousePositionWorld.x;
                const selectionYEnd = Editor.mousePositionWorld.y;

                const selectionBounds: WorldBounds = {
                    left: Math.min(selectionXStart, selectionXEnd),
                    right: Math.max(selectionXStart, selectionXEnd),
                    bottom: Math.min(selectionYStart, selectionYEnd),
                    top: Math.max(selectionYStart, selectionYEnd),
                };

                if (worldBoundsOverlap(selectionBounds, spriteBounds)) {
                    overlappingEnties.push(entity);
                }
            }

            if (overlappingEnties.length > 0) {
                Editor.selectedEntities = overlappingEnties;
                eventBus.emitEvent(EntitySelectEvent, overlappingEnties);
            }

            Editor.multipleSelectStart = null;
        }
    };

    onMouseMove = (entityEditor: EntityEditor) => {
        if (!Editor.entityDragStart || Editor.selectedEntities.length === 0) {
            return;
        }

        if (Editor.editorSettings.snapToGrid) {
            // Logic for snapping multiple entities to grid:
            // * take the lower-left centre position in the group
            // * compute the difference needed for that entity to snap to the nearest square to the current mouse position
            // * translate all entities by that difference

            // TODO: can we improve this by selecting the entity nearest to the mouse position? See commit 989c5dd for example
            const gridSize = Editor.editorSettings.gridSquareSide;
            const gridHalfSize = gridSize / 2;
            const nearestGridX = Math.floor(Engine.mousePositionWorld.x / gridSize) * gridSize + gridHalfSize;
            const nearestGridY = Math.floor(Engine.mousePositionWorld.y / gridSize) * gridSize + gridHalfSize;

            let minTransformPositionX = Number.MAX_VALUE;
            let minTransformPositionY = Number.MAX_VALUE;

            for (const entity of Editor.selectedEntities) {
                const transform = entity.getComponent(TransformComponent);
                if (!transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                if (minTransformPositionX > transform.position.x) {
                    minTransformPositionX = transform.position.x;
                }

                if (minTransformPositionY > transform.position.y) {
                    minTransformPositionY = transform.position.y;
                }
            }

            const diffX = nearestGridX - minTransformPositionX;
            const diffY = nearestGridY - minTransformPositionY;

            for (const entity of Editor.selectedEntities) {
                const transform = entity.getComponent(TransformComponent);
                if (!transform) {
                    throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
                }

                this.updateEntityPosition(
                    entity,
                    transform,
                    transform.position.x + diffX,
                    transform.position.y + diffY,
                    entityEditor,
                );
            }

            return;
        }

        const diffX = Math.floor(Engine.mousePositionWorld.x - Editor.entityDragStart.x);
        const diffY = Math.floor(Engine.mousePositionWorld.y - Editor.entityDragStart.y);

        for (const entity of Editor.selectedEntities) {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const newPositionX = transform.position.x + diffX;
            const newPositionY = transform.position.y + diffY;
            this.updateEntityPosition(entity, transform, newPositionX, newPositionY, entityEditor);
        }

        Editor.entityDragStart.x += diffX;
        Editor.entityDragStart.y += diffY;
    };

    onKeyboardPressed(event: KeyPressedEvent, eventBus: EventBus): void {
        if (event.keyCode === 'Escape') {
            Editor.selectedEntities.length = 0;
            eventBus.emitEvent(EntitySelectEvent, []);
        }
    }

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
            return;
        }

        positionXInput.value = transform.position.x.toString();
        positionYInput.value = transform.position.y.toString();

        entityEditor.saveLevel();
    };

    private isEntitySelected = (entity: Entity) => {
        for (const selectedEntity of Editor.selectedEntities) {
            if (selectedEntity.getId() === entity.getId()) {
                return true;
            }
        }

        return false;
    };
}
