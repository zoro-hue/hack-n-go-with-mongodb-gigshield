/**
 * Validates AI-generated MongoDB queries before execution.
 * Enforces a read-only whitelist and blocks dangerous keywords.
 */

const ALLOWED_OPERATIONS = new Set(["find", "aggregate", "countDocuments"]);

const BLOCKED_KEYWORDS = [
  "drop",
  "delete",
  "remove",
  "insert",
  "update",
  "replace",
  "createIndex",
  "dropIndex",
  "dropCollection",
  "dropDatabase",
  "eval",
  "mapReduce",
  "runCommand",
  "$where",
  "fs.files",
];

class ForbiddenQueryError extends Error {
  constructor(message) {
    super(message);
    this.name = "ForbiddenQueryError";
  }
}

const validateQuery = (parsed) => {
  if (!parsed || typeof parsed !== "object") {
    throw new ForbiddenQueryError("Invalid query structure received from AI.");
  }

  // Validate collection name (alphanumeric + underscore only)
  if (!parsed.collection || !/^[a-zA-Z0-9_]+$/.test(parsed.collection)) {
    throw new ForbiddenQueryError(`Invalid collection name: "${parsed.collection}"`);
  }

  // Validate operation is in whitelist
  if (!ALLOWED_OPERATIONS.has(parsed.operation)) {
    throw new ForbiddenQueryError(
      `Operation "${parsed.operation}" is not permitted. Only read operations are allowed.`
    );
  }

  // Scan entire query JSON for blocked keywords
  const queryStr = JSON.stringify(parsed).toLowerCase();
  for (const keyword of BLOCKED_KEYWORDS) {
    if (queryStr.includes(keyword.toLowerCase())) {
      throw new ForbiddenQueryError(
        `Query contains restricted keyword: "${keyword}"`
      );
    }
  }

  // Enforce result limits to prevent large data dumps
  if (parsed.options?.limit && parsed.options.limit > 500) {
    parsed.options.limit = 500;
  }
  if (!parsed.options?.limit && parsed.operation === "find") {
    parsed.options = parsed.options || {};
    parsed.options.limit = 100; // Default safety limit
  }
};

module.exports = { validateQuery, ForbiddenQueryError };
