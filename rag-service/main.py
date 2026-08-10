"""
main.py — AyurSutra Advanced RAG chatbot API with 5 advanced features:
1. Hybrid Database Retrieval (personalized context)
2. Conversational Memory (stored in PostgreSQL)
3. Smart Medical Guardrails (emergency detection)
4. Interactive AI Dosha Assessment (Vaidya Quiz)
5. Hinglish & Multilingual Support

OPTIMIZATION:
- Database connections are opened once per HTTP request and reused across all tasks.
  This significantly reduces SSL handshake and connection establishment overhead for cloud databases like Neon.

Run:
    uvicorn main:app --reload --port 8001
"""

import os
import psycopg
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from groq import Groq

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
TOP_K = int(os.getenv("TOP_K", 4))
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", 0.35))

EMBED_MODEL_NAME = "all-MiniLM-L6-v2"

app = FastAPI(title="AyurSutra Advanced RAG Chatbot")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(EMBED_MODEL_NAME)
    return _embed_model

groq_client = Groq(api_key=GROQ_API_KEY)


class ChatRequest(BaseModel):
    query: str
    session_id: str = "default_session"
    patient_id: str | int | None = None

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
    confidence: float = 1.0
    is_emergency: bool = False
    is_quiz: bool = False


# Quick access questions for the Dosha Quiz
DOSHA_QUIZ = [
    {
        "id": 1,
        "question": "🌿 **Question 1/5: Body Frame**\n\nHow would you describe your body frame/build?\n\n🅰️ Thin, lean, bony, or very tall/short (Vata)\n🅱️ Medium, athletic, muscular, or moderate build (Pitta)\n🆃 Broad, thick, sturdy, or large build (Kapha)",
        "options": {"a": "vata", "b": "pitta", "c": "kapha"}
    },
    {
        "id": 2,
        "question": "🌿 **Question 2/5: Skin Quality**\n\nHow is your skin naturally?\n\n🅰️ Dry, rough, cold, or easily cracked (Vata)\n🅱️ Warm, oily, sensitive, or prone to acne/redness (Pitta)\n🆃 Soft, smooth, thick, cool, and glowing (Kapha)",
        "options": {"a": "vata", "b": "pitta", "c": "kapha"}
    },
    {
        "id": 3,
        "question": "🌿 **Question 3/5: Climate Preferences**\n\nWhich type of weather is most uncomfortable for you?\n\n🅰️ Cold, dry, or windy weather makes me stiff and dry (Vata)\n🅱️ Hot, humid, or bright sunny weather makes me sweat and irritable (Pitta)\n🆃 Cold, damp, wet, or foggy weather makes me feel heavy and congested (Kapha)",
        "options": {"a": "vata", "b": "pitta", "c": "kapha"}
    },
    {
        "id": 4,
        "question": "🌿 **Question 4/5: Appetite & Digestion**\n\nHow is your digestion and appetite?\n\n🅰️ Irregular - sometimes I feel very hungry, other times bloated or constipated (Vata)\n🅱️ Strong and sharp - I must eat on time, and sometimes experience acidity/heartburn (Pitta)\n🆃 Slow and steady - I have a moderate appetite but digest slowly, feeling heavy after eating (Kapha)",
        "options": {"a": "vata", "b": "pitta", "c": "kapha"}
    },
    {
        "id": 5,
        "question": "🌿 **Question 5/5: Mental Temperament**\n\nUnder stress, how do you usually react?\n\n🅰️ I get anxious, worried, nervous, or scattered (Vata)\n🅱️ I get angry, irritated, impatient, or competitive (Pitta)\n🆃 I remain calm, silent, slow-moving, or stubborn (Kapha)",
        "options": {"a": "vata", "b": "pitta", "c": "kapha"}
    }
]


def get_db_connection():
    if not DATABASE_URL:
        raise HTTPException(status_code=500, detail="DATABASE_URL is not configured.")
    return psycopg.connect(DATABASE_URL)


