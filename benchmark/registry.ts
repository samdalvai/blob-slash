export type Benchmark = {
    name: string;
    run: () => unknown;
};

export const benchmarks: Benchmark[] = [];

export function benchmark(name: string, run: () => unknown) {
    benchmarks.push({ name, run });
}
