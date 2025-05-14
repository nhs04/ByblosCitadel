let sessionId = null;
let step = 0;
const chatLog = document.getElementById("chat-log");
const optionsDiv = document.getElementById("options");
const userAnswers = [];

const steps = [
    { q: "⏱️When do you plan to start your visit?", o: ["Morning", "Afternoon", "Sunset"] },
    { q: "⏳ How much time can you spend at the Citadel?", o: ["Less than 1 hour", "1–2 hours", "2+ hours"] },
    { q: "👥 Are you visiting solo, as a couple, with family, or in a group?", o: ["Solo", "Couple", "Family", "Friends/group"] },
    { q: "📚 What is your main goal for visiting the Citadel?", o: ["Learn historical facts", "Explore ruins and architecture", "Just enjoy the scenery and take photos"] },
    { q: "🧭 Which sections of the Citadel are you most interested in?", o: ["Crusader towers", "Phoenician ruins", "Roman columns", "Ancient walls and gates"] },
    { q: "🏛️ Do you prefer being indoors or outdoors?", o: ["Mostly indoors", "Mostly outdoors", "Balanced"] },
    { q: "📸 Should I highlight the best photo spots during your tour?", o: ["Yes", "No"] },
    { q: "🧠 Do you already know Byblos history, or is this your first time?", o: ["I know some", "I’m new", "Very interested in ancient history"] },
    { q: "🌍 Are you visiting as a tourist, student, researcher, or local?", o: ["Tourist", "Student", "Researcher", "Local visitor"] },
    { q: "🕓 Will you stay in Byblos after the Citadel?", o: ["No", "A few hours", "Staying overnight"] },
    { q: "🍽️ Want food suggestions nearby after your visit?", o: ["Traditional Lebanese", "Seafood", "Street food", "I’m open to anything"] }
];

function addMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.innerText = text;
    chatLog.appendChild(msg);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function showOptions(stepObj) {
    optionsDiv.innerHTML = "";
    stepObj.o.forEach(opt => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = opt;
        btn.onclick = () => {
            addMessage(opt, "user");
            userAnswers[step] = opt;

            fetch("https://byblos-ai-planbot.onrender.com/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: opt, session_id: sessionId })
            })
                .then(res => res.json())
                .then(data => {
                    if (!sessionId) sessionId = data.session_id;
                    step++;
                    nextStep();
                });
        };
        optionsDiv.appendChild(btn);
    });
}

function nextStep() {
    while (step < steps.length) {
        const currentStep = steps[step];
        if (!currentStep.condition || currentStep.condition()) {
            addMessage(currentStep.q, "bot");
            showOptions(currentStep);
            return;
        }
        step++;
    }

    addMessage("✨ Preparing your itinerary...", "bot");

    fetch("https://byblos-ai-planbot.onrender.com/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
    })
        .then(res => res.json())
        .then(data => {
            formatItineraryDisplay(data.itinerary);
        });
}

function formatItineraryDisplay(raw) {
    // Step 1: Remove tags like "(Indoor)" or "(Outdoor)" or "(Outdoor/Indoor)"
    const noTags = raw.replace(/\((Indoor|Outdoor|Indoor\/Outdoor|Outdoor\/Indoor)\)/gi, "").trim();

    // Step 2: Insert line breaks before each numbered item (e.g., 1. 9:00 AM)
    const withBreaks = noTags.replace(/(\d+)\.\s(?=\d{1,2}:\d{2}\s?(?:AM|PM))/g, "\n$1. ");

    // Step 3: Highlight time slots like "9:00 AM – 10:00 AM" or just "9:00 AM"
    const withStyledTime = withBreaks.replace(
        /(\d{1,2}:\d{2}\s?(?:AM|PM)(?:\s?–\s?\d{1,2}:\d{2}\s?(?:AM|PM))?)/g,
        '<span class="time-slot">$1</span>'
    );

    // Step 4: Render it
    const itineraryBox = document.createElement("div");
    itineraryBox.className = "itinerary-box";
    itineraryBox.innerHTML = withStyledTime;
    chatLog.appendChild(itineraryBox);
    chatLog.scrollTop = chatLog.scrollHeight;
}




window.onload = () => {
    setTimeout(() => {
        addMessage("Welcome! Let’s plan your visit to the Byblos Citadel 🌿 I’ll just ask you a few quick questions to tailor your experience.", "bot");

        setTimeout(() => {
            addMessage(steps[step].q, "bot");
            showOptions(steps[step]);
            step++;
        }, 1000);
    }, 1000); // delay 1s AFTER full page load
};

