import Component from '../../core/ecs/Component';

export default class SlowTimeComponent extends Component {
    radius: number;
    slowTimePercentage: number;
    isFriendly: boolean;

    constructor(radius = 0, slowTimePercentage = 0, isFriendly = false) {
        super();
        this.radius = radius;
        this.slowTimePercentage = slowTimePercentage;
        this.isFriendly = isFriendly;
    }
}
