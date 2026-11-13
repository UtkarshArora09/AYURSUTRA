function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }
  console.error("Request failed:", error.code || error.name);
  res.status(500).json({ message: "Request failed" });
}

module.exports = { errorHandler };