def get_chat_history(conn, session_id: str, limit: int = 10):
    """Retrieve chat history from the DB for this session (latest limit messages in chronological order)."""
    cur = conn.cursor()
    cur.execute(
        """
        SELECT role, content 
        FROM kb_chat_history 
        WHERE session_id = %s 
        ORDER BY id DESC 
        LIMIT %s
        """,
        (session_id, limit),
    )
    rows = cur.fetchall()
    cur.close()
    rows.reverse()  # Reverse to restore chronological order (oldest to newest)
    return [{"role": r[0], "content": r[1]} for r in rows]


def save_chat_history(conn, session_id: str, role: str, content: str):
    """Save a single message to the chat history table."""
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO kb_chat_history (session_id, role, content)
        VALUES (%s, %s, %s)
        """,
        (session_id, role, content),
    )
    conn.commit()
    cur.close()


def query_hybrid_db(conn, query: str, patient_id: int) -> str:
    """Fetch personal patient data (appointments, profile) from Postgres and format it for the prompt."""
    if not patient_id:
        return ""

    q_lower = query.lower()
    additional_context = []
    cur = conn.cursor()

    try:
        # 1. Fetch patient profile
        cur.execute(
            "SELECT first_name, last_name, email, age, gender, dosha, blood_group FROM patients WHERE patient_id = %s",
            (patient_id,)
        )
        patient = cur.fetchone()
        if patient:
            additional_context.append(
                f"Patient Profile: Name={patient[0]} {patient[1]}, Email={patient[2]}, Age={patient[3]}, Gender={patient[4]}, Current Assessed Dosha={patient[5] or 'Not Assessed Yet'}, Blood Group={patient[6] or 'Unknown'}."
            )

        # 2. Fetch appointments if queried
        if any(w in q_lower for w in ["appointment", "booking", "visit", "doctor", "schedule"]):
            cur.execute(
                """
                SELECT a.appointment_date, a.status, a.notes, d.name, d.specialization 
                FROM appointments a
                LEFT JOIN doctors d ON a.doctor_id = d.doctor_id
                WHERE a.patient_id = %s
                ORDER BY a.appointment_date DESC
                LIMIT 3
                """,
                (patient_id,)
            )
            appts = cur.fetchall()
            if appts:
                appts_str = "; ".join(
                    [f"Date={r[0]} Status={r[1]} Notes={r[2]} Doctor={r[3]} Specialization={r[4]}" for r in appts]
                )
                additional_context.append(f"Recent/Upcoming Appointments: {appts_str}")
            else:
                additional_context.append("No active appointments found in DB.")

            # Fetch therapy bookings
            cur.execute(
                """
                SELECT therapy_type, scheduled_date, scheduled_time, status, dosha_type
                FROM therapy_bookings
                WHERE patient_id = %s
                ORDER BY scheduled_date DESC
                LIMIT 3
                """,
                (patient_id,)
            )
            bookings = cur.fetchall()
            if bookings:
                bookings_str = "; ".join(
                    [f"Therapy={r[0]} Date={r[1]} Time={r[2]} Status={r[3]} TargetDosha={r[4]}" for r in bookings]
                )
                additional_context.append(f"Panchakarma Therapy Bookings: {bookings_str}")
            else:
                additional_context.append("No Panchakarma therapy bookings found in DB.")

    except Exception as e:
        print(f"Error querying hybrid DB data: {e}")
    finally:
        cur.close()

    return "\n".join(additional_context)


def retrieve_vector_chunks(conn, query: str, k: int = TOP_K):
    """Query similarity search in pgvector."""
    embed_model = get_embed_model()
    query_embedding = embed_model.encode(query, normalize_embeddings=True).tolist()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, content, source, 1 - (embedding <=> %s::vector) AS similarity
        FROM kb_chunks
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """,
        (query_embedding, query_embedding, k),
    )
    rows = cur.fetchall()
    cur.close()
    return [
        {"id": r[0], "content": r[1], "source": r[2], "similarity": float(r[3])}
        for r in rows
    ]


