import Entity from '../../core/ecs/Entity';
import GameEvent from '../../core/event-bus/GameEvent';
import { Vector } from '../../core/types/utils';

export default class CollisionEvent extends GameEvent {
    a: Entity;
    b: Entity;
    collisionNormal: Vector;

    constructor(a: Entity, b: Entity, collisionNormal = { x: 0, y: 0 }) {
        super();
        this.a = a;
        this.b = b;
        this.collisionNormal = collisionNormal;
    }
}
