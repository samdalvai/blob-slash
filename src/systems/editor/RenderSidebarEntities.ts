import Component from '../../ecs/Component';
import Registry from '../../ecs/Registry';
import System from '../../ecs/System';
import EventBus from '../../event-bus/EventBus';
import EntitySelectEvent from '../../events/editor/EntitySelectEvent';
import { Rectangle, Vector } from '../../types/utils';
import { isRectangle, isVector } from '../../utils/vector';

export default class RenderSidebarEntities extends System {
    constructor() {
        super();
    }

    subscribeToEvents(eventBus: EventBus, sidebar: HTMLElement | null) {
        eventBus.subscribeToEvent(EntitySelectEvent, this, event => this.onEntitySelect(event, sidebar));
    }

    onEntitySelect = (event: EntitySelectEvent, sidebar: HTMLElement | null) => {
        if (!sidebar) {
            throw new Error('Could not retrieve sidebar');
        }

        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const targetElement = entityList.querySelector(`#entity-${event.entity.getId()}`);

        if (!targetElement) {
            throw new Error('Could not find target element in entity list');
        }

        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    update(sidebar: HTMLElement, registry: Registry) {
        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        entityList.innerHTML = '';

        const entitiesIds = registry.getAllEntitiesIds();

        for (const entityId of entitiesIds) {
            const entityComponents = registry.getAllEntityComponents(entityId);

            const title = document.createElement('h3');
            title.textContent = `Entity id: ${entityId}`;

            const li = document.createElement('li');
            li.id = `entity-${entityId}`;
            li.style.border = 'solid 1px white';
            li.onclick = () => console.log(`Clicked entity ${entityId}`);

            const forms = this.getComponentsForms(entityComponents, entityId);
            li.appendChild(title);
            li.appendChild(forms);

            entityList.appendChild(li);
        }
    }

    private getComponentsForms = (entityComponents: Component[], entityId: number): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'pt-2';

        for (const component of entityComponents) {
            const componentContainer = document.createElement('div');
            const title = document.createElement('span');
            title.innerText = '* ' + component.constructor.name;
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
                const textInput = this.createInput('text', propertyName + '-' + entityId, propertyValue);
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.value;
                });

                const propertyLi = this.createListItem(propertyName, textInput);
                return propertyLi;
            }
            case 'number': {
                const textInput = this.createInput('number', propertyName + '-' + entityId, propertyValue);
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = parseFloat(target.value);
                });
                const propertyLi = this.createListItem(propertyName, textInput);
                return propertyLi;
            }
            case 'boolean': {
                const textInput = this.createInput('checkbox', propertyName + '-' + entityId, propertyValue);
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.checked;
                });
                const propertyLi = this.createListItem(propertyName, textInput);
                return propertyLi;
            }
            case 'object': {
                if (isVector(propertyValue)) {
                    const vectorContainer = document.createElement('div');

                    const textInput1 = this.createInput('number', propertyName + '-' + entityId, propertyValue.x);
                    textInput1.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].x = parseInt(target.value);
                    });

                    const textInput2 = this.createInput('number', propertyName + '-' + entityId, propertyValue.y);
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].y = parseInt(target.value);
                    });

                    const propertyLi1 = this.createListItem(propertyName + ' (x)', textInput1);
                    const propertyLi2 = this.createListItem(propertyName + ' (y)', textInput2);

                    vectorContainer.append(propertyLi1);
                    vectorContainer.append(propertyLi2);

                    return vectorContainer;
                }

                if (isRectangle(propertyValue)) {
                    const vectorContainer = document.createElement('div');

                    const textInput1 = this.createInput(
                        'number',
                        propertyName + '-' + entityId,
                        (propertyValue as Rectangle).x,
                    );
                    textInput1.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].x = parseInt(target.value);
                    });

                    const textInput2 = this.createInput(
                        'number',
                        propertyName + '-' + entityId,
                        (propertyValue as Rectangle).y,
                    );
                    textInput2.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].y = parseInt(target.value);
                    });

                    const textInput3 = this.createInput(
                        'number',
                        propertyName + '-' + entityId,
                        (propertyValue as Rectangle).width,
                    );
                    textInput3.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].width = parseInt(target.value);
                    });

                    const textInput4 = this.createInput(
                        'number',
                        propertyName + '-' + entityId,
                        (propertyValue as Rectangle).height,
                    );
                    textInput4.addEventListener('input', event => {
                        const target = event.target as HTMLInputElement;
                        (component as any)[propertyName].height = parseInt(target.value);
                    });

                    const propertyLi1 = this.createListItem(propertyName + ' (x)', textInput1);
                    const propertyLi2 = this.createListItem(propertyName + ' (y)', textInput2);
                    const propertyLi3 = this.createListItem(propertyName + ' (width)', textInput3);
                    const propertyLi4 = this.createListItem(propertyName + ' (height)', textInput4);

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

    private createListItem = (label: string, input: HTMLInputElement): HTMLLIElement => {
        const li = document.createElement('li');
        li.className = 'd-flex space-between align-center';
        li.append(label);
        li.append(input);
        return li;
    };

    private createInput = (
        type: 'text' | 'number' | 'checkbox',
        id: string,
        value: string | number | boolean,
    ): HTMLInputElement => {
        const input = document.createElement('input');
        input.type = type;
        input.id = id;
        if (type === 'checkbox') {
            input.checked = Boolean(value);
        } else {
            input.value = String(value);
        }
        return input;
    };
}
