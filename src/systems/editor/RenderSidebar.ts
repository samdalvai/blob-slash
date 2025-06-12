import System from '../../ecs/System';
import Game from '../../game/Game';
import { Rectangle } from '../../types/utils';

export default class RenderSidebar extends System {
    constructor() {
        super();
    }

    update(sidebar: HTMLElement) {
        const entityList = sidebar.querySelector('#entity-list');

        if (!entityList) {
            throw new Error('Could not retrieve entity list');
        }

        entityList.innerHTML = '';

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
