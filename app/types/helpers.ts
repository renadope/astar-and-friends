export type Nullish<T> = T | null | undefined;
export type Optional<T> = T | undefined;
export type Result<T, E extends Error = Error> =
  | {
      success: true;
      value: T;
      error?: never;
    }
  | {
      success: false;
      value?: never;
      error: E;
    };
