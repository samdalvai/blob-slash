import Component from '../ecs/Component';

export default class PlayerControlComponent extends Component {
    velocity: number;
    keysPressed: string[] = [];

    magicBubbleCooldown: number;
    lastMagicBubbleEmissionTime: number;

    constructor(velocity = 0, magicBubbleCooldown = 0) {
        super();
        this.velocity = velocity;
        this.magicBubbleCooldown = magicBubbleCooldown;
        this.lastMagicBubbleEmissionTime = 0;
    }
}
