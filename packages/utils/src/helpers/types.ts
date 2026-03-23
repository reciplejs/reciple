export type DateResolvable = Date|number|string;

export type Awaitable<T> = PromiseLike<T>|T;
export interface RecursiveDefault<T = unknown> {
    default?: T|RecursiveDefault<T>;
}

export interface DeferredPromiseData<T = void> {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason?: any) => void;
}
