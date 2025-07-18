import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Component from '../../engine/ecs/Component';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import LevelManager from '../../engine/level-manager/LevelManager';
import {
    saveCurrentLevelToLocalStorage,
    saveLevelMapToLocalStorage,
    saveLevelToJson,
} from '../../engine/serialization/persistence';
import { LevelMap } from '../../engine/types/map';
import { Rectangle, Vector } from '../../engine/types/utils';
import * as GameComponents from '../../game/components';
import EntityKilledEvent from '../../game/events/EntityKilledEvent';
import * as GameSystems from '../../game/systems';
import Editor from '../Editor';
import EntityDeleteEvent from '../events/EntityDeleteEvent';
import EntityDuplicateEvent from '../events/EntityDuplicateEvent';
import EntitySelectEvent from '../events/EntitySelectEvent';
import { showAlert } from '../gui';
import {
    getAllLevelKeysFromLocalStorage,
    getNextLevelId,
    saveEditorSettingsToLocalStorage,
} from '../persistence/persistence';

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
        eventBus.subscribeToEvent(EntityKilledEvent, this, event => this.onEntityKilled(event, leftSidebar));
    }

    onEntitySelect = (event: EntitySelectEvent, leftSidebar: HTMLElement | null) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        this.scrollToListElement(leftSidebar, `#entity-${event.entity.getId()}`);
    };

    onEntityDelete = (event: EntityDeleteEvent, leftSidebar: HTMLElement | null) => {
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

        entityList.appendChild(
            this.getEntityListElement(entityCopy, originalEntity.registry, assetStore, eventBus, leftSidebar),
        );

        eventBus.emitEvent(EntitySelectEvent, entityCopy);
    };

    onEntityKilled = (event: EntityKilledEvent, leftSidebar: HTMLElement | null) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const targetElement = entityList.querySelector(`#entity-${event.entity.getId()}`);

        if (targetElement) {
            if (event.entity.getId() === Editor.selectedEntity) {
                Editor.selectedEntity = null;
            }
            targetElement.remove();
        }
    };

    update(
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
        levelManager: LevelManager,
    ) {
        this.renderEntityList(leftSidebar, registry, assetStore, eventBus);
        this.renderActiveSystems(rightSidebar);
        this.renderLevelSettings(rightSidebar);
        this.renderLevelManagement(rightSidebar, registry, assetStore, levelManager);
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
            entityList.appendChild(this.getEntityListElement(entity, registry, assetStore, eventBus, leftSidebar));
        }

        const addEntityButton = leftSidebar.querySelector('#add-entity') as HTMLButtonElement;

        if (!addEntityButton) {
            throw new Error('Could not find add entity button');
        }

        addEntityButton.onclick = () => {
            const entity = registry.createEntity();
            entityList.appendChild(this.getEntityListElement(entity, registry, assetStore, eventBus, leftSidebar));
            eventBus.emitEvent(EntitySelectEvent, entity);
        };
    };

    private getEntityListElement = (
        entity: Entity,
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
        leftSidebar: HTMLElement,
    ) => {
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
        addComponentButton.innerText = 'ADD COMPONENT';
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

                const componentContainer = this.getComponentContainer(component, entity, assetStore);
                li.appendChild(componentContainer);

                this.scrollToListElement(leftSidebar, `#${component.constructor.name}-${entity.getId()}`);
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

        const forms = this.getComponentsForms(entityComponents, entity, assetStore);
        li.appendChild(forms);

        return li;
    };

    private renderActiveSystems = (rightSidebar: HTMLElement) => {
        const activeSystemsList = rightSidebar.querySelector('#active-systems');

        if (!activeSystemsList) {
            throw new Error('Could not retrieve active systems list');
        }

        for (const systemKey in GameSystems) {
            const checkBoxInput = this.createInput(
                'checkbox',
                systemKey,
                Editor.editorSettings.activeSystems[systemKey as keyof typeof GameSystems],
            );
            checkBoxInput.addEventListener('input', event => {
                const target = event.target as HTMLInputElement;
                Editor.editorSettings.activeSystems[systemKey as keyof typeof GameSystems] = target.checked;
                saveEditorSettingsToLocalStorage();
            });
            const propertyLi = this.createListItem(systemKey, checkBoxInput);
            activeSystemsList.appendChild(propertyLi);
        }
    };

    private renderLevelSettings = (rightSidebar: HTMLElement) => {
        const gameWidthInput = rightSidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = rightSidebar.querySelector('#map-height') as HTMLInputElement;
        const snapGridInput = rightSidebar.querySelector('#snap-grid') as HTMLInputElement;
        const showGridInput = rightSidebar.querySelector('#show-grid') as HTMLInputElement;
        const gridSideInput = rightSidebar.querySelector('#grid-side') as HTMLInputElement;

        if (!gameWidthInput || !gameHeightInput || !snapGridInput || !showGridInput || !gridSideInput) {
            throw new Error('Could not retrieve level settings element(s)');
        }

        gameWidthInput.value = Engine.mapWidth.toString();
        gameHeightInput.value = Engine.mapHeight.toString();
        snapGridInput.checked = Editor.editorSettings.snapToGrid;
        showGridInput.checked = Editor.editorSettings.showGrid;
        gridSideInput.value = Editor.editorSettings.gridSquareSide.toString();

        gameWidthInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapWidth = parseInt(target.value);
            saveEditorSettingsToLocalStorage();
        });

        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapHeight = parseInt(target.value);
            saveEditorSettingsToLocalStorage();
        });

        snapGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.editorSettings.snapToGrid = target.checked;
            saveEditorSettingsToLocalStorage();
        });

        showGridInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.editorSettings.showGrid = target.checked;
            saveEditorSettingsToLocalStorage();
        });

        gridSideInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Editor.editorSettings.gridSquareSide = parseInt(target.value);
            saveEditorSettingsToLocalStorage();
        });
    };

    private renderLevelManagement(
        rightSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        levelManager: LevelManager,
    ) {
        const localStorageLevelsSelect = rightSidebar.querySelector('#local-storage-levels') as HTMLSelectElement;
        const saveToJsonButton = rightSidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const loadFromJsonButton = rightSidebar.querySelector('#load-from-json') as HTMLButtonElement;
        const fileInput = document.getElementById('file-input') as HTMLInputElement;

        if (!localStorageLevelsSelect || !saveToJsonButton || !loadFromJsonButton || !fileInput) {
            throw new Error('Could not retrieve level management element(s)');
        }

        const levelKeys = getAllLevelKeysFromLocalStorage();
        const options: { value: string; text: string }[] = [];
        for (const key of levelKeys) {
            options.push({ value: key, text: key });
        }

        options.forEach(optionData => {
            const option = document.createElement('option');
            option.value = optionData.value;
            option.textContent = optionData.text;
            localStorageLevelsSelect.appendChild(option);
        });

        localStorageLevelsSelect.addEventListener('change', async (event: Event): Promise<void> => {
            const target = event.target as HTMLSelectElement;
            const levelId = target.value;
            registry.clear();
            await levelManager.loadLevelFromLocalStorage(registry, levelId);
        });

        saveToJsonButton.onclick = () => saveLevelToJson(registry, assetStore);
        loadFromJsonButton.onclick = () => {
            fileInput.click();
        };

        fileInput.addEventListener('change', () => {
            const files = fileInput.files;
            if (files && files.length > 0) {
                const file: File = files[0];

                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const data = JSON.parse(reader.result as string);
                        const levelKeys = getAllLevelKeysFromLocalStorage();
                        const nextLevelId = getNextLevelId(levelKeys);

                        const levelMap = data as LevelMap;
                        saveLevelMapToLocalStorage(nextLevelId, levelMap);

                        const option = document.createElement('option');
                        option.value = nextLevelId;
                        option.textContent = nextLevelId;
                        localStorageLevelsSelect.appendChild(option);

                        localStorageLevelsSelect.value = nextLevelId;
                        registry.clear();
                        await levelManager.loadLevelFromLocalStorage(registry, nextLevelId);
                    } catch (e) {
                        console.error('Invalid JSON:', e);
                    }
                };

                reader.readAsText(file);
            }
        });
    }

    private getComponentsForms = (
        entityComponents: Component[],
        entity: Entity,
        assetStore: AssetStore,
    ): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'pt-2';

        for (const component of entityComponents) {
            const componentContainer = this.getComponentContainer(component, entity, assetStore);
            container.append(componentContainer);
        }

        return container;
    };

    private getComponentContainer = (component: Component, entity: Entity, assetStore: AssetStore) => {
        const componentContainer = document.createElement('div');
        componentContainer.className = 'pb-2';
        componentContainer.id = component.constructor.name + '-' + entity.getId();

        const componentHeader = document.createElement('div');
        componentHeader.className = 'd-flex space-between align-center';

        const title = document.createElement('span');
        const componentName = component.constructor.name;
        title.innerText = '* ' + componentName;
        title.style.textDecoration = 'underline';

        const removeButton = document.createElement('button');
        removeButton.innerText = 'REMOVE';
        removeButton.onclick = () => {
            const componentContainerToDelete = document.getElementById(
                component.constructor.name + '-' + entity.getId(),
            );

            if (!componentContainerToDelete) {
                throw new Error(
                    'Could not find component container to delete with id ' +
                        (component.constructor.name + '-' + entity.getId()),
                );
            }
            componentContainerToDelete.remove();
            const ComponentClass = GameComponents[component.constructor.name as keyof typeof GameComponents];
            entity.removeComponent(ComponentClass);

            entity.registry.removeEntityFromSystems(entity);
            entity.registry.addEntityToSystems(entity);
        };

        componentHeader.append(title);
        componentHeader.append(removeButton);
        componentContainer.append(componentHeader);

        const properties = Object.keys(component);

        for (const key of properties) {
            const form = this.getPropertyInput(key, (component as any)[key], component, entity.getId(), assetStore);

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
            const container = document.createElement('div');
            container.className = 'd-flex flex-col';

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

                const currentSpriteImage = document.getElementById('spritesheet-' + entityId) as HTMLImageElement;

                if (!currentSpriteImage) {
                    throw new Error('Could not find spritesheet image for entity with id ' + entityId);
                }

                const newAssetImg = assetStore.getTexture((component as GameComponents.SpriteComponent).assetId);
                currentSpriteImage.src = newAssetImg.src;
                currentSpriteImage.style.maxHeight = (newAssetImg.height > 100 ? newAssetImg.height : 100) + 'px';
            });

            const propertyLi = this.createListItem(propertyName, select);

            const spriteImage = document.createElement('img');
            const assetImg = assetStore.getTexture((component as GameComponents.SpriteComponent).assetId);
            spriteImage.src = assetImg.src;
            spriteImage.style.objectFit = 'contain';
            spriteImage.style.maxHeight = assetImg.height + 'px';
            spriteImage.style.maxWidth = '100%';
            spriteImage.style.height = 'auto';
            spriteImage.style.width = 'auto';
            spriteImage.id = 'spritesheet-' + entityId;

            container.append(propertyLi);
            container.append(spriteImage);

            return container;
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

    private createListItem = (label: string, input: HTMLElement): HTMLLIElement => {
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

    private scrollToListElement = (sidebar: HTMLElement, elementId: string) => {
        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const targetElement = entityList.querySelector(elementId);

        if (!targetElement) {
            throw new Error('Could not find target element in entity list');
        }

        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };
}
