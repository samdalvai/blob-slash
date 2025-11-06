import AssetStore from '../../engine/asset-store/AssetStore';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import LevelManager from '../../engine/level-manager/LevelManager';
import { GameStatus, Rectangle } from '../../engine/types/utils';
import Game from '../Game';
import { MousePressedEvent } from '../events';

export default class RenderMenuSystem extends System {
    registry: Registry;
    assetStore: AssetStore;
    levelManager: LevelManager;

    constructor(registry: Registry, assetStore: AssetStore, levelManager: LevelManager) {
        super();
        this.registry = registry;
        this.assetStore = assetStore;
        this.levelManager = levelManager;
    }

    subscribeToEvents = (eventBus: EventBus) => {
        eventBus.subscribeToEvent(MousePressedEvent, this, this.onMouseClick);
    };

    async onMouseClick(event: MousePressedEvent) {
        const buttonX1 = Game.windowWidth / 2 - 125;
        const buttonX2 = buttonX1 + 250;
        const buttonY1 = Game.windowHeight / 2 - 50;
        const buttonY2 = buttonY1 + 100;

        if (
            event.coordinates.x >= buttonX1 &&
            event.coordinates.x <= buttonX2 &&
            event.coordinates.y >= buttonY1 &&
            event.coordinates.y <= buttonY2
        ) {
            await this.levelManager.addLevelToAssets('grass', '/assets/levels/grass.json');
            await this.levelManager.loadLevelFromAssets('grass')
            Game.gameStatus = GameStatus.PLAYING;
        }
    }

    update(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, Game.windowWidth, Game.windowHeight);

        const buttonRect: Rectangle = {
            x: Game.windowWidth / 2 - 125,
            y: Game.windowHeight / 2 - 50,
            width: 250,
            height: 100,
        };

        if (Game.gameStatus === GameStatus.WON) {
            const colorWin = { r: 100, g: 255, b: 100 };
            ctx.fillStyle = `rgb(${colorWin.r},${colorWin.g},${colorWin.b})`;
            ctx.font = '40px Arial';
            ctx.fillText('Game won!!', buttonRect.x + 15, buttonRect.y - 50);
        } else {
            const colorLost = { r: 255, g: 50, b: 50 };
            ctx.fillStyle = `rgb(${colorLost.r},${colorLost.g},${colorLost.b})`;
            ctx.font = '40px Arial';
            ctx.fillText('Game lost!!', buttonRect.x + 15, buttonRect.y - 50);
        }

        ctx.fillStyle = 'gray';
        ctx.fillRect(buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height);

        ctx.fillStyle = 'white';
        ctx.font = '26px Arial';

        ctx.fillText('Play again', Game.windowWidth / 2 - 60, Game.windowHeight / 2 + 5);
        ctx.restore();
    }
}
