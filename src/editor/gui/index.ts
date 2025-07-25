import Editor from '../Editor';

export const showAlert = (message: string) => {
    const customAlert = document.getElementById('custom-alert');
    const customAlertMessage = document.getElementById('custom-alert-message');

    if (!customAlert || !customAlertMessage) {
        throw new Error('Could not locate custom alert element(s)');
    }

    customAlertMessage.textContent = message;
    customAlert.classList.remove('hidden');

    Editor.alertShown = true;
};

export const closeAlert = () => {
    const customAlert = document.getElementById('custom-alert');

    if (!customAlert) {
        throw new Error('Could not locate custom alert element');
    }

    customAlert.classList.add('hidden');

    Editor.alertShown = false;
};

export const scrollToListElement = (listElementId: string, elementId: string) => {
    const listElement = document.querySelector(listElementId);

    if (!listElement) {
        throw new Error('Could not retrieve list element with id ' + listElementId);
    }

    const targetElement = listElement.querySelector(elementId);

    if (!targetElement) {
        throw new Error(`Could not find target element with id ${elementId} in list`);
    }

    targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
    });
};

export const createListItem = (label: string, input: HTMLElement): HTMLLIElement => {
    const li = document.createElement('li');
    li.className = 'd-flex space-between align-center';

    const span = document.createElement('span');
    span.innerText = label;
    span.className = 'label-text';

    li.append(span);
    li.append(input);
    return li;
};

export const createInput = (
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
