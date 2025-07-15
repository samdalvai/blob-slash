import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Component, { ComponentClass } from '../../engine/ecs/Component';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { getComponentConstructorParamNames } from '../../engine/serialization/deserialization';
import { saveLevelToJson, saveLevelToLocalStorage } from '../../engine/serialization/persistence';
import { Rectangle, Vector } from '../../engine/types/utils';
import { isRectangle, isVector } from '../../engine/utils/vector';
import * as GameComponents from '../../game/components';
import Editor from '../Editor';
import EntityDeleteEvent from '../events/EntityDeleteEvent';
import EntityDuplicateEvent from '../events/EntityDuplicateEvent';
import EntitySelectEvent from '../events/EntitySelectEvent';
import { showAlert } from '../gui';

export default class RenderSidebarSystem extends System {
    constructor() {
        super();
    }

    subscribeToEvents(eventBus: EventBus, sidebar: HTMLElement | null, assetStore: AssetStore) {
        eventBus.subscribeToEvent(EntitySelectEvent, this, event => this.onEntitySelect(event, sidebar));
        eventBus.subscribeToEvent(EntityDeleteEvent, this, event => this.onEntityDelete(event, sidebar));
        eventBus.subscribeToEvent(EntityDuplicateEvent, this, event =>
            this.onEntityDuplicate(event, sidebar, assetStore, eventBus),
        );
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

    onEntityDelete = (event: EntitySelectEvent, sidebar: HTMLElement | null) => {
        if (!sidebar) {
            throw new Error('Could not retrieve sidebar');
        }

        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        event.entity.kill();

        const targetElement = entityList.querySelector(`#entity-${event.entity.getId()}`);

        if (!targetElement) {
            throw new Error('Could not find target element in entity list');
        }

        Editor.selectedEntity = null;
        targetElement.remove();
    };

    onEntityDuplicate = (
        event: EntitySelectEvent,
        sidebar: HTMLElement | null,
        assetStore: AssetStore,
        eventBus: EventBus,
    ) => {
        if (!sidebar) {
            throw new Error('Could not retrieve sidebar');
        }

        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const originalEntity = event.entity;
        const entityCopy = originalEntity.registry.createEntity();
        const originalEntityComponents = originalEntity.getComponents();

        for (const component of originalEntityComponents) {
            const ComponentClass = GameComponents[component.constructor.name as keyof typeof GameComponents];
            const parameters = getComponentConstructorParamNames(ComponentClass);
            const parameterValues: any[] = [];

            for (const param of parameters) {
                if (typeof component[param as keyof Component] === 'object') {
                    parameterValues.push({ ...(component[param as keyof Component] as object) });
                } else {
                    parameterValues.push(component[param as keyof Component]);
                }
            }

            entityCopy.addComponent(ComponentClass, ...parameterValues);
        }

        entityList.appendChild(this.getEntityListElement(entityCopy, originalEntity.registry, assetStore, eventBus));

        eventBus.emitEvent(EntitySelectEvent, entityCopy);
    };

    update(sidebar: HTMLElement, registry: Registry, assetStore: AssetStore, eventBus: EventBus) {
        this.renderEntityList(sidebar, registry, assetStore, eventBus);
        this.renderLevelSettings(sidebar);
        this.renderSaveButtons(sidebar, registry, assetStore);
    }

    private renderEntityList = (
        sidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
    ) => {
        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        entityList.innerHTML = '';

        const entities = registry.getAllEntities();

        for (const entity of entities) {
            entityList.appendChild(this.getEntityListElement(entity, registry, assetStore, eventBus));
        }
    };

    private getEntityListElement = (entity: Entity, registry: Registry, assetStore: AssetStore, eventBus: EventBus) => {
        const entityComponents = entity.getComponents();

        const li = document.createElement('li');
        li.id = `entity-${entity.getId()}`;
        li.style.border = 'solid 1px white';
        li.onclick = () => (Editor.selectedEntity = entity.getId());

        const header = document.createElement('div');
        header.className = 'd-flex align-center space-between';

        const title = document.createElement('h3');
        title.textContent = `Entity id: ${entity.getId()}`;

        const duplicateButton = document.createElement('button');
        duplicateButton.innerText = 'DUPLICATE';
        duplicateButton.onclick = () => {
            eventBus.emitEvent(EntityDuplicateEvent, entity);
        };

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'DELETE';
        deleteButton.onclick = () => {
            eventBus.emitEvent(EntityDeleteEvent, entity);
        };

        header.append(title);
        header.append(duplicateButton);
        header.append(deleteButton);
        li.appendChild(header);

        const componentSelector = document.createElement('div');
        componentSelector.className = 'd-flex align-center space-between pt-2';

        const addComponentButton = document.createElement('button');
        addComponentButton.innerText = 'Add component';
        addComponentButton.onclick = () => {
            const entityComponentSelector = document.getElementById(
                'component-select-' + entity.getId(),
            ) as HTMLSelectElement;

            if (!entityComponentSelector) {
                throw new Error('Could not find component selector for entity ' + entity.getId());
            }

            const ComponentClass = GameComponents[entityComponentSelector.value as keyof typeof GameComponents];

            if (entity.hasComponent(ComponentClass)) {
                showAlert(`Entity with id ${entity.getId()} already has component ` + entityComponentSelector.value);
            } else {
                entity.addComponent(ComponentClass);

                const component = entity.getComponent(ComponentClass);

                if (!component) {
                    throw new Error('Could not find new component for entity ' + entity.getId());
                }

                // Entities are added to systems only on creation, here we force and update to all systems
                registry.removeEntityFromSystems(entity);
                registry.addEntityToSystems(entity);

                const componentContainer = this.getComponentContainer(component, entity.getId(), assetStore);
                li.appendChild(componentContainer);
            }
        };

        const select = document.createElement('select');
        select.id = 'component-select-' + entity.getId();

        const options: { value: string; text: string }[] = [];
        for (const componentKey in GameComponents) {
            options.push({ value: componentKey, text: componentKey });
        }

        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.text;
            select.appendChild(option);
        });

