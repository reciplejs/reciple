export type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as KeyType]: Type[Properties]
}
