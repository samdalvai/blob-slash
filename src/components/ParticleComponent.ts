import Component from '../ecs/Component';

export default class ParticleComponent extends Component {
    dimension: number;
    color: string;

    constructor(dimension = 1, color = 'black') {
        super();
        this.dimension = dimension;
        this.color = color;
    }
}
