import Component from '../../ecs/Component';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
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
            console.log('Component: ', component.constructor.name);
            const componentContainer = document.createElement('div');
            const title = document.createElement('span');
            title.innerText = component.constructor.name;
            componentContainer.append(title);

            const properties = Object.keys(component);

            for (const key of properties) {
                componentContainer.append(this.getPropertyInput(key, (component as any)[key], component, entityId));
            }

            container.append(componentContainer);
        }

        return container;
    };

    private getPropertyInput = (
        propertyName: string,
        propertyValue: number | boolean | Vector | Rectangle,
        component: Component,
        entityId: number,
    ) => {
        switch (typeof propertyValue) {
            case 'string': {
                const propertyLi = document.createElement('li');
                propertyLi.className = 'd-flex space-between align-center';
                const propertyTitle = propertyName;
                propertyLi.append(propertyTitle);

                const textInput = document.createElement('input');
                textInput.id = propertyName + '-' + entityId;
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
                const propertyLi = document.createElement('li');
                propertyLi.className = 'd-flex space-between align-center';
                const propertyTitle = propertyName;
                propertyLi.append(propertyTitle);

                const textInput = document.createElement('input');
                textInput.id = propertyName + '-' + entityId;
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
                const propertyLi = document.createElement('li');
                propertyLi.className = 'd-flex space-between align-center';
                const propertyTitle = propertyName;
                propertyLi.append(propertyTitle);

                const textInput = document.createElement('input');
                textInput.id = propertyName + '-' + entityId;
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
                    const vectorContainer = document.createElement('div');

                    const propertyLi1 = document.createElement('li');
                    propertyLi1.className = 'd-flex space-between align-center';
                    const propertyTitle1 = propertyName + ' (x)';

                    const textInput1 = document.createElement('input');
                    textInput1.id = propertyName + '-' + entityId;
                    textInput1.type = 'number';
                    textInput1.value = propertyValue.x.toString();
                    textInput1.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].x = parseInt(target.value);
                    });

                    propertyLi1.append(propertyTitle1);
                    propertyLi1.append(textInput1);

                    const propertyLi2 = document.createElement('li');
                    propertyLi2.className = 'd-flex space-between align-center';
                    const propertyTitle2 = propertyName + ' (y)';

                    const textInput2 = document.createElement('input');
                    textInput2.id = propertyName + '-' + entityId;
                    textInput2.type = 'number';
                    textInput2.value = propertyValue.y.toString();
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].y = parseInt(target.value);
                    });

                    propertyLi2.append(propertyTitle2);
                    propertyLi2.append(textInput2);

                    vectorContainer.append(propertyLi1);
                    vectorContainer.append(propertyLi2);

                    return vectorContainer;
                }

                if (isRectangle(propertyValue)) {
                    const vectorContainer = document.createElement('div');

                    const propertyLi1 = document.createElement('li');
                    propertyLi1.className = 'd-flex space-between align-center';
                    const propertyTitle1 = propertyName + ' (x)';

                    const textInput1 = document.createElement('input');
                    textInput1.id = propertyName + '-' + entityId;
                    textInput1.type = 'number';
                    textInput1.value = propertyValue.x.toString();
                    textInput1.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].x = parseInt(target.value);
                    });

                    propertyLi1.append(propertyTitle1);
                    propertyLi1.append(textInput1);

                    const propertyLi2 = document.createElement('li');
                    propertyLi2.className = 'd-flex space-between align-center';
                    const propertyTitle2 = propertyName + ' (y)';

                    const textInput2 = document.createElement('input');
                    textInput2.id = propertyName + '-' + entityId;
                    textInput2.type = 'number';
                    textInput2.value = propertyValue.y.toString();
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].y = parseInt(target.value);
                    });

                    propertyLi2.append(propertyTitle2);
                    propertyLi2.append(textInput2);

                    const propertyLi3 = document.createElement('li');
                    propertyLi3.className = 'd-flex space-between align-center';
                    const propertyTitle3 = propertyName + ' (width)';

                    const textInput3 = document.createElement('input');
                    textInput3.id = propertyName + '-' + entityId;
                    textInput3.type = 'number';
                    textInput3.value = (propertyValue as Rectangle).width.toString();
                    textInput3.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].width = parseInt(target.value);
                    });

                    propertyLi3.append(propertyTitle3);
                    propertyLi3.append(textInput3);

                    const propertyLi4 = document.createElement('li');
                    propertyLi4.className = 'd-flex space-between align-center';
                    const propertyTitle4 = propertyName + ' (height)';

                    const textInput4 = document.createElement('input');
                    textInput4.id = propertyName + '-' + entityId;
                    textInput4.type = 'number';
                    textInput4.value = (propertyValue as Rectangle).height.toString();
                    textInput4.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].height = parseInt(target.value);
                    });

                    propertyLi4.append(propertyTitle4);
                    propertyLi4.append(textInput4);

                    vectorContainer.append(propertyLi1);
                    vectorContainer.append(propertyLi2);
                    vectorContainer.append(propertyLi3);
                    vectorContainer.append(propertyLi4);

                    return vectorContainer;
                }

                throw new Error(`Uknown type of property ${propertyName} with value ${propertyValue}`);
            }
        }
    };
}
