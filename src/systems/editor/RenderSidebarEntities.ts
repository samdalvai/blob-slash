import Component from '../../ecs/Component';
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

        const entitiesIds = registry.getAllEntitiesIds();

        for (const entityId of entitiesIds) {
            const entityComponents = registry.getAllEntityComponents(entityId);
            console.log(entityComponents);

            const li = document.createElement('li');
            li.id = `entity-${entityId}`;
            li.textContent = `Entity id: ${entityId}`;
            li.onclick = () => console.log(`Clicked entity ${entityId}`);

            // const hr = document.createElement('hr');
            // li.appendChild(hr);

            const forms = this.getComponentsForms(entityComponents);
            li.appendChild(forms);

            entityList.appendChild(li);
        }
    }

    private getComponentsForms = (entityComponents: Component[]): HTMLElement => {
        const div = document.createElement('div');
        div.className = 'pt-2';
        div.textContent = 'Ciccio';
        return div;
    };
}
