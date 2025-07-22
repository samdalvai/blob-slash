import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { saveCurrentLevelToLocalStorage } from '../../engine/serialization/persistence';
import { MouseButton } from '../../engine/types/control';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import { MousePressedEvent, MouseReleasedEvent } from '../../game/events';
import Editor from '../Editor';
import EntitySelectEvent from '../events/EntitySelectEvent';

export default class EntityDragSystem extends System {
    private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

    // TODO: extact this logic into a class
    private saveWithDebounce = (registry: Registry, assetStore: AssetStore) => {
        if (this.saveDebounceTimer) clearTimeout(this.saveDebounceTimer);
        this.saveDebounceTimer = setTimeout(() => {
            saveCurrentLevelToLocalStorage(Editor.editorSettings.selectedLevel, registry, assetStore);
        }, 300);
    };

    constructor() {
        super();
        this.requireComponent(TransformComponent);
        this.requireComponent(SpriteComponent);
    }

    subscribeToEvents(eventBus: EventBus, canvas: HTMLCanvasElement) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event => this.onMousePressed(event, eventBus, canvas));
        eventBus.subscribeToEvent(MouseReleasedEvent, this, this.onMouseReleased);
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
                return entityA.transform.position.y - entityB.transform.position.y;
            }

            return entityA.sprite.zIndex - entityB.sprite.zIndex;
        });

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
                if (Editor.selectedEntity !== entity.entity.getId()) {
                    eventBus.emitEvent(EntitySelectEvent, entity.entity);
                }

                entityClicked = true;
                Editor.selectedEntity = entity.entity.getId();
                Editor.entityDragOffset = {
                    x: event.coordinates.x - transform.position.x,
                    y: event.coordinates.y - transform.position.y,
                };

                continue;
            }
        }

        if (!entityClicked) {
            Editor.selectedEntity = null;
        }
    };

    onMouseReleased = () => {
        Editor.entityDragOffset = null;
    };

    update = (canvasXMin: number, canvasXMax: number, registry: Registry, assetStore: AssetStore) => {
        if (
            !Editor.entityDragOffset ||
            Editor.selectedEntity === null ||
            Engine.mousePositionScreen.x < canvasXMin ||
            Engine.mousePositionScreen.x > canvasXMax
        ) {
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

            if (Editor.editorSettings.snapToGrid) {
                const diffX = Engine.mousePositionWorld.x % Editor.editorSettings.gridSquareSide;
                const diffY = Engine.mousePositionWorld.y % Editor.editorSettings.gridSquareSide;

                this.updateEntityPosition(
                    entity,
                    registry,
                    assetStore,
                    transform,
                    Engine.mousePositionWorld.x - diffX,
                    Engine.mousePositionWorld.y - diffY,
                );
                return;
            }

            this.updateEntityPosition(entity, registry, assetStore, transform, mousePositionX, mousePositionY);
        }
    };

    private updateEntityPosition = (
        entity: Entity,
        registry: Registry,
        assetStore: AssetStore,
        transform: TransformComponent,
        newPositionX: number,
        newPositionY: number,
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

        this.saveWithDebounce(registry, assetStore);
    };
}
