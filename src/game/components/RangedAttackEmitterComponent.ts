import Component from '../../engine/ecs/Component';

export default class RangedAttackEmitterComponent extends Component {
    projectileVelocity: number;
    repeatFrequency: number;
    projectileDuration: number;
    hitPercentDamage: number;
    isFriendly: boolean;
    lastEmissionTime: number;

    constructor(
        projectileVelocity = 200,
        repeatFrequency = 0,
        projectileDuration = 10000,
        hitPercentDamage = 10,
        isFriendly = false,
    ) {
        super();
        this.projectileVelocity = projectileVelocity;
        this.repeatFrequency = repeatFrequency;
        this.projectileDuration = projectileDuration;
        this.hitPercentDamage = hitPercentDamage;
        this.isFriendly = isFriendly;
        this.lastEmissionTime = 0;
    }
}