def parse_quiz_answer(user_input: str) -> str:
    """Classify user input into a, b, or c for Dosha scoring."""
    text = user_input.lower().strip()
    # Check simple letter answers
    if text in ["a", "b", "c", "a)", "b)", "c)", "option a", "option b", "option c"]:
        return text[0]
    
    # Check Vata/Pitta/Kapha keywords
    vata_keywords = ["thin", "lean", "bony", "tall", "short", "dry", "rough", "cold", "wind", "gas", "bloat", "anxious", "worry", "scatter", "first", "1"]
    pitta_keywords = ["medium", "athletic", "muscular", "warm", "oily", "sensitive", "acne", "rash", "heat", "sun", "acid", "heartburn", "angry", "irritate", "second", "2"]
    kapha_keywords = ["broad", "thick", "sturdy", "large", "heavy", "soft", "smooth", "cool", "glow", "damp", "wet", "rain", "slow", "steady", "calm", "stubborn", "third", "3"]

    for kw in vata_keywords:
        if kw in text:
            return "a"
    for kw in pitta_keywords:
        if kw in text:
            return "b"
    for kw in kapha_keywords:
        if kw in text:
            return "c"
            
    return "a"  # Fallback option


def update_patient_dosha(conn, patient_id: int, dosha: str):
    """Persist the calculated Dosha type back to the patients table."""
    if not patient_id:
        return
    cur = conn.cursor()
    try:
        cur.execute("UPDATE patients SET dosha = %s WHERE patient_id = %s", (dosha, patient_id))
        conn.commit()
        print(f"Successfully updated Patient {patient_id} Dosha to {dosha}")
    except Exception as e:
        print(f"Error updating patient dosha: {e}")
    finally:
        cur.close()


def handle_dosha_quiz(conn, user_query: str, history: list[dict], patient_id: int = None) -> ChatResponse:
    """Runs a stateless-on-server Dosha Quiz using database conversational memory."""
    # Find which questions have already been asked
    asked_questions = []
    user_choices = []

    for msg in history:
        content = msg["content"]
        role = msg["role"]
        if role == "assistant":
            for q in DOSHA_QUIZ:
                if f"Question {q['id']}" in content:
                    asked_questions.append(q["id"])
        elif role == "user":
            if asked_questions:
                user_choices.append(parse_quiz_answer(content))

    # Determine what question we are on
    num_asked = len(asked_questions)
    
    if num_asked == 0:
        # Start the quiz, ask Question 1
        q = DOSHA_QUIZ[0]
        return ChatResponse(answer=q["question"], is_quiz=True)
    
    # Process the user's answer to the *last* question asked
    last_q_id = asked_questions[-1]
    parsed_choice = parse_quiz_answer(user_query)
    user_choices.append(parsed_choice)
    
    if last_q_id < 5:
        # Ask next question
        next_q = DOSHA_QUIZ[last_q_id]
        return ChatResponse(answer=next_q["question"], is_quiz=True)
    else:
        # Quiz completed! Calculate final Dosha based on the 5 answers
        while len(user_choices) < 5:
            user_choices.append("a")
            
        tally = {"vata": 0, "pitta": 0, "kapha": 0}
        for i, choice in enumerate(user_choices[:5]):
            options = DOSHA_QUIZ[i]["options"]
            dosha_val = options.get(choice, "vata")
            tally[dosha_val] += 1
            
        dominant_dosha = max(tally, key=tally.get).capitalize()
        
        # Save to PostgreSQL
        if patient_id:
            update_patient_dosha(conn, patient_id, dominant_dosha)
            db_save_msg = "I have updated your patient profile with this assessment!"
        else:
            db_save_msg = "Log in to your AyurSutra account to save this assessment to your profile!"

        result_message = (
            f"🎉 **Dosha Assessment Complete!** 🎉\n\n"
            f"Based on your answers, your dominant Prakriti (constitution) is **{dominant_dosha}**!\n\n"
            f"• Vata score: {tally['vata']}\n"
            f"• Pitta score: {tally['pitta']}\n"
            f"• Kapha score: {tally['kapha']}\n\n"
            f"**{dominant_dosha} Description:**\n"
        )
        
        if dominant_dosha == "Vata":
            result_message += (
                "🌀 **Vata (Air + Ether)**: Governs movement, respiration, and nervous activity. "
                "Vata personalities are creative, energetic, and active, but prone to anxiety, dry skin, and irregular digestion. "
                "Balancing therapies include grounding warm oil massages (Abhyanga) and Basti (cleansing therapy)."
            )
        elif dominant_dosha == "Pitta":
            result_message += (
                "🔥 **Pitta (Fire + Water)**: Governs metabolism, digestion, and body temperature. "
                "Pitta personalities are focused, ambitious, and sharp, but prone to irritability, acidity, and heat sensitivity. "
                "Balancing therapies include cooling Shirodhara and purging detox (Virechana)."
            )
        else:
            result_message += (
                "💧 **Kapha (Earth + Water)**: Governs structure, fluid balance, and lubrication. "
                "Kapha personalities are stable, loving, patient, and strong, but prone to lethargy, weight gain, and congestion. "
                "Balancing therapies include dry herbal powder scrub massage (Udvartana) and therapeutic vomiting (Vamana)."
            )
            
        result_message += f"\n\n🌿 *{db_save_msg}* \nWould you like guidance on booking a corresponding therapy at AyurSutra?"
        return ChatResponse(answer=result_message, is_quiz=False)


