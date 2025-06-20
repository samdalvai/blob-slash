import Component from '../../engine/ecs/Component';

export default class HealthComponent extends Component {
    healthPercentage: number;
    lastDamageTime: number;

    constructor(healthPercentage = 0) {
        super();
        this.healthPercentage = healthPercentage;
        this.lastDamageTime = 0;
    }
}
