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
