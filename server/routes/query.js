const express = require("express");
const router = express.Router();
const rateLimiter = require("../middleware/rateLimiter");
const { validateQuery } = require("../middleware/validator");
const { translateQuery, buildQueryString } = require("../services/nlpService");
const { executeQuery } = require("../services/mongoService");

/**
 * POST /api/query
 * Body: { question: string }
 *
 * 1. Validates input
 * 2. Translates NL → MongoDB query via AI
 * 3. Validates query safety
 * 4. Executes against MongoDB
 * 5. Returns results + generated query string
 */
router.post("/", rateLimiter, async (req, res, next) => {
  try {
    const { question } = req.body;

    // ── Input Validation ────────────────────────────────────────────────────
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: '"question" field is required and must be a string.' });
    }

    const trimmed = question.trim();
    if (trimmed.length < 3) {
      return res.status(400).json({ error: "Question is too short. Please be more specific." });
    }
    if (trimmed.length > 500) {
      return res.status(400).json({ error: "Question exceeds 500 character limit." });
    }

    console.log(`[Query] "${trimmed}"`);

    // ── Step 1: Translate NL → MongoDB query ────────────────────────────────
    const parsed = await translateQuery(trimmed);

    // ── Step 2: Validate query safety ───────────────────────────────────────
    validateQuery(parsed);

    // ── Step 3: Execute against MongoDB ────────────────────────────────────
    const { results, count } = await executeQuery(parsed);

    // ── Step 4: Build readable shell query string ───────────────────────────
    const generatedQuery = buildQueryString(parsed);

    console.log(`[Query] → ${parsed.collection}.${parsed.operation}() → ${count} docs`);

    res.json({
      collection: parsed.collection,
      operation: parsed.operation,
      query: parsed.query,
      options: parsed.options,
      pipeline: parsed.pipeline,
      explanation: parsed.explanation,
      generatedQuery,
      results,
      count,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
