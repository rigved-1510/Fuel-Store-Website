/**
 * Higher-order function that wraps async route handlers.
 * Catches rejected promises and forwards to Express error middleware.
 */
export function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
