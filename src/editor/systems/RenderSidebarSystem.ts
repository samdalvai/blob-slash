import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Component from '../../engine/ecs/Component';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import { saveLevelToJson, saveLevelToLocalStorage } from '../../engine/serialization/persistence';
import { Rectangle, Vector } from '../../engine/types/utils';
import * as GameComponents from '../../game/components';
import * as GameSystems from '../../game/systems';
import Editor from '../Editor';
import EntityDeleteEvent from '../events/EntityDeleteEvent';
import EntityDuplicateEvent from '../events/EntityDuplicateEvent';
import EntitySelectEvent from '../events/EntitySelectEvent';
import { showAlert } from '../gui';

export default class RenderSidebarSystem extends System {
    constructor() {
        super();
    }

    subscribeToEvents(eventBus: EventBus, leftSidebar: HTMLElement | null, assetStore: AssetStore) {
        eventBus.subscribeToEvent(EntitySelectEvent, this, event => this.onEntitySelect(event, leftSidebar));
        eventBus.subscribeToEvent(EntityDeleteEvent, this, event => this.onEntityDelete(event, leftSidebar));
        eventBus.subscribeToEvent(EntityDuplicateEvent, this, event =>
            this.onEntityDuplicate(event, leftSidebar, assetStore, eventBus),
        );
    }

    onEntitySelect = (event: EntitySelectEvent, leftSidebar: HTMLElement | null) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list');

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

    onEntityDelete = (event: EntitySelectEvent, leftSidebar: HTMLElement | null) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list');

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
        leftSidebar: HTMLElement | null,
        assetStore: AssetStore,
        eventBus: EventBus,
    ) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const originalEntity = event.entity;
        const entityCopy = event.entity.duplicate();

        entityList.appendChild(this.getEntityListElement(entityCopy, originalEntity.registry, assetStore, eventBus));

        eventBus.emitEvent(EntitySelectEvent, entityCopy);
    };

    // TODO: move settings to right sidebar
    update(
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
    ) {
        this.renderEntityList(leftSidebar, registry, assetStore, eventBus);
        this.renderActiveSystems(rightSidebar);
        this.renderLevelSettings(rightSidebar);
        this.renderSaveButtons(rightSidebar, registry, assetStore);
    }

    private renderEntityList = (
        leftSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
    ) => {
        const entityList = leftSidebar.querySelector('#entity-list');

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

    private renderActiveSystems = (rightSidebar: HTMLElement) => {
        const activeSystemsList = rightSidebar.querySelector('#active-systems');

        if (!activeSystemsList) {
            throw new Error('Could not retrieve active systems list');
        }

        for (const systemKey in GameSystems) {
            const checkBoxInput = this.createInput('checkbox', systemKey, Editor.activeSystems[systemKey]);
            checkBoxInput.addEventListener('input', event => {
                const target = event.target as HTMLInputElement;
                Editor.activeSystems[systemKey] = target.checked;
            });
            const propertyLi = this.createListItem(systemKey, checkBoxInput);
            activeSystemsList.appendChild(propertyLi);
        }
    };

    private renderLevelSettings = (rightSidebar: HTMLElement) => {
        const gameWidthInput = rightSidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = rightSidebar.querySelector('#map-height') as HTMLInputElement;
        const dynamicSystemsInput = rightSidebar.querySelector('#enable-dynamic') as HTMLInputElement;
        const snapGridInput = rightSidebar.querySelector('#snap-grid') as HTMLInputElement;
        const showGridInput = rightSidebar.querySelector('#show-grid') as HTMLInputElement;
        const gridSideInput = rightSidebar.querySelector('#grid-side') as HTMLInputElement;

        if (
            !gameWidthInput ||
            !gameHeightInput ||
            !dynamicSystemsInput ||
            !snapGridInput ||
            !showGridInput ||
            !gridSideInput
        ) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();
        dynamicSystemsInput.checked = Editor.dynamicSystemsActive;
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

        // TODO: allow user to define which systems are active?? E.g. one input per system
        dynamicSystemsInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.dynamicSystemsActive = target.checked;
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

    private renderSaveButtons(rightSidebar: HTMLElement, registry: Registry, assetStore: AssetStore) {
        const saveToJsonButton = rightSidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const saveToLocalButton = rightSidebar.querySelector('#save-to-local') as HTMLButtonElement;

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
        propertyValue: string | number | boolean | Vector | Rectangle,
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

        if (Array.isArray(propertyValue)) {
            const arrayContainer = document.createElement('div');
            for (const property of propertyValue as Array<any>) {
                arrayContainer.append(this.createListItemWithInput(propertyName, property, component, entityId));
            }

            return arrayContainer;
        }

        return this.createListItemWithInput(propertyName, propertyValue, component, entityId);
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

    private createListItemWithInput = (
        propertyName: string,
        propertyValue: string | number | boolean | object,
        component: Component,
        entityId: number,
    ) => {
        return this.createListItemWithInputRec(
            propertyName,
            propertyName,
            propertyName,
            propertyValue,
            component,
            entityId,
        );
    };

    private createListItemWithInputRec = (
        id: string,
        label: string,
        propertyName: string,
        propertyValue: string | number | boolean | object,
        component: Component,
        entityId: number,
    ) => {
        switch (typeof propertyValue) {
            case 'string': {
                const textInput = this.createInput('text', id + '-' + propertyName + '-' + entityId, propertyValue);
                textInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.value;
                });

                const propertyLi = this.createListItem(label, textInput);
                return propertyLi;
            }
            case 'number': {
                const numberInput = this.createInput('number', id + '-' + propertyName + '-' + entityId, propertyValue);
                numberInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = parseFloat(target.value);
                });
                const propertyLi = this.createListItem(label, numberInput);
                return propertyLi;
            }
            case 'boolean': {
                const checkBoxInput = this.createInput(
                    'checkbox',
                    id + '-' + propertyName + '-' + entityId,
                    propertyValue,
                );
                checkBoxInput.addEventListener('input', event => {
                    const target = event.target as HTMLInputElement;
                    (component as any)[propertyName] = target.checked;
                });
                const propertyLi = this.createListItem(label, checkBoxInput);
                return propertyLi;
            }
            case 'object': {
                const objectContainer = document.createElement('div');

                for (const property in propertyValue) {
                    objectContainer.append(
                        this.createListItemWithInputRec(
                            id,
                            label + '-' + property,
                            property,
                            propertyValue[property as keyof typeof propertyValue],
                            propertyValue,
                            entityId,
                        ),
                    );
                }

                return objectContainer;
            }
            default:
                throw new Error(
                    `Uknown type of property ${propertyName} with value ${propertyValue} for component ${component.constructor.name}`,
                );
        }
    };
}
