import Engine from '../../engine/Engine';
import AssetStore from '../../engine/asset-store/AssetStore';
import Entity from '../../engine/ecs/Entity';
import Registry from '../../engine/ecs/Registry';
import System from '../../engine/ecs/System';
import EventBus from '../../engine/event-bus/EventBus';
import LevelManager from '../../engine/level-manager/LevelManager';
import { saveLevelToJson, saveLevelToLocalStorage } from '../../engine/serialization/persistence';
import { LevelMap } from '../../engine/types/map';
import { isValidLevelMap } from '../../engine/utils/level';
import { TransformComponent } from '../../game/components';
import EntityKilledEvent from '../../game/events/EntityKilledEvent';
import * as GameSystems from '../../game/systems';
import Editor from '../Editor';
import EntityEditor from '../entity-editor/EntityEditor';
import EntityDeleteEvent from '../events/EntityDeleteEvent';
import EntityDuplicateEvent from '../events/EntityDuplicateEvent';
import EntityPasteEvent from '../events/EntityPasteEvent';
import EntitySelectEvent from '../events/EntitySelectEvent';
import EntityUpdateEvent from '../events/EntityUpdateEvent';
import { createInput, createListItem, showAlert } from '../gui';
import {
    deleteLevelFromLocalStorage,
    getAllLevelKeysFromLocalStorage,
    getNextLevelId,
    saveEditorSettingsToLocalStorage,
} from '../persistence/persistence';

export default class RenderSidebarSystem extends System {
    private entityEditor: EntityEditor;

    constructor(entityEditor: EntityEditor) {
        super();
        this.entityEditor = entityEditor;
    }

    subscribeToEvents(eventBus: EventBus, leftSidebar: HTMLElement) {
        eventBus.subscribeToEvent(EntitySelectEvent, this, event => this.onEntitySelect(event, leftSidebar));
        eventBus.subscribeToEvent(EntityDeleteEvent, this, event => this.onEntityDelete(event, leftSidebar));
        eventBus.subscribeToEvent(EntityDuplicateEvent, this, event =>
            this.onEntityDuplicate(event, leftSidebar, eventBus),
        );
        eventBus.subscribeToEvent(EntityPasteEvent, this, event => this.onEntityPaste(event, leftSidebar, eventBus));
        eventBus.subscribeToEvent(EntityKilledEvent, this, event => this.onEntityKilled(event, leftSidebar));
        eventBus.subscribeToEvent(EntityUpdateEvent, this, () => this.renderEntityList(leftSidebar));
    }

    onEntitySelect = (event: EntitySelectEvent, leftSidebar: HTMLElement) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list') as HTMLLIElement;

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        if (!event.entity) {
            this.renderNoEntitySelected(entityList);
            return;
        }

