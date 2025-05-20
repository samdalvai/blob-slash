import PlayerControlComponent from '../components/PlayerControlComponent';
import System from '../ecs/System';

export default class CooldownSystem extends System {
    constructor() {
        super();
        this.requireComponent(PlayerControlComponent);
    }

    update() {
        for (const entity of this.getSystemEntities()) {
            const playerControl = entity.getComponent(PlayerControlComponent);

            if (!playerControl) {
                throw new Error('Could not find some component(s) of entity with id ' + entity.getId());
            }

            const magicBubbleCooldown = entity.registry.getEntityByTag('cooldown-magic-bubble');

            if (!magicBubbleCooldown) {
                throw new Error('Could not find magic bubble cooldown entity');
            }

            console.log('playerControl.magicBubbleCooldown: ', playerControl.magicBubbleCooldown);
            // console.log('performance.now(): ', performance.now());
            // console.log('playerControl.lastMagicBubbleEmissionTime: ', playerControl.lastMagicBubbleEmissionTime);

            const cooldownPercentage =
                (performance.now() - playerControl.lastMagicBubbleEmissionTime) / playerControl.magicBubbleCooldown;

            if (cooldownPercentage >= 1) {
                console.log('percentage: 100%');
            } else {
                console.log('percentage: ', cooldownPercentage);
            }
        }
    }
}

/**
 *
 * cooldown = 1000
 *
 * now = 1500
 * lastemission = 1000
 * percentage = 50%
 *
 * 1500 - 1000 = 500
 *
 *
 *
 *
 */
