import AssetStore from '../../engine/asset-store/AssetStore';
import Component from '../../engine/ecs/Component';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import EventBus from '../../engine/event-bus/EventBus';
import LevelManager from '../../engine/level-manager/LevelManager';
import { deserializeEntity } from '../../engine/serialization/deserialization';
import { saveCurrentLevelToLocalStorage, saveEntityToJson } from '../../engine/serialization/persistence';
import { EntityMap } from '../../engine/types/map';
import { Rectangle, Vector } from '../../engine/types/utils';
import { isValidEntityMap } from '../../engine/utils/validation';
import * as GameComponents from '../../game/components';
import Editor from '../Editor';
import EntityDeleteEvent from '../events/EntityDeleteEvent';
import EntityDuplicateEvent from '../events/EntityDuplicateEvent';
import EntitySelectEvent from '../events/EntitySelectEvent';
import EntityUpdateEvent from '../events/EntityUpdateEvent';
import { createInput, createListItem, scrollToListElement, showAlert } from '../gui';
import VersionManager from '../version-manager/VersionManager';

export default class EntityEditor {
    private saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
    private registry: Registry;
    private assetStore: AssetStore;
    private eventBus: EventBus;
    private levelManager: LevelManager;
    private versionManager: VersionManager;

    private levelChangeLock: boolean;

    constructor(
        registry: Registry,
        assetStore: AssetStore,
        eventBus: EventBus,
        levelManager: LevelManager,
        versionManager: VersionManager,
    ) {
        this.registry = registry;
        this.assetStore = assetStore;
        this.eventBus = eventBus;
        this.levelManager = levelManager;
        this.versionManager = versionManager;

        this.levelChangeLock = false;
    }

    ////////////////////////////////////////////////////////////////////////////////
    // Level management
    ////////////////////////////////////////////////////////////////////////////////

    public saveLevel = () => {
        if (this.saveDebounceTimer) {
            clearTimeout(this.saveDebounceTimer);
        }

        this.saveDebounceTimer = setTimeout(() => {
            const levelMap = saveCurrentLevelToLocalStorage(
                Editor.editorSettings.selectedLevel,
                this.registry,
                this.assetStore,
            );

            if (Editor.editorSettings.selectedLevel) {
                this.versionManager.addLevelVersion(Editor.editorSettings.selectedLevel, levelMap);
            }
        }, 300);
    };

    public undoLevelChange = async () => {
        if (this.levelChangeLock) {
            return;
        }

        if (Editor.editorSettings.selectedLevel) {
            if (this.versionManager.isOldestVersion(Editor.editorSettings.selectedLevel)) {
                return;
            }

            this.levelChangeLock = true;
            this.versionManager.setPreviousLevelVersion(Editor.editorSettings.selectedLevel);
            const levelVersion = this.versionManager.getCurrentLevelVersion(Editor.editorSettings.selectedLevel);
            await this.levelManager.loadLevelFromLevelMap(levelVersion);
            this.eventBus.emitEvent(EntityUpdateEvent);
            saveCurrentLevelToLocalStorage(Editor.editorSettings.selectedLevel, this.registry, this.assetStore);
            this.levelChangeLock = false;
        }
    };

    public redoLevelChange = async () => {
        if (this.levelChangeLock) {
            return;
        }

        if (Editor.editorSettings.selectedLevel) {
            if (this.versionManager.isLatestVersion(Editor.editorSettings.selectedLevel)) {
                return;
            }

            this.levelChangeLock = true;
            this.versionManager.setNextLevelVersion(Editor.editorSettings.selectedLevel);
            const levelVersion = this.versionManager.getCurrentLevelVersion(Editor.editorSettings.selectedLevel);
            await this.levelManager.loadLevelFromLevelMap(levelVersion);
            this.eventBus.emitEvent(EntityUpdateEvent);
            saveCurrentLevelToLocalStorage(Editor.editorSettings.selectedLevel, this.registry, this.assetStore);
            this.levelChangeLock = false;
        }
    };

