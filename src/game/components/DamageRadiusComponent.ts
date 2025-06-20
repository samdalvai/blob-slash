import Component from '../../engine/ecs/Component';

export default class DamageRadiusComponent extends Component {
    radius: number;
    damagePerSecond: number;
    isFriendly: boolean;

    constructor(radius = 0, damagePerSecond = 0, isFriendly = false) {
        super();
        this.radius = radius;
        this.damagePerSecond = damagePerSecond;
        this.isFriendly = isFriendly;
    }
}
