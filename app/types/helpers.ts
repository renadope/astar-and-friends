export type Nullish<T> = T | null | undefined
export type Optional<T> = T | undefined
export type Result<T, E extends Error = Error> =
    | {
    success: true
    value: T
    error?: never
}
    | {
    success: false
    value?: never
    error: E
}

export function ResultOk<T>(val: T): Result<T, never> {
    return {
        success: true,
        value: val,
    }
}

export function ResultErr<E extends Error = Error>(err: E): Result<never, E> {
    return {
        success: false,
        error: err,
    }
}
