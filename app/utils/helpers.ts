import type {Result} from "~/types/helpers";

export function isNullOrUndefined(
    val: unknown,
): val is null | undefined {
    return val === null || val === undefined;
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