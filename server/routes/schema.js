const express = require("express");
const router = express.Router();
const { getSchema, invalidateCache } = require("../services/schemaService");

/**
 * GET /api/schema
 * Returns introspected schema: { schema: { collectionName: [fields] } }
 */
router.get("/", async (req, res, next) => {
  try {
    const schema = await getSchema();
    res.json({ schema });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/schema/refresh
 * Forces schema cache to clear so next GET returns fresh data.
 */
router.post("/refresh", (req, res) => {
  invalidateCache();
  res.json({ message: "Schema cache cleared. Next request will re-introspect the database." });
});

module.exports = router;
