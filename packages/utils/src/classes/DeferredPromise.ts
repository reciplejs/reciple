export class DeferredPromise<T = void> extends Promise<T> {
    public resolve!: (value: T|PromiseLike<T>) => void;
    public reject!: (reason?: any) => void;

    constructor(resolver?: (resolve: (value: T|PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        const self = {};

        super((resolve, reject) => {
            Object.assign(self, { resolve, reject });
        });

        Object.assign(this, self);

        if (resolver) {
            resolver(this.resolve, this.reject);
        }
    }
}
