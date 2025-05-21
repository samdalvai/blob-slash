import Registry from '../ecs/Registry';
import { serializeLevel } from './serialization';

export const saveLevelToJson = (registry: Registry): void => {
    const jsonString = JSON.stringify(serializeLevel(registry), null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot.json';
    a.click();

    URL.revokeObjectURL(url);

    console.log('Level snapshot saved');
};

export const saveLevelToLocalStorage = (registry: Registry) => {
    const jsonString = JSON.stringify(serializeLevel(registry), null, 2);
    localStorage.setItem('level', jsonString);
};
