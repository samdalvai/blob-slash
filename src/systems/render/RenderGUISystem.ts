import AssetStore from '../../asset-store/AssetStore';
import System from '../../ecs/System';
import Game from '../../game/Game';

export default class RenderGUISystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore) {
        const padding = 25;
        const skillsMenuScale = 2.0;
        const skillsMenuWidth = 32 * 3;
        const skillsMenuHeight = 32;

        ctx.drawImage(
            assetStore.getTexture('skills-menu-texture'),
            0,
            0,
            skillsMenuWidth,
            skillsMenuHeight,
            25,
            Game.windowHeight - 64 - padding,
            skillsMenuWidth * skillsMenuScale,
            skillsMenuHeight * skillsMenuScale,
        );

        const magicBubbleScale = 0.5;
        const magicBubbleWidth = 128;
        const magicBubbleHeight = 128;

        ctx.drawImage(
            assetStore.getTexture('magic-bubble-texture'),
            128,
            0,
            magicBubbleWidth,
            magicBubbleHeight,
            25,
            Game.windowHeight - 64 - padding,
            magicBubbleWidth * magicBubbleScale,
            magicBubbleWidth * magicBubbleScale,
        );
    }
}
