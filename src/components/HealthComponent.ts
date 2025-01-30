import Component from '../ecs/Component';

export default class HealthComponent extends Component {
    healthPercentage: number;

    constructor(healthPercentage = 0) {
        super();
        this.healthPercentage = healthPercentage;
    }
}
