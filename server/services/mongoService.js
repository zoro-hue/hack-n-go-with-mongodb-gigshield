const { getDB } = require("../config/db");

/**
 * Executes a validated, parsed MongoDB query and returns results.
 * Supports: find, aggregate, countDocuments
 */
const executeQuery = async ({ collection, operation, query, options, pipeline }) => {
  const db = getDB();

  if (!db) {
    throw new Error("Database not connected.");
  }

  const col = db.collection(collection);
  let results = [];

  switch (operation) {
    case "find": {
      const cursor = col.find(query || {});

      if (options?.sort && Object.keys(options.sort).length > 0) {
        cursor.sort(options.sort);
      }
      if (options?.projection && Object.keys(options.projection).length > 0) {
        cursor.project(options.projection);
      }

      const limit = options?.limit || 100;
      cursor.limit(limit);

      results = await cursor.toArray();
      break;
    }

    case "aggregate": {
      if (!Array.isArray(pipeline) || pipeline.length === 0) {
        throw new Error("Aggregate operation requires a non-empty pipeline array.");
      }

      // Safety: append $limit if not present to prevent unbounded aggregates
      const hasLimit = pipeline.some((stage) => stage.$limit !== undefined);
      const safePipeline = hasLimit ? pipeline : [...pipeline, { $limit: 500 }];

      results = await col.aggregate(safePipeline).toArray();
      break;
    }

    case "countDocuments": {
      const count = await col.countDocuments(query || {});
      results = [{ count }];
      break;
    }

    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }

  return { results, count: results.length };
};

module.exports = { executeQuery };
