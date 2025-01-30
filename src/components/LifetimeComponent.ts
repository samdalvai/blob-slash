import Component from '../ecs/Component';

export default class LifetimeComponent extends Component {
    lifetime: number;
    startTime: number;

    constructor(lifetime = 0) {
        super();
        this.lifetime = lifetime;
        this.startTime = performance.now();
    }
}