def log_interaction(conn, query: str, chunk_ids: list[int], answer: str, confidence: float):
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO kb_chat_logs (user_query, retrieved_ids, answer, confidence)
            VALUES (%s, %s, %s, %s)
            """,
            (query, chunk_ids, answer, confidence),
        )
        conn.commit()
    except Exception as e:
        print(f"Error logging interaction: {e}")
    finally:
        cur.close()


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    query = req.query.strip()
    session_id = req.session_id.strip()
    patient_id = req.patient_id
    if patient_id == "":
        patient_id = None
    elif isinstance(patient_id, str) and patient_id.isdigit():
        patient_id = int(patient_id)

    # 1. Smart Medical Guardrails: Check for immediate medical emergencies locally
    emergency_keywords = [
        "chest pain", "heart attack", "difficulty breathing", "shortness of breath",
        "stroke", "paralysis", "heavy bleeding", "severe bleeding", "unconscious",
        "poisoning", "suicide", "suicidal", "severe burn", "chest tightness"
    ]
    if any(kw in query.lower() for kw in emergency_keywords):
        warning = (
            "🚨 **URGENT EMERGENCY WARNING** 🚨\n\n"
            "The symptoms you described match a potential medical emergency. "
            "Please seek professional emergency care immediately. Do not wait for online advice!\n\n"
            "**Emergency Resources:**\n"
            "📞 AyurSutra Emergency Helpline: +91 98765 43210\n"
            "🏥 Address: AyurSutra Center, Sector 5, RK Puram, New Delhi\n"
            "🚒 Local Ambulance Service: Call 102 / 112"
        )
        
        # Save emergency sequence using a quick connection context
        try:
            conn = get_db_connection()
            log_interaction(conn, query, [], warning, 1.0)
            save_chat_history(conn, session_id, "user", query)
            save_chat_history(conn, session_id, "assistant", warning)
            conn.close()
        except Exception as e:
            print(f"Error logging emergency flow: {e}")

        return ChatResponse(answer=warning, is_emergency=True)

    # Reusing a single DB connection for the entire session query
    conn = get_db_connection()
    try:
        # Fetch prior history
        history = get_chat_history(conn, session_id)

        # 2. Check if a Dosha quiz is active or requested
        is_quiz_triggered = any(w in query.lower() for w in ["dosha quiz", "dosha test", "analyze my dosha", "know my body type", "body type test"])
        is_already_in_quiz = False
        if history:
            last_bot_msg = [m for m in history if m["role"] == "assistant"]
            if last_bot_msg:
                last_bot_content = last_bot_msg[-1]["content"]
                # We are in a quiz only if the last bot message was a question (Question 1 to 5)
                if "Question" in last_bot_content and any(f"Question {i}" in last_bot_content for i in range(1, 6)):
                    is_already_in_quiz = True

        if (is_quiz_triggered or is_already_in_quiz) and not any(w in query.lower() for w in ["stop", "cancel", "exit"]):
            # Handle quiz turn
            resp = handle_dosha_quiz(conn, query, history, patient_id)
            save_chat_history(conn, session_id, "user", query)
            save_chat_history(conn, session_id, "assistant", resp.answer)
            log_interaction(conn, query, [], resp.answer, 1.0)
            return resp

        # 3. Hybrid DB Retrieval & General RAG Query
        personal_context = query_hybrid_db(conn, query, patient_id)
        vector_chunks = retrieve_vector_chunks(conn, query)

        top_confidence = vector_chunks[0]["similarity"] if vector_chunks else 0.0

        # If similarity search returns low quality and no personal DB context found, trigger low confidence fallback
        if (not vector_chunks or top_confidence < CONFIDENCE_THRESHOLD) and not personal_context:
            fallback = (
                "I'm not fully sure about that from our Ayurveda knowledge base — "
                "it is best to reach out to the AyurSutra clinic directly so a doctor or staff member can guide you. "
                "\n\n📞 Clinic Contact: +91 98765 43210"
            )
            save_chat_history(conn, session_id, "user", query)
            save_chat_history(conn, session_id, "assistant", fallback)
            log_interaction(conn, query, [], fallback, top_confidence)
            return ChatResponse(answer=fallback, confidence=top_confidence)

        # Format Vector chunks
        knowledge_context = "\n\n".join(f"[{c['source']}] {c['content']}" for c in vector_chunks)

        # Construct the RAG prompt with Multilingual/Hinglish instructions and memory
        formatted_history = ""
        for msg in history[-4:]:  # last 4 turns for prompt length control
            role_label = "Patient" if msg["role"] == "user" else "Assistant"
            formatted_history += f"{role_label}: {msg['content']}\n"

        system_prompt = f"""You are Sahayak, AyurSutra's AI Ayurvedic assistant. You speak kindly, reassuringly, and ground your answers in Ayurvedic wisdom.

