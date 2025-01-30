import Component from '../ecs/Component';

export default class SoundComponent extends Component {
    assetId: string;
    // Used to replay the sound before the soundtrack has ended (to avoid missing sound whe looping)
    offsetBuffer: number;
    volume: number;

    constructor(assetId = '', offsetBuffer = 0, volume = 1) {
        super();
        this.assetId = assetId;
        this.offsetBuffer = offsetBuffer;
        this.volume = volume;
    }
}
