import TransformComponent from '../components/TransformComponent';
import Entity from '../ecs/Entity';
import Registry from '../ecs/Registry';
import { EntityMap } from '../types/map';

export const deserializeEntity = (entityMap: EntityMap, registry: Registry): Entity => {
    const entity = registry.createEntity();

    for (const component of entityMap.components) {
        switch (component.name) {
            case 'animation':
                break;
            case 'boxcollider':
                break;
            case 'camerafollow':
                break;
            case 'camerashake':
                break;
            case 'damageradius':
                break;
            case 'deadbodyondeath':
                break;
            case 'entitydestination':
                break;
            case 'entityeffect':
                break;
            case 'entityfollow':
                break;
            case 'health':
                break;
            case 'highlight':
                break;
            case 'lifetime':
                break;
            case 'lightemit':
                break;
            case 'particle':
                break;
            case 'particleemit':
                break;
            case 'playercontrol':
                break;
            case 'projectile':
                break;
            case 'rangedattackemitter':
                break;
            case 'rigidbody':
                break;
            case 'script':
                break;
            case 'shadow':
                break;
            case 'slowtime':
                break;
            case 'sound':
                break;
            case 'sprite':
                break;
            case 'spritestate':
                break;
            case 'teleport':
                break;
            case 'textlabel':
                break;
            case 'transform': {
                entity.addComponent(
                    TransformComponent,
                    component.properties.position,
                    component.properties.scale,
                    component.properties.rotation,
                );
                break;
            }
        }
    }

    return entity;
};