        componentSelector.appendChild(addComponentButton);
        componentSelector.appendChild(select);
        li.appendChild(componentSelector);

        const forms = this.getComponentsForms(entityComponents, entity.getId(), assetStore);
        li.appendChild(forms);

        return li;
    };

    private renderLevelSettings = (sidebar: HTMLElement) => {
        const gameWidthInput = sidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = sidebar.querySelector('#map-height') as HTMLInputElement;
        const snapGridInput = sidebar.querySelector('#snap-grid') as HTMLInputElement;
        const showGridInput = sidebar.querySelector('#show-grid') as HTMLInputElement;
        const gridSideInput = sidebar.querySelector('#grid-side') as HTMLInputElement;

        if (!gameWidthInput || !gameHeightInput || !snapGridInput || !showGridInput || !gridSideInput) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();
        snapGridInput.checked = Editor.snapToGrid;
        showGridInput.checked = Editor.showGrid;
        gridSideInput.value = Editor.gridSquareSide.toString();

        gameWidthInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapWidth = parseInt(target.value);
        });

        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapHeight = parseInt(target.value);
        });

        snapGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.snapToGrid = target.checked;
        });

        showGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.showGrid = target.checked;
        });

        gridSideInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.gridSquareSide = parseInt(target.value);
        });
    };

    private renderSaveButtons(sidebar: HTMLElement, registry: Registry, assetStore: AssetStore) {
        const saveToJsonButton = sidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const saveToLocalButton = sidebar.querySelector('#save-to-local') as HTMLButtonElement;

        if (!saveToJsonButton || !saveToLocalButton) {
            throw new Error('Could not retrieve level save button(s)');
        }

        saveToJsonButton.onclick = () => saveLevelToJson(registry, assetStore);
        saveToLocalButton.onclick = () => saveLevelToLocalStorage('level', registry, assetStore);
    }

    private getComponentsForms = (
        entityComponents: Component[],
        entityId: number,
        assetStore: AssetStore,
    ): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'pt-2';

        for (const component of entityComponents) {
            const componentContainer = this.getComponentContainer(component, entityId, assetStore);
            container.append(componentContainer);
        }

        return container;
    };

    private getComponentContainer = (component: Component, entityId: number, assetStore: AssetStore) => {
        const componentContainer = document.createElement('div');
        componentContainer.className = 'pb-2';
        const title = document.createElement('span');
        const componentName = component.constructor.name;
        title.innerText = '* ' + componentName;
        componentContainer.append(title);

        const properties = Object.keys(component);

        for (const key of properties) {
            const form = this.getPropertyInput(key, (component as any)[key], component, entityId, assetStore);

            if (form) {
                componentContainer.append(form);
            }
        }

        if (properties.length === 0) {
            const li = document.createElement('li');
            li.className = 'd-flex align-center';
            li.innerText = 'No property for this component...';
            componentContainer.append(li);
        }

        return componentContainer;
    };

    private getPropertyInput = (
        propertyName: string,
        propertyValue: number | boolean | Vector | Rectangle,
        component: Component,
        entityId: number,
        assetStore: AssetStore,
    ) => {
        if (propertyValue === null) {
            return null;
        }

        if (component.constructor.name === 'SpriteComponent' && propertyName === 'assetId') {
            const select = document.createElement('select');
            select.id = propertyName + '-' + entityId;

            const textureIds = assetStore.getAllTexturesIds();
            const options: { value: string; text: string }[] = [];

            for (const textureId of textureIds) {
                options.push({ value: textureId, text: textureId });
            }

            options.forEach(optionData => {
                const option = document.createElement('option');
                option.value = optionData.value;
                option.textContent = optionData.text;
                select.appendChild(option);
            });

            select.value = (component as any)[propertyName];

            select.addEventListener('change', (event: Event): void => {
                const target = event.target as HTMLSelectElement;
                (component as any)[propertyName] = target.value;
            });

            const propertyLi = this.createListItem(propertyName, select);
            return propertyLi;
        }

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
                if (isVector(propertyValue) || isRectangle(propertyValue)) {
                    const objectContainer = document.createElement('div');

                    for (const property in propertyValue) {
                        const textInput = this.createInput(
                            'number',
                            propertyName + '-' + property + '-' + entityId,
                            propertyValue[property as keyof typeof propertyValue],
                        );
                        textInput.addEventListener('input', event => {
                            const target = event.target as HTMLInputElement;
                            (component as any)[propertyName][property as keyof typeof propertyValue] = parseFloat(
                                target.value,
                            );
                        });
                        const propertyLi = this.createListItem(propertyName + ' (' + property + ')', textInput);
                        objectContainer.append(propertyLi);
                    }

                    return objectContainer;
                    // const vectorContainer = document.createElement('div');

                    // const textInput1 = this.createInput('number', propertyName + '-x-' + entityId, propertyValue.x);
                    // textInput1.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].x = parseInt(target.value);
                    // });

                    // const textInput2 = this.createInput('number', propertyName + '-y-' + entityId, propertyValue.y);
                    // textInput2.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].y = parseInt(target.value);
                    // });

                    // const propertyLi1 = this.createListItem(propertyName + ' (x)', textInput1);
                    // const propertyLi2 = this.createListItem(propertyName + ' (y)', textInput2);

                    // vectorContainer.append(propertyLi1);
                    // vectorContainer.append(propertyLi2);

                    // return vectorContainer;
                }

                if (isRectangle(propertyValue)) {
                    // const vectorContainer = document.createElement('div');
                    // const textInput1 = this.createInput(
                    //     'number',
                    //     propertyName + '-x-' + entityId,
                    //     (propertyValue as Rectangle).x,
                    // );
                    // textInput1.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].x = parseInt(target.value);
                    // });
                    // const textInput2 = this.createInput(
                    //     'number',
                    //     propertyName + '-y-' + entityId,
                    //     (propertyValue as Rectangle).y,
                    // );
                    // textInput2.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].y = parseInt(target.value);
                    // });
                    // const textInput3 = this.createInput(
                    //     'number',
                    //     propertyName + '-width-' + entityId,
                    //     (propertyValue as Rectangle).width,
                    // );
                    // textInput3.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].width = parseInt(target.value);
                    // });
                    // const textInput4 = this.createInput(
                    //     'number',
                    //     propertyName + '-height-' + entityId,
                    //     (propertyValue as Rectangle).height,
                    // );
                    // textInput4.addEventListener('input', event => {
                    //     const target = event.target as HTMLInputElement;
                    //     (component as any)[propertyName].height = parseInt(target.value);
                    // });
                    // const propertyLi1 = this.createListItem(propertyName + ' (x)', textInput1);
                    // const propertyLi2 = this.createListItem(propertyName + ' (y)', textInput2);
                    // const propertyLi3 = this.createListItem(propertyName + ' (width)', textInput3);
                    // const propertyLi4 = this.createListItem(propertyName + ' (height)', textInput4);
                    // vectorContainer.append(propertyLi1);
                    // vectorContainer.append(propertyLi2);
                    // vectorContainer.append(propertyLi3);
                    // vectorContainer.append(propertyLi4);
                    // return vectorContainer;
                }

                if (Array.isArray(propertyValue)) {
                    console.log('Is array');
                }

                console.warn(
                    `Uknown type of property ${propertyName} with value ${propertyValue} for component ${component.constructor.name}`,
                );
                return null;
                //throw new Error(`Uknown type of property ${propertyName} with value ${propertyValue}`);
            }
        }
    };

    private createListItem = (label: string, input: HTMLInputElement | HTMLSelectElement): HTMLLIElement => {
        const li = document.createElement('li');
        li.className = 'd-flex space-between align-center';

        const span = document.createElement('span');
        span.innerText = label;
        span.className = 'label-text';

        li.append(span);
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
