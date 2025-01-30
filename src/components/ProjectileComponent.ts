import Component from '../ecs/Component';

export default class ProjectileComponent extends Component {
    isFriendly: boolean;
    hitPercentDamage: number;

    constructor(isFriendly = false, hitPercentDamage = 0) {
        super();
        this.isFriendly = isFriendly;
        this.hitPercentDamage = hitPercentDamage;
    }
}
