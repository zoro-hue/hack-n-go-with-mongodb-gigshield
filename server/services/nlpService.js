const { getSchema } = require("./schemaService");

// ── Custom Error ──────────────────────────────────────────────────────────────
class AIParseError extends Error {
  constructor(message) {
    super(message);
    this.name = "AIParseError";
  }
}

// ── Prompt Builder ────────────────────────────────────────────────────────────
const buildSystemPrompt = (schema) => {
  const schemaLines = Object.entries(schema)
    .map(([col, fields]) => `- ${col}: ${fields.join(", ")}`)
    .join("\n");

  return `You are a MongoDB query expert. Convert natural language questions into valid MongoDB queries.

Available collections and fields:
${schemaLines}

Respond ONLY with a valid JSON object — no markdown, no explanation, no code fences. Use this exact format:
{
  "collection": "collection_name",
  "operation": "find" | "aggregate" | "countDocuments",
  "query": {},
  "options": { "limit": 50, "sort": {}, "projection": {} },
  "pipeline": [],
  "explanation": "Brief plain-English description of what this query does"
}

Rules:
- Use "aggregate" with "pipeline" for grouping, counting by field, sorting after grouping, or multi-stage transforms.
- Use "find" with "query" for simple filters.
- Use "countDocuments" with "query" to count matching documents.
- For "find" and "countDocuments", put filters in "query". Leave "pipeline" as [].
- For "aggregate", put stages in "pipeline". Leave "query" as {}.
- Always include a human-friendly "explanation" field.
- Never generate write operations (insert, update, delete, drop).`;
};

// ── Claude (Anthropic) ────────────────────────────────────────────────────────
const translateWithClaude = async (question, schema) => {
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: buildSystemPrompt(schema),
    messages: [{ role: "user", content: question }],
  });

  const text = response.content.map((b) => b.text || "").join("");
  return parseAIResponse(text);
};

// ── OpenAI (Fallback) ─────────────────────────────────────────────────────────
const translateWithOpenAI = async (question, schema) => {
  const OpenAI = require("openai");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1000,
    messages: [
      { role: "system", content: buildSystemPrompt(schema) },
      { role: "user", content: question },
    ],
    response_format: { type: "json_object" },
  });

  const text = response.choices[0].message.content;
  return parseAIResponse(text);
};

// ── Response Parser ───────────────────────────────────────────────────────────
const parseAIResponse = (text) => {
  try {
    // Strip markdown fences if present
    const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Ensure required fields exist
    if (!parsed.collection || !parsed.operation) {
      throw new AIParseError("AI response missing required fields: collection, operation");
    }

    // Normalize missing fields
    parsed.query = parsed.query || {};
    parsed.options = parsed.options || {};
    parsed.pipeline = parsed.pipeline || [];
    parsed.explanation = parsed.explanation || "Query executed successfully.";

    return parsed;
  } catch (err) {
    if (err instanceof AIParseError) throw err;
    throw new AIParseError(`Failed to parse AI response as JSON: ${err.message}`);
  }
};

// ── Build Shell Query String ──────────────────────────────────────────────────
const buildQueryString = (parsed) => {
  try {
    const { collection, operation, query, options, pipeline } = parsed;

    if (operation === "aggregate") {
      return `db.${collection}.aggregate(${JSON.stringify(pipeline, null, 2)})`;
    }

    if (operation === "countDocuments") {
      return `db.${collection}.countDocuments(${JSON.stringify(query || {}, null, 2)})`;
    }

    // find
    let str = `db.${collection}.find(${JSON.stringify(query || {}, null, 2)})`;
    if (options?.sort && Object.keys(options.sort).length > 0) {
      str += `.sort(${JSON.stringify(options.sort)})`;
    }
    if (options?.limit) {
      str += `.limit(${options.limit})`;
    }
    if (options?.projection && Object.keys(options.projection).length > 0) {
      str += `.project(${JSON.stringify(options.projection)})`;
    }
    return str;
  } catch {
    return "// Could not generate query string";
  }
};

// ── Main Export ───────────────────────────────────────────────────────────────
const translateQuery = async (question) => {
  const schema = await getSchema();

  if (process.env.ANTHROPIC_API_KEY) {
    return translateWithClaude(question, schema);
  } else if (process.env.OPENAI_API_KEY) {
    return translateWithOpenAI(question, schema);
  } else {
    throw new Error(
      "No AI API key configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in .env"
    );
  }
};

module.exports = { translateQuery, buildQueryString, AIParseError };
