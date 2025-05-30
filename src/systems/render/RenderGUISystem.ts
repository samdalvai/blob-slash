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
            padding,
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
            padding,
            Game.windowHeight - 64 - padding,
            magicBubbleWidth * magicBubbleScale,
            magicBubbleHeight * magicBubbleScale,
        );

        const teleportScale = 1;
        const teleportWidth = 32;
        const teleportHeight = 64;

        const firstSkillPosition = padding + magicBubbleWidth * magicBubbleScale;

        ctx.drawImage(
            assetStore.getTexture('teleport-texture'),
            64,
            0,
            teleportWidth,
            teleportHeight,
            firstSkillPosition + (teleportWidth * teleportScale) / 2,
            Game.windowHeight - teleportHeight * teleportScale - padding,
            teleportWidth * teleportScale,
            teleportHeight * teleportScale,
        );

        // To be used when adding third skill
        const secondSkillPosition = firstSkillPosition + (teleportWidth * teleportScale) / 2;

        const fireCircleScale = 0.45;
        const fireCircleWidth = 128;
        const fireCircleleHeight = 128;

        ctx.drawImage(
            assetStore.getTexture('fire-circle-texture'),
            256,
            128,
            fireCircleWidth,
            fireCircleleHeight,
            secondSkillPosition + (fireCircleWidth * fireCircleScale) / 2 + padding - 4,
            Game.windowHeight - 64 - padding + 4,
            fireCircleWidth * fireCircleScale,
            fireCircleleHeight * fireCircleScale,
        );

        const mouseMenuScale = 2.0;
        const mouseMenuWidth = 32 * 2;
        const mouseMenuHeight = 32;

        ctx.drawImage(
            assetStore.getTexture('mouse-menu-texture'),
            0,
            0,
            mouseMenuWidth,
            mouseMenuHeight,
            2 * padding + skillsMenuWidth * skillsMenuScale,
            Game.windowHeight - 64 - padding,
            mouseMenuWidth * mouseMenuScale,
            mouseMenuHeight * mouseMenuScale,
        );

        const magicSphereScale = 2;
        const magicSphereWidth = 32;
        const magicSphereHeight = 32;

        const leftClickAttackPosition = 2 * padding + skillsMenuWidth * skillsMenuScale

        ctx.drawImage(
            assetStore.getTexture('magic-sphere-texture'),
            0,
            0,
            magicSphereWidth,
            magicSphereHeight,
            leftClickAttackPosition,
            Game.windowHeight - 64 - padding,
            magicSphereWidth * magicSphereScale,
            magicSphereWidth * magicSphereScale,
        );

        const meleeAttackScale = 2;
        const meleeAttackWidth = 64;
        const meleeAttackHeight = 64;

        ctx.drawImage(
            assetStore.getTexture('smear-animation-texture'),
            meleeAttackWidth,
            meleeAttackHeight,
            meleeAttackWidth,
            meleeAttackHeight,
            leftClickAttackPosition + meleeAttackWidth - 2.5,
            Game.windowHeight - 64 - padding - 2.5,
            meleeAttackWidth * meleeAttackScale,
            meleeAttackWidth * meleeAttackScale,
        );
    }
}