LANGUAGES:
- You must respond in the SAME language/dialect used by the patient (Hinglish, Hindi, or English).
- If the patient asks in Hinglish (e.g. "Panchakarma kya hai?"), reply in Hinglish.
- If the patient asks in Hindi, reply in Hindi.
- If in English, reply in English.

RULES:
1. Answer ONLY using the facts from the Knowledge Context and Personal Context below.
2. Do not fabricate facts. If the information is not there, politely state you do not know.
3. Do not give critical medical diagnoses; suggest consulting an AyurSutra physician.
4. Keep answers clean, concise, and formatted in clear markdown paragraphs.

Personal Context (Active Patient Database Record):
{personal_context or 'No specific personal records found.'}

Knowledge Context (Ayurvedic Guidelines):
{knowledge_context}

Recent Chat History:
{formatted_history}

Patient Current Question: {query}
Sahayak:"""

        # 4. Generate response via Groq
        try:
            completion = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[{"role": "user", "content": system_prompt}],
                temperature=0.3,
                max_tokens=500,
            )
            answer = completion.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error calling Groq API: {e}")
            answer = "I'm sorry, I'm having trouble connecting to my AI core right now. Please try again in a moment, or contact the clinic."

        sources = list({c["source"] for c in vector_chunks}) if vector_chunks else []
        chunk_ids = [c["id"] for c in vector_chunks] if vector_chunks else []

        # Save to history & log
        save_chat_history(conn, session_id, "user", query)
        save_chat_history(conn, session_id, "assistant", answer)
        log_interaction(conn, query, chunk_ids, answer, top_confidence)

        return ChatResponse(
            answer=answer,
            sources=sources,
            confidence=top_confidence,
            is_emergency=False,
            is_quiz=False
        )
    finally:
        conn.close()


@app.get("/health")
def health():
    return {"status": "ok"}
