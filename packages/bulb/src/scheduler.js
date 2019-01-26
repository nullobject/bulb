/**
 * Executes the function `f` asynchronously.
 *
 * @private
 */
export function asap (f) {
  setTimeout(f, 0)
}
