# AyurSutra Advanced RAG Chatbot

This directory contains the FastAPI-based Retrieval-Augmented Generation (RAG) microservice for **AyurSutra**. It replaces the local client-side rule-based chatbot with a production-grade RAG pipeline integrated directly into your existing PostgreSQL database infrastructure using `pgvector`.

---

## 🚀 Advanced Features Included

This chatbot is not a simple Q&A bot. It implements 5 advanced, production-grade features:

1. **Hybrid Database Retrieval**: Merges standard vector search with direct SQL queries on your active tables (`appointments`, `patients`, `doctors`, `therapy_bookings`) to answer user-specific profile or scheduling questions.
2. **Conversational Memory**: Persists conversation history in the database (`kb_chat_history`), enabling multi-turn context (the bot remembers what you said previously in the chat).
3. **Medical Emergency Guardrails**: Scans user inputs for high-urgency symptoms (e.g. chest pain, severe bleeding) and immediately halts RAG, returning an emergency response flag for UI escalation.
4. **Interactive AI Dosha Assessment (Vaidya Quiz)**: Conducts a conversational 5-question Prakriti assessment and automatically saves the patient's dominant Dosha back to the `patients` table.
5. **Hinglish & Multilingual Support**: Processes and responds to queries seamlessly in Hinglish, Hindi, and English to match natural user dialog.

---

## Architecture Diagram

```
Patient Query (React UI) ──► POST /chat ──► FastAPI Service (main.py)
                                               │
                                 1. Local Embed (all-MiniLM-L6-v2)
                                               │
                                 2. Query Vector DB (pgvector)
                                               │
                                 3. (If Logged-in) Query Appointments/Profile (SQL)
                                               │
                                 4. Retrieve Session History (kb_chat_history)
                                               │
                                 5. Grounded Prompt generation
                                               │
                                 6. Groq / Gemini Completion API
                                               │
                                 7. Log Interaction (kb_chat_logs)
                                               ▼
                                      JSON Response (UI)
```

---

## Step-by-Step Setup

### 1. Database Migration & Vector Extension
Make sure the `vector` extension is enabled on your PostgreSQL server, then run the SQL definitions in `schema.sql` against your database:
```bash
psql $DATABASE_URL -f schema.sql
```
*Note: This creates vector storage tables, log tables, memory history tables, and alters the `patients` table to add the `dosha` column.*

### 2. Configure Python Environment
Initialize your virtual environment and install all packages:
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your connection details:
```bash
cp .env.example .env
```
Key configurations:
- `DATABASE_URL`: Connection string to your active AyurSutra database.
- `GROQ_API_KEY`: Get a free key at [console.groq.com](https://console.groq.com).

### 4. Load Knowledge Base & Ingest
1. Add custom Ayurvedic therapy documentation and clinic FAQs into `knowledge/faq.md` and `knowledge/therapies.md`.
2. Run the chunking and embedding pipeline script:
```bash
python ingest.py
```

### 5. Run the Server
Launch the FastAPI microservice on port 8001:
```bash
uvicorn main:app --reload --port 8001
```

### 6. Start the React Frontend
Start the Vite dev server inside the `frontend` directory:
```cmd
cmd.exe /c npm run dev
```
Open your browser at `http://localhost:5173`. Sahayak will now call the FastAPI backend to answer questions, assess doshas, query active DB profiles, and show warnings.
