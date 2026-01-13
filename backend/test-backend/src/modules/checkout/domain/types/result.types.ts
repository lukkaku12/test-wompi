// Success<T> represents a successful execution.
// When ok === true, the operation finished correctly
// and the result is stored in `value`.
export type Success<T> = { ok: true; value: T };

// Failure<E> represents a failed execution.
// When ok === false, the operation stopped early
// and the reason is stored in `error`.
export type Failure<E> = { ok: false; error: E };

// Result<T, E> means: an operation can return
// EITHER a Success<T>
// OR a Failure<E>, but never both.
//
// This forces callers to always handle both cases
// instead of assuming success.
export type Result<T, E> = Success<T> | Failure<E>;

// Ok(...) is just a small helper to create a Success result.
// It does NOT contain logic — it only wraps a value
// into the Success shape expected by Result.
export const Ok = <T>(value: T): Success<T> => ({
  ok: true,
  value,
});

// Err(...) is a helper to create a Failure result.
// It does NOT throw and does NOT handle HTTP errors.
// It simply marks the operation as failed and
// attaches a structured error object.
export const Err = <E>(error: E): Failure<E> => ({
  ok: false,
  error,
});