import Entity from '../../engine/ecs/Entity';
import GameEvent from '../../engine/event-bus/GameEvent';
import { Vector } from '../../engine/types/utils';

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
