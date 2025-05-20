import Component from '../ecs/Component';

export default class CooldownComponent extends Component {
    magicBubbleCooldown: number;
    currentMagicBubbleCooldown: number

    constructor(magicBubbleCooldown = 0) {
        super();
        this.magicBubbleCooldown = magicBubbleCooldown;
        this.currentMagicBubbleCooldown = 0;
    }
}
