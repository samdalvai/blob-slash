import Component from '../ecs/Component';

export default class AnimationComponent extends Component {
    numFrames: number;
    currentFrame: number;
    frameSpeedRate: number;
    isLoop: boolean;
    startTime: number;

    constructor(numFrames = 1, frameSpeedRate = 1, isLoop = true) {
        super();
        this.numFrames = numFrames;
        this.currentFrame = 1;
        this.frameSpeedRate = frameSpeedRate;
        this.isLoop = isLoop;
        this.startTime = performance.now();
    }
}
