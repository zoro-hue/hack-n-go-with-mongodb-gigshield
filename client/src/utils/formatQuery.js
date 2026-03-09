/**
 * Converts a parsed MongoDB query object into a human-readable shell string.
 * Used as a fallback if the server doesn't return a generatedQuery.
 */
export const formatQuery = ({ collection, operation, query, options, pipeline } = {}) => {
  if (!collection || !operation) return "// Invalid query";

  try {
    if (operation === "aggregate") {
      return `db.${collection}.aggregate(${JSON.stringify(pipeline || [], null, 2)})`;
    }

    if (operation === "countDocuments") {
      return `db.${collection}.countDocuments(${JSON.stringify(query || {}, null, 2)})`;
    }

    // find
    let str = `db.${collection}.find(${JSON.stringify(query || {}, null, 2)})`;
    if (options?.sort && Object.keys(options.sort).length > 0) {
      str += `\n  .sort(${JSON.stringify(options.sort)})`;
    }
    if (options?.limit) {
      str += `\n  .limit(${options.limit})`;
    }
    if (options?.projection && Object.keys(options.projection).length > 0) {
      str += `\n  .project(${JSON.stringify(options.projection)})`;
    }
    return str;
  } catch {
    return "// Could not format query";
  }
};
