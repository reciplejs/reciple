export class Test {
    method(test: number): void
    method(test: string): void
    method(test: string|number) {
        console.log(test)
    }
}
