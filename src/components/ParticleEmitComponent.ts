import Component from '../ecs/Component';
import { ParticleColor } from '../types';

export default class ParticleEmitComponent extends Component {
    dimension: number;
    duration: number;
    emitFrequency: number;
    color: ParticleColor;

    constructor(dimension = 1, duration = 1000, emitFrequency = 1000, color: ParticleColor = 'black') {
        super();
        this.dimension = dimension;
        this.duration = duration;
        this.emitFrequency = emitFrequency;
        this.color = color;
    }
}
