// Express 4 does not catch errors thrown in async functions.
// This wrapper forwards them to the central error handler.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
