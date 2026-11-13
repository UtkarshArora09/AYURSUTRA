const getJwtSecret = () => {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (["development", "test"].includes(process.env.NODE_ENV)) {
    return "ayursutra-local-dev-secret";
  }

  throw new Error("JWT_SECRET is required outside development and test");
};

module.exports = { getJwtSecret };
