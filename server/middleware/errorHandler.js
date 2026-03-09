/**
 * Global Express error handler.
 * Must be the last middleware registered in app.js.
 */
const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  console.error(`[Error] ${req.method} ${req.path} →`, err.message);
  if (isDev) console.error(err.stack);

  // Handle known error types
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "ForbiddenQueryError") {
    return res.status(403).json({ error: err.message });
  }

  if (err.name === "AIParseError") {
    return res.status(502).json({
      error: "The AI returned an unexpected response. Please rephrase your question.",
      detail: isDev ? err.message : undefined,
    });
  }

  if (err.name === "MongoServerError") {
    return res.status(500).json({
      error: "Database error while executing the query.",
      detail: isDev ? err.message : undefined,
    });
  }

  // Default
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    detail: isDev ? err.stack : undefined,
  });
};

module.exports = errorHandler;
