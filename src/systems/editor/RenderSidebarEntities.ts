import Registry from '../../ecs/Registry';
import System from '../../ecs/System';

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

        console.log('num entities: ', registry.numEntities);

        const entitiesIds = registry.getAllEntitiesIds();

        console.log('entitiesIds = ', entitiesIds);

        const li1 = document.createElement('li');
        li1.textContent = 'Entity 1';
        li1.onclick = () => console.log('Entity 1 clicked');
        entityList.appendChild(li1);

        const li2 = document.createElement('li');
        li2.textContent = 'Entity 2';
        li2.onclick = () => console.log('Entity 2 clicked');
        entityList.appendChild(li2);
    }
}
