import Editor from '../Editor';
import { EditorSettings } from '../types';

export const saveEditorSettingsToLocalStorage = () => {
    const settings: EditorSettings = Editor.editorSettings;
    const jsonString = JSON.stringify(settings, null, 2);
    localStorage.setItem('editor-settings', jsonString);
};

export const loadEditorSettingsFromLocalStorage = (): EditorSettings | undefined => {
    const jsonString = localStorage.getItem('editor-settings') as any;
    return jsonString ? (JSON.parse(jsonString) as EditorSettings) : undefined;
};
