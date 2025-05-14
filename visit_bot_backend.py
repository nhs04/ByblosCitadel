from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import requests
import os  # ✅ Added to get env var

app = Flask(__name__)
CORS(app, supports_credentials=True)

sessions = {}

# Load POI data
with open("byblos_poi.txt", "r", encoding="utf-8") as f:
    POI_DATA = f.read()

# ✅ Use environment variable instead of hardcoding
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are a warm, expert local guide for the Byblos Citadel. "
        "You craft detailed, hour-by-hour full-day itineraries tailored to each user’s preferences. "
        "Ask follow-up questions if needed, and always explain why each place fits their interest. "
        "Do not mention data sources. Use only what you know about Byblos:\n\n"
        f"{POI_DATA.strip()}\n\n"
        "When generating an itinerary, always include specific local names (e.g., Bab el Mina, Malak el Taouk, Roman columns). "
        "Do not repeat generic info. Avoid vague sentences like 'you can explore'. Instead, describe what they will see, do, and learn in each time slot. "
        "Be sensitive to preferences (e.g., if they choose street food, include Malak el Taouk not Locanda). "
        "Use elegant natural tone and structure every plan using time ranges, new lines, and local color."
    )
}


@app.route("/start", methods=["POST"])
def chat():
    data = request.get_json()
    session_id = data.get("session_id")
    user_message = data.get("message")

    if not user_message:
        return jsonify({"error": "Missing message"}), 400

    new_session = False
    if not session_id or session_id not in sessions:
        session_id = str(uuid.uuid4())
        sessions[session_id] = [SYSTEM_PROMPT]
        new_session = True

    sessions[session_id].append({"role": "user", "content": user_message})

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "mistralai/mistral-7b-instruct",
            "messages": sessions[session_id],
            "max_tokens": 300
        }
    )

    if response.status_code != 200:
        return jsonify({"error": response.text}), response.status_code

    ai_reply = response.json()["choices"][0]["message"]["content"]
    sessions[session_id].append({"role": "assistant", "content": ai_reply})

    return jsonify({
        "reply": ai_reply,
        "session_id": session_id,
        "new_session": new_session
    })


@app.route("/itinerary", methods=["POST"])
def get_itinerary():
    data = request.get_json()
    session_id = data.get("session_id")

    if not session_id or session_id not in sessions:
        return jsonify({"error": "Session not found"}), 400

    # Extract user answers
    answers = [msg["content"] for msg in sessions[session_id] if msg["role"] == "user"]
    summary = "The user selected: " + ", ".join(answers) + "."
    sessions[session_id].append({"role": "user", "content": summary})

    # ✨ Dynamic filtering from POI file
    filtered_poi = []
    tags = {
        "Morning": "[start_time=Morning]",
        "Afternoon": "[start_time=Afternoon]",
        "Sunset": "[start_time=Sunset]",
        "Mostly indoors": "[preference=Indoors]",
        "Mostly outdoors": "[preference=Outdoors]",
        "Balanced": "[preference=Balanced]",
        "Traditional Lebanese": "[food=Traditional Lebanese]",
        "Seafood": "[food=Seafood]",
        "Street food": "[food=Street food]",
        "I’m open to anything": "[food=Open to anything]",
        "Solo": "[group_advice]",
        "Couple": "[group_advice]",
        "Family": "[group_advice]",
        "Friends/group": "[group_advice]",
        "Staying overnight": "[stay=Hotel]\n[stay=Airbnb]\n[stay=Boutique]",
        "I’m new": "[knowledge=I'm new]",
        "I know some": "[knowledge=I know some]",
        "Very interested in ancient history": "[knowledge=Very interested]"
    }

    with open("byblos_poi.txt", "r", encoding="utf-8") as f:
        poi_lines = f.readlines()

    current_section = ""
    capturing = False
    matched_blocks = []

    selected_tags = []
    for ans in answers:
        for key, tag in tags.items():
            if key in ans:
                for t in tag.split("\n"):
                    selected_tags.append(t)

    for line in poi_lines:
        if line.startswith("[") and line.strip() in selected_tags:
            current_section = line.strip()
            capturing = True
            matched_blocks.append(current_section)
        elif line.startswith("[") and line.strip() not in selected_tags:
            capturing = False
        elif capturing:
            matched_blocks.append(line.rstrip())

    custom_poi_context = "\n".join(matched_blocks)

    sessions[session_id].append({
        "role": "system",
        "content": (
            "Use this local context to design the best possible itinerary:\n\n"
            f"{custom_poi_context}\n\n"
            "Use only this relevant knowledge. Do not invent anything outside this."
        )
    })

    sessions[session_id].append({
        "role": "user",
        "content": (
            "Using the user’s preferences and the filtered local knowledge I gave you, write a complete full-day itinerary in a single flowing paragraph.\n\n"
            "Instructions:\n"
            "- Describe the day chronologically from start to finish, without splitting into bullet points or new lines.\n"
            "- Use natural language for time references like 'starting at 8:00 AM', 'by late morning', 'around noon', 'in the afternoon', 'before sunset'.\n"
            "- If the user chose morning, his day starts at 9 am. \n"
            "- If the user chose afternoon, his day starts at 12 pm. \n"
            "- If the user chose sunset, his day starts at 5 pm. \n"
            "- Mention real names of sites, ruins, towers, and restaurants from the context if they match the user’s selected preferences. Check the POI data.\n"
            "- You should be really specific when talking, the user must feel like you knoe the city really well (all its best spots, restaurants, accomodations).\n"
            "- Smoothly transition from one activity to the next without repeating or breaking the flow.\n"
            "- Always focus on the user's preference and explain to him that since he chose this he is going to do this.\n"
            "- If the user is staying overnight, include at least one suggested accommodation from the filtered context that matches their group type or vibe. \n"
            "- If he is not staying overnight, give him cool activities to continue his day. \n"
            "- Use information from POI data and elaborate on it.\n"
            "- Never include any formatting symbols like *, [], or markdown. Just clean, human, warm narration.\n"
            "- The tone should be elegant and welcoming, like a passionate local guide telling a story.\n"
            "- End the itinerary with a warm, poetic farewell sentence."
        )
    })

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "mistralai/mistral-7b-instruct",
            "messages": sessions[session_id],
            "max_tokens": 1200
        }
    )

    if response.status_code != 200:
        return jsonify({"error": response.text}), response.status_code

    itinerary = response.json()["choices"][0]["message"]["content"]
    sessions[session_id].append({"role": "assistant", "content": itinerary})

    return jsonify({"itinerary": itinerary})


if __name__ == "__main__":
    app.run(port=5051)
