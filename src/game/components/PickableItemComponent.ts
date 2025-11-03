import Component from '../../engine/ecs/Component';

export enum PickupEffect {
    HEALTH = 'health',
    ARMOR = 'armor',
    NONE = 'none',
}

export default class PickableItemComponent extends Component {
    static _enums = {
        effectOnPickup: PickupEffect,
    };

    effectOnPickup: PickupEffect;
    effectValue: number;

    constructor(effectOnPickup = PickupEffect.HEALTH, effectValue = 0) {
        super();
        this.effectOnPickup = effectOnPickup;
        this.effectValue = effectValue;
    }
}
