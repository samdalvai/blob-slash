import Component from '../ecs/Component';

export default class SlowTimeComponent extends Component {
    radius: number;
    slowTimePercentage: number;

    constructor(radius = 0, slowTimePercentage = 0) {
        super();
        this.radius = radius;
        this.slowTimePercentage = slowTimePercentage;
    }
}
