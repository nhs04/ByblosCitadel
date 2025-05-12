document.getElementById("chatbot-toggle").addEventListener("click", () => {
    const chatbot = document.getElementById("chatbot-container");
    const tooltip = document.getElementById("lamp-tooltip");
    const genie = document.getElementById("chatbot-toggle");

    chatbot.classList.toggle("hidden");

    if (!chatbot.classList.contains("hidden")) {
        // Chat is open
        tooltip.style.display = "none";
        genie.style.zIndex = "1"; // Push genie behind chat
    } else {
        // Chat is closed
        tooltip.style.display = "block";
        genie.style.zIndex = "9999"; // Bring genie forward
    }
});


function sendMessage() {
    const input = document.getElementById("user-input");
    const msg = input.value.trim();
    if (!msg) return;

    addMessage("user", msg);
    input.value = "";
    input.disabled = true;

    const botPlaceholder = addMessage("bot", "");
    const dotsInterval = startLoadingDots(botPlaceholder);

    fetch("http://localhost:5050/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
    })
        .then(res => res.json())
        .then(data => {
            clearInterval(dotsInterval);
            botPlaceholder.innerText = data.response;
        })
        .catch(() => {
            clearInterval(dotsInterval);
            botPlaceholder.innerText = "Oops! Something went wrong.";
        })
        .finally(() => {
            input.disabled = false;
            input.focus();
        });
}


function addMessage(sender, text) {
    const msgContainer = document.getElementById("chat-messages");
    const msg = document.createElement("div");
    msg.className = sender === "user" ? "user-message" : "bot-message";
    msg.innerText = text;
    msgContainer.appendChild(msg);
    msgContainer.scrollTop = msgContainer.scrollHeight;
    return msg;
}


function startLoadingDots(element) {
    let dots = "";
    return setInterval(() => {
        dots = dots.length < 3 ? dots + "." : "";
        element.innerText = dots;
    }, 400);
}


// ✅ Show welcome message once when page loads
window.addEventListener("DOMContentLoaded", () => {
    addMessage("bot", "Hello! I’m your virtual guide. Ask me anything about the Byblos Citadel!");
});
