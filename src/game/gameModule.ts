import { gameComponentCatalog } from './componentCatalog';
import * as Components from './components';
import * as Events from './events';
import * as Systems from './systems';

export { Components, Events, Systems, gameComponentCatalog };

export const gameModule = {
    components: gameComponentCatalog,
    events: Events,
    systems: Systems,
};
