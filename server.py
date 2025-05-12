from flask import Flask, request, jsonify
import requests
from flask_cors import CORS
import os  # ✅ Added to support dynamic PORT

app = Flask(__name__)
CORS(app) 

API_KEY = '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'  # secure this later

# Load your reference Q&A
with open("citadel_qa.txt", "r", encoding="utf-8") as file:
    reference_qa = file.read()

# System prompt (fixed)
SYSTEM_PROMPT = {
    "role": "system",
    "content": (
        "You are a helpful and concise tour guide for the Byblos Citadel, trained in Lebanese history.\n"
        "You have access to this reference Q&A dataset:\n" + reference_qa + "\n\n"
        "When a user asks a question, check if it closely relates to any question in the reference.\n"
        "If yes, use the answer from the reference — even if the wording is different.\n"
        "If not found, use your own historical knowledge.\n"
        "NEVER say which reference question you're using. JUST answer the question naturally and shortly.\n"
        "Do NOT guess anything uncertain.\n"
        "Always answer shortly and clearly. No long paragraphs."
    )
}

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message")

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [
            SYSTEM_PROMPT,
            {"role": "user", "content": user_msg}
        ]
    }

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)

    if response.status_code == 200:
        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"response": reply})
    else:
        return jsonify({"error": response.text}), response.status_code

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5050))  # ✅ Uses Render’s env var or defaults to 5050
    app.run(host="0.0.0.0", port=port)
