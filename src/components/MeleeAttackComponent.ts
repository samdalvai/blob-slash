import Component from '../ecs/Component';

export default class MeleeAttackComponent extends Component {
    isFriendly: boolean;
    hitPercentDamage: number;

    constructor(isFriendly = false, hitPercentDamage = 0) {
        super();
        this.isFriendly = isFriendly;
        this.hitPercentDamage = hitPercentDamage;
    }
}
