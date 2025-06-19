import Component from '../../core/ecs/Component';

export default class PlayerControlComponent extends Component {
    velocity: number;
    keysPressed: string[] = [];

    magicBubbleCooldown: number;
    magicBubbleLastEmissionTime: number;

    teleportCooldown: number;
    teleportLastEmissionTime: number;

    fireCircleCooldown: number;
    fireCircleLastEmissionTime: number;

    constructor(velocity = 0, magicBubbleCooldown = 0, teleportCooldown = 0, fireCircleCooldown = 0) {
        super();
        this.velocity = velocity;
        this.magicBubbleCooldown = magicBubbleCooldown;
        this.magicBubbleLastEmissionTime = 0;

        this.teleportCooldown = teleportCooldown;
        this.teleportLastEmissionTime = 0;

        this.fireCircleCooldown = fireCircleCooldown;
        this.fireCircleLastEmissionTime = 0;
    }
}