        entityList.innerHTML = '';
        entityList.appendChild(this.entityEditor.getEntityListElement(event.entity));
    };

    onEntityDelete = (event: EntityDeleteEvent, leftSidebar: HTMLElement) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list') as HTMLLIElement;

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        this.entityEditor.removeEntity(event.entity);
        this.renderNoEntitySelected(entityList);
    };

    onEntityDuplicate = (event: EntityDuplicateEvent, leftSidebar: HTMLElement, eventBus: EventBus) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list') as HTMLLIElement;

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const entityCopy = event.entity.duplicate();

        entityList.appendChild(this.entityEditor.getEntityListElement(entityCopy));

        eventBus.emitEvent(EntitySelectEvent, entityCopy);
        Editor.selectedEntities = [entityCopy];
        this.entityEditor.saveLevel();
    };

    onEntityPaste = (event: EntityPasteEvent, leftSidebar: HTMLElement, eventBus: EventBus) => {
        if (event.entities.length === 0) {
            return;
        }

        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list') as HTMLLIElement;

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const copiedEntities: Entity[] = [];

        let minTransformPositionX = Number.MAX_VALUE;
        let minTransformPositionY = Number.MAX_VALUE;

        for (const originalEntity of event.entities) {
            const entityCopy = originalEntity.duplicate();
            const copiedTransform = entityCopy.getComponent(TransformComponent);

            if (!copiedTransform) {
                throw new Error('Could not get transform component of entity ' + entityCopy.getId());
            }

            if (minTransformPositionX > copiedTransform.position.x) {
                minTransformPositionX = copiedTransform.position.x;
            }

            if (minTransformPositionY > copiedTransform.position.y) {
                minTransformPositionY = copiedTransform.position.y;
            }

            copiedEntities.push(entityCopy);
            entityList.appendChild(this.entityEditor.getEntityListElement(entityCopy));
        }

        if (copiedEntities.length === 0) {
            return;
        }

        Editor.entityDragStart = {
            x: minTransformPositionX,
            y: minTransformPositionY,
        };
        Editor.isDragging = true;

        eventBus.emitEvent(EntitySelectEvent, copiedEntities[0]);
        Editor.selectedEntities = [...copiedEntities];
        this.entityEditor.saveLevel();
    };

    onEntityKilled = (event: EntityKilledEvent, leftSidebar: HTMLElement) => {
        if (!leftSidebar) {
            throw new Error('Could not retrieve leftSidebar');
        }

        const entityList = leftSidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        const targetElement = entityList.querySelector(`#entity-${event.entity.getId()}`);

        if (targetElement) {
            // TODO: do we need to update this?
            if (Editor.selectedEntities.length === 1 && event.entity.getId() === Editor.selectedEntities[0].getId()) {
                Editor.selectedEntities.length = 0;
            }
            targetElement.remove();
        }
    };

    update(
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        levelManager: LevelManager,
    ) {
        this.renderEntityList(leftSidebar);
        this.renderActiveSystems(rightSidebar);
        this.renderLevelSettings(rightSidebar);
        this.renderLevelManagement(rightSidebar, leftSidebar, registry, assetStore, levelManager);
    }

    private renderEntityList = (leftSidebar: HTMLElement) => {
        const addEntityButton = leftSidebar.querySelector('#add-entity') as HTMLButtonElement;

        if (!addEntityButton) {
            throw new Error('Could not find add entity button');
        }

        addEntityButton.onclick = () => this.entityEditor.addEntity(entityList);

        const entityList = leftSidebar.querySelector('#entity-list') as HTMLLIElement;

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        this.renderNoEntitySelected(entityList);
    };

    private renderNoEntitySelected = (entityList: HTMLLIElement) => {
        entityList.innerHTML = '';

        const listElement = document.createElement('li');
        listElement.innerText = 'No entity selected...';
        entityList.appendChild(listElement);
    };

    private renderActiveSystems = (rightSidebar: HTMLElement) => {
        const activeSystemsList = rightSidebar.querySelector('#active-systems');

        if (!activeSystemsList) {
            throw new Error('Could not retrieve active systems list');
        }

        for (const systemKey in GameSystems) {
            const checkBoxInput = createInput(
                'checkbox',
                systemKey,
                Editor.editorSettings.activeSystems[systemKey as keyof typeof GameSystems],
            );
            checkBoxInput.addEventListener('input', event => {
                const target = event.target as HTMLInputElement;
                Editor.editorSettings.activeSystems[systemKey as keyof typeof GameSystems] = target.checked;
                saveEditorSettingsToLocalStorage();
            });
            const propertyLi = createListItem(systemKey, checkBoxInput);
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
            this.entityEditor.saveLevel();
        });

        gameHeightInput.addEventListener('input', event => {
            const target = event.target as HTMLInputElement;
            Engine.mapHeight = parseInt(target.value);
            this.entityEditor.saveLevel();
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
        leftSidebar: HTMLElement,
        registry: Registry,
        assetStore: AssetStore,
        levelManager: LevelManager,
    ) {
        const localStorageLevelsSelect = rightSidebar.querySelector('#local-storage-levels') as HTMLSelectElement;
        const newLevelButton = rightSidebar.querySelector('#new-level') as HTMLButtonElement;
        const deleteLevelButton = rightSidebar.querySelector('#delete-level') as HTMLButtonElement;
        const saveToJsonButton = rightSidebar.querySelector('#save-to-json') as HTMLButtonElement;
        const loadFromJsonButton = rightSidebar.querySelector('#load-from-json') as HTMLButtonElement;
        const fileInput = document.getElementById('file-input') as HTMLInputElement;

        if (
            !localStorageLevelsSelect ||
            !newLevelButton ||
            !deleteLevelButton ||
            !saveToJsonButton ||
            !loadFromJsonButton ||
            !fileInput
        ) {
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
            option.id = optionData.value;
            option.textContent = optionData.text;
            localStorageLevelsSelect.appendChild(option);
        });

        localStorageLevelsSelect.value = Editor.editorSettings.selectedLevel ?? options[0].value;

        localStorageLevelsSelect.addEventListener('change', async (event: Event): Promise<void> => {
            const target = event.target as HTMLSelectElement;
            const levelId = target.value;

            await this.handleLevelSelect(levelId, levelManager, registry, leftSidebar, rightSidebar);
        });

        newLevelButton.onclick = async () => {
            const levelKeys = getAllLevelKeysFromLocalStorage();
            const nextLevelId = getNextLevelId(levelKeys);

            const newLevelMap: LevelMap = {
                textures: [],
                sounds: [],
                mapWidth: 64 * 10,
                mapHeight: 64 * 10,
                entities: [],
            };

            saveLevelToLocalStorage(nextLevelId, newLevelMap);
            const option = document.createElement('option');
            option.value = nextLevelId;
            option.id = nextLevelId;
            option.textContent = nextLevelId;
            localStorageLevelsSelect.appendChild(option);

            await this.handleLevelSelect(nextLevelId, levelManager, registry, leftSidebar, rightSidebar);
        };

        deleteLevelButton.onclick = async () => {
            // TODO: add confirmation for deletion of level
            if (!Editor.editorSettings.selectedLevel) {
                throw new Error('No level selected');
            }

            deleteLevelFromLocalStorage(Editor.editorSettings.selectedLevel);
            const optionToDelete = rightSidebar.querySelector(
                '#' + Editor.editorSettings.selectedLevel,
            ) as HTMLSelectElement;

            if (!optionToDelete) {
                throw new Error('Could not locate option with id ' + Editor.editorSettings.selectedLevel);
            }

            optionToDelete.remove();

            const levelKeys = getAllLevelKeysFromLocalStorage();

            if (levelKeys.length > 0) {
                await this.handleLevelSelect(levelKeys[0], levelManager, registry, leftSidebar, rightSidebar);
            } else {
                console.log('No level available, loading default empty level');
                const { levelId, level } = levelManager.getDefaultLevel();
                saveLevelToLocalStorage(levelId, level);
                const option = document.createElement('option');
                option.value = levelId;
                option.id = levelId;
                option.textContent = levelId;
                localStorageLevelsSelect.appendChild(option);

                await this.handleLevelSelect(levelId, levelManager, registry, leftSidebar, rightSidebar);
            }
        };

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

                        if (!isValidLevelMap(levelMap)) {
                            throw new Error('Loaded json is not a valid levelmap: ' + levelMap);
                        }

                        saveLevelToLocalStorage(nextLevelId, levelMap);

                        const option = document.createElement('option');
                        option.value = nextLevelId;
                        option.id = nextLevelId;
                        option.textContent = nextLevelId;
                        localStorageLevelsSelect.appendChild(option);

                        await this.handleLevelSelect(nextLevelId, levelManager, registry, leftSidebar, rightSidebar);
                    } catch (e) {
                        console.error('Invalid JSON:', e);
                        showAlert('Selected json is not a valid level map');
                    } finally {
                        fileInput.value = '';
                    }
                };

                reader.readAsText(file);
            }
        });
    }

    private handleLevelSelect = async (
        levelId: string,
        levelManager: LevelManager,
        registry: Registry,
        leftSidebar: HTMLElement,
        rightSidebar: HTMLElement,
    ) => {
        Editor.loadingLevel = true;
        const level = await levelManager.loadLevelFromLocalStorage(levelId);
        if (!level) {
            throw new Error('Could not read level from local storage');
        }

        this.renderEntityList(leftSidebar);

        const gameWidthInput = rightSidebar.querySelector('#map-width') as HTMLInputElement;
        const gameHeightInput = rightSidebar.querySelector('#map-height') as HTMLInputElement;
        const levelSelect = rightSidebar.querySelector('#local-storage-levels') as HTMLSelectElement;

        if (!gameWidthInput || !gameHeightInput || !levelSelect) {
            throw new Error('Could not identify sidebar element(s)');
        }

        gameWidthInput.value = level.mapWidth.toString();
        gameHeightInput.value = level.mapHeight.toString();
        levelSelect.value = levelId;
        Editor.editorSettings.selectedLevel = levelId;

        saveEditorSettingsToLocalStorage();
        this.entityEditor.saveLevel();

        Editor.loadingLevel = false;
    };
}
