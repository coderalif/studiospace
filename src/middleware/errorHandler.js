function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  // Turn common database and upload errors into clear, safe API responses.
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Please check the submitted information.",
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "The supplied ID is not valid." });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "The image must be 5 MB or smaller." });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  console.error(error);
  return res.status(error.status || 500).json({
    message: error.status ? error.message : "An unexpected server error occurred.",
  });
}

module.exports = errorHandler;
