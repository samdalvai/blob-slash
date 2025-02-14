import Component from '../ecs/Component';
import { ParticleColor } from '../types';

export default class ParticleEmitComponent extends Component {
    dimension: number;
    duration: number;
    color: ParticleColor;
    emitFrequency: number;
    emitRadius: number;
    lastEmission = 0;

    constructor(
        dimension = 1,
        duration = 1000,
        color: ParticleColor = 'black',
        emitFrequency = 1000,
        emitRadius = 1000,
    ) {
        super();
        this.dimension = dimension;
        this.duration = duration;
        this.color = color;
        this.emitFrequency = emitFrequency;
        this.emitRadius = emitRadius;
    }
}
