import AssetStore from '../../engine/asset-store/AssetStore';
import System from '../../engine/ecs/System';
import Engine from '../../engine/Engine';

// TODO: remove this and create entities instead
export default class RenderGUISystem extends System {
    constructor() {
        super();
    }

    update(ctx: CanvasRenderingContext2D, assetStore: AssetStore) {
        const padding = 25;

        // Render skills menu
        
        const skillsMenuScale = 2.0;
        const skillsMenuWidth = 32 * 3;
        const skillsMenuHeight = 32;

        ctx.drawImage(
            assetStore.getTexture('skills_menu'),
            0,
            0,
            skillsMenuWidth,
            skillsMenuHeight,
            padding,
            Engine.windowHeight - 64 - padding,
            skillsMenuWidth * skillsMenuScale,
            skillsMenuHeight * skillsMenuScale,
        );

        const magicBubbleScale = 0.5;
        const magicBubbleWidth = 128;
        const magicBubbleHeight = 128;

        ctx.drawImage(
            assetStore.getTexture('magic_bubble'),
            128,
            0,
            magicBubbleWidth,
            magicBubbleHeight,
            padding,
            Engine.windowHeight - 64 - padding,
            magicBubbleWidth * magicBubbleScale,
            magicBubbleHeight * magicBubbleScale,
        );

        const teleportScale = 1;
        const teleportWidth = 32;
        const teleportHeight = 64;

        const firstSkillPosition = padding + magicBubbleWidth * magicBubbleScale;

        ctx.drawImage(
            assetStore.getTexture('teleport'),
            64,
            0,
            teleportWidth,
            teleportHeight,
            firstSkillPosition + (teleportWidth * teleportScale) / 2,
            Engine.windowHeight - teleportHeight * teleportScale - padding,
            teleportWidth * teleportScale,
            teleportHeight * teleportScale,
        );

        // To be used when adding third skill
        const secondSkillPosition = firstSkillPosition + (teleportWidth * teleportScale) / 2;

        const fireCircleScale = 0.45;
        const fireCircleWidth = 128;
        const fireCircleleHeight = 128;

        ctx.drawImage(
            assetStore.getTexture('fire_circle'),
            256,
            128,
            fireCircleWidth,
            fireCircleleHeight,
            secondSkillPosition + (fireCircleWidth * fireCircleScale) / 2 + padding - 4,
            Engine.windowHeight - 64 - padding + 4,
            fireCircleWidth * fireCircleScale,
            fireCircleleHeight * fireCircleScale,
        );

        // Render mouse menu

        const mouseMenuScale = 2.0;
        const mouseMenuWidth = 32 * 2;
        const mouseMenuHeight = 32;

        ctx.drawImage(
            assetStore.getTexture('mouse_menu'),
            0,
            0,
            mouseMenuWidth,
            mouseMenuHeight,
            2 * padding + skillsMenuWidth * skillsMenuScale,
            Engine.windowHeight - 64 - padding,
            mouseMenuWidth * mouseMenuScale,
            mouseMenuHeight * mouseMenuScale,
        );

        const magicSphereScale = 2;
        const magicSphereWidth = 32;
        const magicSphereHeight = 32;

        const leftClickAttackPosition = 2 * padding + skillsMenuWidth * skillsMenuScale

        ctx.drawImage(
            assetStore.getTexture('magic_sphere'),
            0,
            0,
            magicSphereWidth,
            magicSphereHeight,
            leftClickAttackPosition,
            Engine.windowHeight - 64 - padding,
            magicSphereWidth * magicSphereScale,
            magicSphereWidth * magicSphereScale,
        );

        const meleeAttackScale = 2;
        const meleeAttackWidth = 64;
        const meleeAttackHeight = 64;

        ctx.drawImage(
            assetStore.getTexture('smear64'),
            meleeAttackWidth,
            meleeAttackHeight,
            meleeAttackWidth,
            meleeAttackHeight,
            leftClickAttackPosition + meleeAttackWidth - 2.5,
            Engine.windowHeight - 64 - padding - 2.5,
            meleeAttackWidth * meleeAttackScale,
            meleeAttackWidth * meleeAttackScale,
        );
    }
}
