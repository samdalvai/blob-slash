describe('Testing performance related functions', () => {
    test('A test on performance', () => {
        const times: number[] = [];

        for (let x = 0; x < 10; x++) {
            const start = performance.now();

            // Code to be tested
            for (let i = 0; i < 1000; i++) {
                //
            }

            const end = performance.now();
            times.push(end - start);
        }

        let sum = 0;
        for (let x = 0; x < times.length; x++) {
            sum += times[x];
        }
        // console.log('Time elapsed: ' + sum / times.length + ' ms');
    });
});
