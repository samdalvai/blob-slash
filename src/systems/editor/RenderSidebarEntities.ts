import SpriteComponent from '../../components/SpriteComponent';
import TransformComponent from '../../components/TransformComponent';
import Component from '../../ecs/Component';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import { ComponentType } from '../../types/components';

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
                    const properties = { ...(component as SpriteComponent) };
                    const componentContainer = document.createElement('div');

                    const title = document.createElement('span');
                    title.innerText = 'Sprite component';
                    componentContainer.append(title);

                    const property1li = document.createElement('li');
                    property1li.className = 'd-flex space-between align-center';

                    const property1Title = 'Asset id';

                    const textInput1 = document.createElement('input');
                    textInput1.type = 'text';
                    textInput1.value = properties.assetId;
                    textInput1.id = 'sprite-assetId-' + entityId;
                    textInput1.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as SpriteComponent).assetId = target.value;
                    });

                    property1li.append(property1Title);
                    property1li.append(textInput1);

                    const property2li = document.createElement('li');
                    property2li.className = 'd-flex space-between align-center';

                    const property2Title = 'Width';

                    const textInput2 = document.createElement('input');
                    textInput2.type = 'number';
                    textInput2.value = properties.width.toString();
                    textInput2.id = 'sprite-width-' + entityId;
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as SpriteComponent).width = parseInt(target.value);
                    });

                    property2li.append(property2Title);
                    property2li.append(textInput2);

                    const property3li = document.createElement('li');
                    property3li.className = 'd-flex space-between align-center';

                    const property3Title = 'Height';

                    const textInput3 = document.createElement('input');
                    textInput3.type = 'number';
                    textInput3.value = properties.height.toString();
                    textInput3.id = 'sprite-height-' + entityId;
                    textInput3.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as SpriteComponent).height = parseInt(target.value);
                    });

                    property3li.append(property3Title);
                    property3li.append(textInput3);

                    componentContainer.append(property1li);
                    componentContainer.append(property2li);
                    componentContainer.append(property3li);
                    container.append(componentContainer);
                    break;
                }
                // case 'spritestate':
                // case 'teleport':
                // case 'textlabel':
                case 'transform': {
                    const properties = { ...(component as TransformComponent) };
                    const componentContainer = document.createElement('div');

                    const title = document.createElement('span');
                    title.innerText = 'Transform component';
                    componentContainer.append(title);

                    const property2li = document.createElement('li');
                    property2li.className = 'd-flex space-between align-center';

                    const property2Title = 'Position x';

                    const textInput2 = document.createElement('input');
                    textInput2.type = 'number';
                    textInput2.value = properties.position.x.toString();
                    textInput2.id = 'transform-posx-' + entityId;
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as TransformComponent).position.x = parseInt(target.value);
                    });

                    property2li.append(property2Title);
                    property2li.append(textInput2);

                    const property3li = document.createElement('li');
                    property3li.className = 'd-flex space-between align-center';

                    const property3Title = 'Position y';

                    const textInput3 = document.createElement('input');
                    textInput3.type = 'number';
                    textInput3.value = properties.position.y.toString();
                    textInput3.id = 'transform-posy-' + entityId;
                    textInput3.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as TransformComponent).position.y = parseInt(target.value);
                    });

                    property3li.append(property3Title);
                    property3li.append(textInput3);

                    componentContainer.append(property2li);
                    componentContainer.append(property3li);
                    container.append(componentContainer);
                    break;
                }
            }
        }

        return container;
    };
}