    ////////////////////////////////////////////////////////////////////////////////
    // Entity management
    ////////////////////////////////////////////////////////////////////////////////

    addEntity = (entityList: HTMLLIElement) => {
        console.log('Adding entity');
        const entity = this.registry.createEntity();
        entityList.appendChild(this.getEntityListElement(entity));
        entity.addComponent(GameComponents.TransformComponent);

        this.eventBus.emitEvent(EntitySelectEvent, [entity]);
        this.saveLevel();
    };

    removeEntity = (entity: Entity) => {
        entity.kill();
        this.saveLevel();
    };

    importEntity = (entityList: HTMLLIElement) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.addEventListener('change', () => {
            const files = input.files;
            if (files && files.length > 0) {
                const file: File = files[0];

                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const data = JSON.parse(reader.result as string);

                        const entityMap = data as EntityMap;

                        if (!isValidEntityMap(entityMap)) {
                            throw new Error('Loaded json is not a valid entity map: ' + entityMap);
                        }

                        const importedEntity = deserializeEntity(entityMap, this.registry);
                        entityList.appendChild(this.getEntityListElement(importedEntity));
                        this.eventBus.emitEvent(EntitySelectEvent, [importedEntity]);
                        Editor.selectedEntities = [importedEntity];
                        this.saveLevel();
                    } catch (e) {
                        console.error('Invalid JSON:', e);
                        showAlert('Selected json is not a valid entity map');
                    } finally {
                        input.value = '';
                    }
                };

                reader.readAsText(file);
            }
        });

        input.click();
    };

    ////////////////////////////////////////////////////////////////////////////////
    // Component management
    ////////////////////////////////////////////////////////////////////////////////

    addComponent = (entity: Entity, componentList: HTMLLIElement) => {
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
            this.registry.removeEntityFromSystems(entity);
            this.registry.addEntityToSystems(entity);

            const componentContainer = this.getComponentContainer(component, entity);
            componentList.appendChild(componentContainer);

            scrollToListElement('#entity-list', `#${component.constructor.name}-${entity.getId()}`);
        }

        this.saveLevel();
    };

    removeComponent = (component: Component, entity: Entity, containerId: string) => {
        const container = document.getElementById(containerId);
        if (!container) throw new Error(`Component container not found: ${containerId}`);
        container.remove();

        const ComponentClass = GameComponents[component.constructor.name as keyof typeof GameComponents];
        if (!ComponentClass) throw new Error(`Component class not found: ${component.constructor.name}`);

        entity.removeComponent(ComponentClass);
        this.registry.removeEntityFromSystems(entity);
        this.registry.addEntityToSystems(entity);
    };

    ////////////////////////////////////////////////////////////////////////////////
    // HMTL elements management
    ////////////////////////////////////////////////////////////////////////////////

    getEntityListElement = (entity: Entity) => {
        const entityComponents = entity.getComponents();

        const componentList = document.createElement('li');
        componentList.id = `entity-${entity.getId()}`;
        componentList.style.border = 'solid 1px white';
        componentList.onclick = () => (Editor.selectedEntities = [entity]);

        const header = document.createElement('div');
        header.className = 'd-flex align-center space-between';

        const title = document.createElement('h3');
        title.textContent = `Entity id: ${entity.getId()}`;

        const duplicateButton = document.createElement('button');
        duplicateButton.innerText = 'DUPLICATE';
        duplicateButton.onclick = () => {
            this.eventBus.emitEvent(EntityDuplicateEvent, entity);
        };

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'DELETE';
        deleteButton.onclick = () => this.eventBus.emitEvent(EntityDeleteEvent, entity);

        header.append(title);
        header.append(duplicateButton);
        header.append(deleteButton);
        componentList.appendChild(header);

        const entityTagInput = createInput('text', entity.getId() + '-tag', entity.getTag() ?? '');
        entityTagInput.addEventListener('input', e => {
            const value = (e.target as HTMLInputElement).value;
            entity.removeTag();

            if (value !== '') {
                entity.tag(value);
            }

            this.saveLevel();
        });
        const entityTagListItem = createListItem('Entity tag', entityTagInput);

        const entityGroupInput = createInput('text', entity.getId() + '-group', entity.getGroup() ?? '');
        entityGroupInput.addEventListener('input', e => {
            const value = (e.target as HTMLInputElement).value;
            entity.removeGroup();

            if (value !== '') {
                entity.group(value);
            }

            this.saveLevel();
        });
        const entityGroupListItem = createListItem('Entity group', entityGroupInput);

        componentList.append(entityTagListItem);
        componentList.append(entityGroupListItem);

        const exportToJsonButton = document.createElement('button');
        exportToJsonButton.innerText = 'Export to json';
        exportToJsonButton.onclick = () => saveEntityToJson(entity);
        componentList.append(exportToJsonButton);

        const componentSelector = document.createElement('div');
        componentSelector.className = 'd-flex align-center space-between pt-2';

        const addComponentButton = document.createElement('button');
        addComponentButton.innerText = 'ADD COMPONENT';
        addComponentButton.onclick = () => this.addComponent(entity, componentList);

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
        componentList.appendChild(componentSelector);

        const forms = this.getComponentsForms(entityComponents, entity);
        componentList.appendChild(forms);

        return componentList;
    };

    private getComponentsForms = (entityComponents: Component[], entity: Entity): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'pt-2';

        for (const component of entityComponents) {
            const componentContainer = this.getComponentContainer(component, entity);
            container.append(componentContainer);
        }

        return container;
    };

    private getComponentContainer = (component: Component, entity: Entity) => {
        const componentContainer = document.createElement('div');
        componentContainer.className = 'pb-2';
        componentContainer.id = component.constructor.name + '-' + entity.getId();

        const componentHeader = document.createElement('div');
        componentHeader.className = 'd-flex space-between align-center';

        const title = document.createElement('span');
        const componentName = component.constructor.name;
        title.innerText = '* ' + componentName;
        title.style.textDecoration = 'underline';
        componentHeader.append(title);

        if (component.constructor.name !== 'TransformComponent') {
            const removeButton = document.createElement('button');
            removeButton.innerText = 'REMOVE';
            removeButton.onclick = () => {
                this.removeComponent(component, entity, componentContainer.id);
                this.saveLevel();
            };
            componentHeader.append(removeButton);
        }

        componentContainer.append(componentHeader);

        const properties = Object.keys(component);

        for (const key of properties) {
            const form = this.getPropertyInput(key, (component as any)[key], component, entity.getId());

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
    ) => {
        if (propertyValue === null) {
            return null;
        }

        if (component.constructor.name === 'SpriteComponent' && propertyName === 'assetId') {
            return this.createSpriteSelector(propertyName, component, entityId);
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

    private createSpriteSelector = (propertyName: string, component: Component, entityId: number): HTMLElement => {
        const container = document.createElement('div');
        container.className = 'd-flex flex-col';

        const select = document.createElement('select');
        select.id = `${propertyName}-${entityId}`;

        this.assetStore.getAllTexturesIds().forEach(textureId => {
            const option = document.createElement('option');
            option.value = textureId;
            option.textContent = textureId || 'Unknown';
            select.appendChild(option);
        });

        select.value = (component as any)[propertyName];
        select.addEventListener('change', (e: Event) => {
            const target = e.target as HTMLSelectElement;
            (component as any)[propertyName] = target.value;

            const img = document.getElementById(`spritesheet-${entityId}`) as HTMLImageElement;
            if (!img) throw new Error(`Sprite image not found: ${entityId}`);

            const newAssetImg = this.assetStore.getTexture((component as GameComponents.SpriteComponent).assetId);
            img.src = newAssetImg.src;
            img.style.maxHeight = `${Math.max(newAssetImg.height, 100)}px`;

            this.saveLevel();
        });

        const propertyLi = createListItem(propertyName, select);

        const spriteImage = document.createElement('img');
        const assetImg = this.assetStore.getTexture((component as GameComponents.SpriteComponent).assetId);
        spriteImage.src = assetImg.src;
        spriteImage.style.objectFit = 'contain';
        spriteImage.style.maxHeight = `${assetImg.height}px`;
        spriteImage.style.maxWidth = '100%';
        spriteImage.id = `spritesheet-${entityId}`;

        const spritePicker = document.createElement('button');
        spritePicker.style.marginTop = '10px';
        spritePicker.innerText = 'Load sprite';

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.png';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', async () => {
            const files = fileInput.files;
            if (files && files.length > 0) {
                const file: File = files[0];
                const fileName = file.name;
                const assetId = fileName.replace('.png', '');

                try {
                    await this.assetStore.addTexture(assetId, './assets/sprites/' + fileName);
                } catch (error) {
                    try {
                        await this.assetStore.addTexture(assetId, './assets/tilemaps/' + fileName);
                    } catch (error) {
                        showAlert(
                            'Could not load file with name ' +
                                fileName +
                                ' from assets, the sprite mus be under dist/assets/sprites or dist/assets/tilemaps',
                        );
                        return;
                    }
                }

                const allEntities = this.registry.getAllEntities();

                for (const entity of allEntities) {
                    if (entity.hasComponent(GameComponents.SpriteComponent)) {
                        const entitySpriteSelect = document.getElementById('assetId-' + entity.getId());
                        if (!entitySpriteSelect) {
                            continue;
                        }

                        const option = document.createElement('option');
                        option.textContent = assetId;
                        option.value = assetId;
                        entitySpriteSelect.appendChild(option);
                    }
                }
                select.value = assetId;

                const newAssetImg = this.assetStore.getTexture(assetId);
                spriteImage.src = newAssetImg.src;
                spriteImage.style.objectFit = 'contain';
                spriteImage.style.maxHeight = `${newAssetImg.height}px`;
                spriteImage.style.maxWidth = '100%';
                (component as GameComponents.SpriteComponent).assetId = assetId;

                this.saveLevel();
            }
        });

        spritePicker.append(fileInput);
        spritePicker.onclick = () => fileInput.click();

        container.append(propertyLi, spriteImage);
        container.append(spritePicker);
        return container;
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
        const updateProperty = (newValue: any) => {
            (component as any)[propertyName] = newValue;
            this.saveLevel();
        };

        switch (typeof propertyValue) {
            case 'string': {
                const input = createInput('text', `${id}-${propertyName}-${entityId}`, propertyValue);
                input.addEventListener('input', e => updateProperty((e.target as HTMLInputElement).value));
                return createListItem(label, input);
            }
            case 'number': {
                const input = createInput('number', `${id}-${propertyName}-${entityId}`, propertyValue);
                input.addEventListener('input', e => updateProperty(parseFloat((e.target as HTMLInputElement).value)));
                return createListItem(label, input);
            }
            case 'boolean': {
                const input = createInput('checkbox', `${id}-${propertyName}-${entityId}`, propertyValue);
                input.addEventListener('input', e => updateProperty((e.target as HTMLInputElement).checked));
                return createListItem(label, input);
            }
            case 'object': {
                const container = document.createElement('div');

                for (const property in propertyValue) {
                    container.append(
                        this.createListItemWithInputRec(
                            id,
                            `${label}-${property}`,
                            property,
                            propertyValue[property as keyof typeof propertyValue],
                            propertyValue,
                            entityId,
                        ),
                    );
                }

                return container;
            }
            default:
                throw new Error(
                    `Uknown type of property ${propertyName} with value ${propertyValue} for component ${component.constructor.name}`,
                );
        }
    };
}
