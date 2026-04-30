declare const process: {
    on(event: 'exit', listener: () => void): void;
};

export function runOriginal() {
    //
}

export function runModified() {
    //
}

process.on('exit', () => {
    //
});
