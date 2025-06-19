import Component from '../../core/ecs/Component';

export default class TeleportComponent extends Component {
    isTeleporting: boolean;
    teleportDelay: number;

    constructor(teleportDelay = 1000) {
        super();
        this.isTeleporting = false;
        this.teleportDelay = teleportDelay;
    }
}
