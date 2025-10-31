import Component from '../../engine/ecs/Component';

export default class PickableItemComponent extends Component {
    effectOnPickup: string;
    effectValue: number;

    constructor(effectOnPickup = '', effectValue = 0) {
        super();
        this.effectOnPickup = effectOnPickup;
        this.effectValue = effectValue;
    }
}
