import Engine from '../../engine/Engine';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { MouseButton } from '../../engine/types/control';
import { Rectangle } from '../../engine/types/utils';
import SpriteComponent from '../../game/components/SpriteComponent';
import TransformComponent from '../../game/components/TransformComponent';
import MousePressedEvent from '../../game/events/MousePressedEvent';
import Editor from '../Editor';
import EntitySelectEvent from '../events/EntitySelectEvent';

export default class RenderSpriteBoxSystem extends System {
    constructor() {
        super();
        this.requireComponent(SpriteComponent);
        this.requireComponent(TransformComponent);
    }

    subscribeToEvents(eventBus: EventBus) {
        eventBus.subscribeToEvent(MousePressedEvent, this, event => this.onMouseClicked(event, eventBus));
    }

    onMouseClicked = (event: MousePressedEvent, eventBus: EventBus) => {
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
                eventBus.emitEvent(EntitySelectEvent, entity);
            }
        }

        if (!entityClicked) {
            Editor.selectedEntity = null;
        }
    };

    update(ctx: CanvasRenderingContext2D, camera: Rectangle, zoom: number) {
        // Traverse entities backwards to highlight the ones in front
        for (let i = this.getSystemEntities().length - 1; i >= 0; i--) {
            const entity = this.getSystemEntities()[i];
            const sprite = entity.getComponent(SpriteComponent);
            const transform = entity.getComponent(TransformComponent);

            if (!sprite || !transform) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            // Bypass rendering if entities are outside the camera view
            // const isOutsideCameraView =
            //     transform.position.x + transform.scale.x * sprite.width < camera.x ||
            //     transform.position.x > camera.x + camera.width ||
            //     transform.position.y + transform.scale.y * sprite.height < camera.y ||
            //     transform.position.y > camera.y + camera.height;

            // if (isOutsideCameraView) {
            //     continue;
            // }

            const spriteRect: Rectangle = {
                x: (transform.position.x - camera.x) * zoom,
                y: (transform.position.y - camera.y) * zoom,
                width: sprite.width * transform.scale.x * zoom,
                height: sprite.height * transform.scale.y * zoom,
            };

            if (Editor.selectedEntity !== null && Editor.selectedEntity === entity.getId()) {
                ctx.save();
                ctx.strokeStyle = 'green';
                ctx.lineWidth = 4;
                ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                ctx.restore();
            }

            if (
                Engine.mousePositionWorld.x >= transform.position.x &&
                Engine.mousePositionWorld.x <= transform.position.x + sprite.width * transform.scale.x &&
                Engine.mousePositionWorld.y >= transform.position.y &&
                Engine.mousePositionWorld.y <= transform.position.y + sprite.height * transform.scale.y
            ) {
                ctx.save();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.strokeRect(spriteRect.x, spriteRect.y, spriteRect.width, spriteRect.height);
                ctx.restore();
            }
        }
    }
}
