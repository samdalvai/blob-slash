import Component from '../ecs/Component';

export default class EntityEffectComponent extends Component {
    slowed: boolean;
    slowedPercentage: number;

    constructor() {
        super();
        this.slowed = false;
        this.slowedPercentage = 1;
    }
}
