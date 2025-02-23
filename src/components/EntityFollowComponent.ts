import Component from '../ecs/Component';
import Entity from '../ecs/Entity';

export default class EntityFollowComponent extends Component {
    detectionRadius: number;
    minFollowDistance: number;
    followVelocity: number;
    followDuration: number;
    followedEntity: Entity | null;
    startFollowTime: number;

    constructor(detectionRadius = 0, minFollowDistance = 0, followVelocity = 0, followDuration = 0) {
        super();
        this.detectionRadius = detectionRadius;
        this.minFollowDistance = minFollowDistance;
        this.followVelocity = followVelocity;
        this.followDuration = followDuration;
        this.followedEntity = null;
        this.startFollowTime = 0;
    }
}
