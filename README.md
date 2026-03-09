# 🍃 NLMongo — Natural Language Interface for MongoDB

> Query your MongoDB database in plain English. No query syntax required.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)](https://www.mongodb.com/)
[![OpenAI](https://img.shields.io/badge/Claude%20API-Sonnet%204-orange)](https://www.anthropic.com/)

---

## 📌 Problem Statement

Database querying traditionally requires knowledge of MongoDB's query syntax — a barrier for business users, data analysts, and non-technical stakeholders. **NLMongo** solves this by letting anyone query a MongoDB database using plain English, automatically translating their question into an accurate MongoDB query and presenting the results in a clean, readable format.

---

## ✨ Features

- **🗣️ Plain English Querying** — No MongoDB syntax knowledge needed. Just type your question.
- **⚡ Automatic Query Translation** — Uses Claude AI (or OpenAI GPT) to convert natural language into valid MongoDB queries.
- **📊 User-Friendly Data Presentation** — Results displayed in a clean, interactive table with pagination.
- **🔍 Query Inspector** — View the generated MongoDB shell query and full JSON structure side-by-side.
- **📖 Schema Explorer** — Browse your collections and fields directly from the sidebar.
- **🕓 Query History** — Re-run previous queries with one click.
- **💡 Query Explanation** — Every result includes a human-readable description of what the query does.

---

## 🖼️ Demo

```
User: "Show all delivered orders with amount greater than $300"

Generated Query:
db.orders.find({ "status": "delivered", "amount": { "$gt": 300 } })

Results: 3 documents returned ✓
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| AI / NLP | Anthropic Claude API (claude-sonnet-4) |
| NLP Libraries | spaCy, NLTK (optional fallback) |

---

## 📁 Project Structure

```
nlmongo/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInput.jsx
│   │   │   ├── ResultsTable.jsx
│   │   │   ├── SchemaExplorer.jsx
│   │   │   └── QueryInspector.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                  # Node.js + Express backend
│   ├── routes/
│   │   └── query.js         # /api/query endpoint
│   ├── services/
│   │   ├── nlpService.js    # AI translation logic
│   │   └── mongoService.js  # MongoDB execution layer
│   ├── app.js
│   └── package.json
│
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB v6.0+ (local or Atlas)
- An [Anthropic API key](https://console.anthropic.com/) (or OpenAI key)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/nlmongo.git
cd nlmongo
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017
MONGO_DB_NAME=your_database_name

# AI API (choose one)
ANTHROPIC_API_KEY=your_anthropic_api_key
# OPENAI_API_KEY=your_openai_api_key

# Server
PORT=5000
```

### 3. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start the Application

```bash
# Start backend (from /server)
npm run dev

# Start frontend (from /client)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Docker (Optional)

```bash
docker-compose up --build
```

---

## 🔧 How It Works

```
User Input (plain English)
        │
        ▼
  Claude / GPT API
  (NL → MongoDB Query)
        │
        ▼
  Query Validation Layer
  (sanitize & safety check)
        │
        ▼
  MongoDB Execution
        │
        ▼
  JSON Response → React UI
```

1. The user types a natural language question.
2. The backend sends the question + schema context to the Claude AI API.
3. Claude returns a structured JSON with the MongoDB query, collection name, operation, and options.
4. The backend validates and executes the query against MongoDB.
5. Results are returned to the React frontend as JSON.
6. The UI renders the data in a table and displays the generated query for transparency.

---

## 📡 API Reference

### `POST /api/query`

Translates and executes a natural language query.

**Request Body:**
```json
{
  "question": "Show all users from Mumbai who are active"
}
```

**Response:**
```json
{
  "collection": "users",
  "operation": "find",
  "query": { "city": "Mumbai", "isActive": true },
  "options": { "limit": 50 },
  "explanation": "Finds all active users located in Mumbai.",
  "results": [ ... ],
  "count": 3,
  "generatedQuery": "db.users.find({ city: 'Mumbai', isActive: true })"
}
```

### `GET /api/schema`

Returns the schema (collections + fields) of the connected database.

---

## 🧪 Example Queries

| Natural Language | Generated MongoDB Query |
|---|---|
| Show all active users | `db.users.find({ isActive: true })` |
| Find orders above $500 | `db.orders.find({ amount: { $gt: 500 } })` |
| Count orders by status | `db.orders.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }])` |
| Top 5 most expensive products | `db.products.find().sort({ price: -1 }).limit(5)` |
| Users older than 30 from Seoul | `db.users.find({ age: { $gt: 30 }, city: "Seoul" })` |

---

## 🔒 Security Considerations

- All generated queries are validated before execution.
- Only `find`, `aggregate`, and `countDocuments` operations are permitted (read-only by default).
- Write operations (`insertOne`, `updateMany`, `deleteOne`, etc.) are blocked unless explicitly enabled.
- API keys are never exposed to the frontend.
- MongoDB connection uses least-privilege credentials.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct.

---

## 📚 References

- [Natural Language Interfaces to Databases (1995)](https://arxiv.org/abs/cmp-lg/9503016)
- [MongoDB Query Language Docs](https://www.mongodb.com/docs/manual/tutorial/query-documents/)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [spaCy NLP Library](https://spacy.io/)
- [NLTK Documentation](https://www.nltk.org/)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgements

Built as part of a project to democratize database access for non-technical users.  
Inspired by research in Natural Language Interfaces for Databases (NLIDBs) dating back to the early 1990s.

---

<p align="center">Made with 🍃 and plain English</p>
