import { Component } from '../../engine';

export enum PickupEffect {
    HEALTH = 'health',
    NONE = 'none',
}

export default class PickableItemComponent extends Component {
    static override _enums = {
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
