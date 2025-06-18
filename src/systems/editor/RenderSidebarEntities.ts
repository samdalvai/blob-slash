import SpriteComponent from '../../components/SpriteComponent';
import TransformComponent from '../../components/TransformComponent';
import Component from '../../ecs/Component';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import { ComponentType } from '../../types/components';
import { Rectangle, Vector } from '../../types/utils';
import { isRectangle, isVector } from '../../utils/vector';

export default class RenderSidebarEntities extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement, registry: Registry) {
        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        entityList.innerHTML = '';

        const entitiesIds = registry.getAllEntitiesIds();

        for (const entityId of entitiesIds) {
            const entityComponents = registry.getAllEntityComponents(entityId);

            const li = document.createElement('li');
            li.id = `entity-${entityId}`;
            li.textContent = `Entity id: ${entityId}`;
            //li.onclick = () => console.log(`Clicked entity ${entityId}`);

            const forms = this.getComponentsForms(entityComponents, entityId);
            li.appendChild(forms);

            entityList.appendChild(li);
        }
    }

    private getComponentsForms = (entityComponents: Component[], entityId: number): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'pt-2';

        for (const component of entityComponents) {
            const componentType: ComponentType = component.constructor.name
                .toLowerCase()
                .replace('component', '') as ComponentType;

            switch (componentType) {
                // case 'animation':
                // case 'boxcollider':
                // case 'camerafollow':
                // case 'camerashake':
                // case 'damageradius':
                // case 'deadbodyondeath':
                // case 'entitydestination':
                // case 'entityeffect':
                // case 'entityfollow':
                // case 'health':
                // case 'highlight':
                // case 'lifetime':
                // case 'lightemit':
                // case 'meleeattack':
                // case 'particle':
                // case 'particleemit':
                // case 'playercontrol':
                // case 'projectile':
                // case 'rangedattackemitter':
                // case 'rigidbody':
                // case 'script':
                // case 'shadow':
                // case 'slowtime':
                // case 'sound':
                case 'sprite': {
                    const componentContainer = document.createElement('div');
                    const title = document.createElement('span');
                    title.innerText = 'Sprite component';
                    componentContainer.append(title);

                    const properties = Object.keys(component);

                    for (const key of properties) {
                        componentContainer.append(this.getPropertyInput(key, (component as any)[key], component));
                    }

                    container.append(componentContainer);
                    break;
                }
                // case 'spritestate':
                // case 'teleport':
                // case 'textlabel':
                case 'transform': {
                    // const properties = { ...(component as TransformComponent) };
                    // console.log(properties)
                    // const componentContainer = document.createElement('div');

                    // const title = document.createElement('span');
                    // title.innerText = 'Transform component';
                    // componentContainer.append(title);

                    // const property2li = document.createElement('li');
                    // property2li.className = 'd-flex space-between align-center';

                    // const property2Title = 'Position x';

                    // const textInput2 = document.createElement('input');
                    // textInput2.type = 'number';
                    // textInput2.value = properties.position.x.toString();
                    // textInput2.id = 'transform-posx-' + entityId;
                    // textInput2.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as TransformComponent).position.x = parseInt(target.value);
                    // });

                    // property2li.append(property2Title);
                    // property2li.append(textInput2);

                    // const property3li = document.createElement('li');
                    // property3li.className = 'd-flex space-between align-center';

                    // const property3Title = 'Position y';

                    // const textInput3 = document.createElement('input');
                    // textInput3.type = 'number';
                    // textInput3.value = properties.position.y.toString();
                    // textInput3.id = 'transform-posy-' + entityId;
                    // textInput3.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as TransformComponent).position.y = parseInt(target.value);
                    // });

                    // property3li.append(property3Title);
                    // property3li.append(textInput3);

                    // componentContainer.append(property2li);
                    // componentContainer.append(property3li);
                    // container.append(componentContainer);

                    // this.getPropertyInput('test', properties.position, component);

                    break;
                }
            }
        }

        return container;
    };

    private getPropertyInput = (
        propertyName: string,
        propertyValue: number | boolean | Vector | Rectangle,
        component: Component,
    ) => {
        const propertyLi = document.createElement('li');
        propertyLi.className = 'd-flex space-between align-center';
        const propertyTitle = propertyName;
        propertyLi.append(propertyTitle);

        switch (typeof propertyValue) {
            case 'string': {
                const textInput = document.createElement('input');
                textInput.id = propertyName + '-';
                textInput.type = 'text';
                textInput.value = propertyValue;
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.value;
                });
                propertyLi.append(textInput);
                return propertyLi;
            }
            case 'number': {
                const textInput = document.createElement('input');
                textInput.id = propertyName + '-';
                textInput.type = 'number';
                textInput.value = propertyValue.toString();
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = parseFloat(target.value);
                });
                propertyLi.append(textInput);
                return propertyLi;
            }
            case 'boolean': {
                const textInput = document.createElement('input');
                textInput.id = propertyName + '-';
                textInput.type = 'checkbox';
                textInput.checked = propertyValue;
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.checked;
                });
                propertyLi.append(textInput);
                return propertyLi;
            }
            case 'object': {
                if (isVector(propertyValue)) {
                    const propertyLi = document.createElement('li');
                    return propertyLi;
                }

                if (isRectangle(propertyValue)) {
                    const propertyLi = document.createElement('li');
                    return propertyLi;
                }

                throw new Error(`Uknown type of property ${propertyName} with value ${propertyValue}`);
            }
        }
    };
}
