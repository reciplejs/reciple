export type Awaitable<T> = PromiseLike<T>|T;
export interface RecursiveDefault<T = unknown> {
    default?: T|RecursiveDefault<T>;
}
