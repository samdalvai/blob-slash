import Component from '../ecs/Component';

export default class ParticleComponent extends Component {
    dimension: number;

    constructor(dimension = 1) {
        super();
        this.dimension = dimension;
    }
}
