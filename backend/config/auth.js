const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV !== "production") {
    return "ayursutra-local-dev-secret";
  }

  throw new Error("JWT_SECRET is required in production");
};

module.exports = { getJwtSecret };
