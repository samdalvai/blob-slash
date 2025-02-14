import Component from '../ecs/Component';
import { ParticleColor } from '../types';

export default class ParticleComponent extends Component {
    dimension: number;
    color: ParticleColor;

    constructor(dimension = 1, color: ParticleColor = 'black') {
        super();
        this.dimension = dimension;
        this.color = color;
    }
}
