import Component from '../ecs/Component';
import { Vector } from '../types/utils';

export default class ParticleEmitComponent extends Component {
    dimension: number;
    duration: number;
    color: string;
    emitFrequency: number;
    emitRadius: number;
    offsetX: number;
    offsetY: number;
    particleVelocity: Vector;
    lastEmission = 0;

    constructor(
        dimension = 1,
        duration = 1000,
        color = 'black',
        emitFrequency = 100,
        emitRadius = 100,
        offsetX = 0,
        offsetY = 0,
        particleVelocity = { x: 0, y: 0 },
    ) {
        super();
        this.dimension = dimension;
        this.duration = duration;
        this.color = color;
        this.emitFrequency = emitFrequency;
        this.emitRadius = emitRadius;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.particleVelocity = particleVelocity;
    }
}
