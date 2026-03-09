const { getDB } = require("../config/db");

const EXCLUDED_COLLECTIONS = ["system.indexes", "system.users", "system.version"];
const SAMPLE_SIZE = 100;

let cachedSchema = null;
let cacheExpiry = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Introspects the MongoDB database to infer collection schemas.
 * Samples up to SAMPLE_SIZE documents per collection to discover field names.
 * Results are cached for CACHE_TTL_MS to avoid repeated DB calls.
 */
const getSchema = async () => {
  const now = Date.now();

  // Return cached schema if still valid
  if (cachedSchema && cacheExpiry && now < cacheExpiry) {
    return cachedSchema;
  }

  const db = getDB();
  if (!db) throw new Error("Database not connected.");

  const collections = await db.listCollections().toArray();
  const schema = {};

  for (const { name } of collections) {
    if (EXCLUDED_COLLECTIONS.includes(name)) continue;

    try {
      const sample = await db.collection(name).find({}).limit(SAMPLE_SIZE).toArray();
      const fields = new Set();

      sample.forEach((doc) => {
        Object.keys(doc).forEach((key) => fields.add(key));
      });

      if (fields.size > 0) {
        schema[name] = [...fields];
      }
    } catch {
      // Skip collections we can't read
    }
  }

  // Update cache
  cachedSchema = schema;
  cacheExpiry = now + CACHE_TTL_MS;

  return schema;
};

/**
 * Forces schema cache to refresh on next call.
 */
const invalidateCache = () => {
  cachedSchema = null;
  cacheExpiry = null;
};

module.exports = { getSchema, invalidateCache };
