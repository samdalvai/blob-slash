import { Component, ComponentClass, createComponentCatalog } from '../engine';
import * as Components from './components';

export const gameComponentCatalog = createComponentCatalog(
    Object.entries(Components).map(([name, ComponentConstructor]) => ({
        name,
        constructor: ComponentConstructor as ComponentClass<Component>,
    })),
);
