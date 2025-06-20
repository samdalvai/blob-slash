import Component from '../../engine/ecs/Component';

export default class EntityEffectComponent extends Component {
    slowed: boolean;
    slowedPercentage: number;
    hasDamageOverTime: boolean;
    damagePerSecond: number;
    lastDamageTime: number;

    constructor() {
        super();
        this.slowed = false;
        this.slowedPercentage = 1;
        this.hasDamageOverTime = false;
        this.damagePerSecond = 0;
        this.lastDamageTime = 0;
    }
}
