
const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");
const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");

chatbotToggle.addEventListener("click", () => {
  chatbotWindow.hidden = !chatbotWindow.hidden;

  if (!chatbotWindow.hidden) {
    chatbotInput.focus();
  }
});

chatbotClose.addEventListener("click", () => {
  chatbotWindow.hidden = true;
});

function getBotReply(question) {
  const q = question.toLowerCase();

  if (/\b(hello|hi|hey|namaste|hii)\b/.test(q)) {
    return "Namaste! 👋 Main LifeLine Assistant hoon. Aapko kis safety topic par help chahiye?";
  }

  if (q.includes("112") || q.includes("emergency number") ||
      q.includes("police number")) {
    return "India mein emergency assistance ke liye 112 dial karein. Agar turant khatra hai, chatbot par depend na karein.";
  }

  if (q.includes("sos") || q.includes("emergency help")) {
    return "Website par Emergency SOS button use karein. Phone ka dialer khul sakta hai; call aapko khud confirm karni hogi. Zaroorat par seedhe 112 dial karein.";
  }

  if (q.includes("hospital") || q.includes("ambulance")) {
    return "Serious medical emergency mein 112 par call karein. Nearby hospitals ke liye website ke My Safety Location section mein Find Nearby Hospitals use karein.";
  }

  if (q.includes("location") || q.includes("share my location")) {
    return "My Safety Location section mein Detect My Location dabayein aur browser permission allow karein. Phir Share My Location se link share kar sakte hain.";
  }

  if (q.includes("trusted contact") || q.includes("contact add") ||
      q.includes("contact kaise")) {
    return "Trusted Contacts section mein naam aur phone number bharein, phir Add Contact dabayein. Apna contact details sahi check karein.";
  }

  if (q.includes("login") || q.includes("sign in") ||
      q.includes("account")) {
    return "Website ke Login / Sign Up button se login karein ya Create Account option use karein. Google login mein problem aaye to email login try karein.";
  }

  if (q.includes("fire") || q.includes("aag")) {
    return "Fire ke waqt safe exit se building se bahar niklein, lift use na karein aur smoke se bachne ke liye neeche rehkar move karein agar zaroori ho. Safe jagah se 112 par call karein.";
  }

  if (q.includes("accident") || q.includes("road accident")) {
    return "Khud ko traffic se safe rakhein. Injured person ko tab tak move na karein jab tak wahan rehna unsafe na ho. Emergency help ke liye 112 call karein aur trained responders ki instructions follow karein.";
  }

  if (q.includes("first aid") || q.includes("bleeding")) {
    return "Serious injury mein 112 par call karein. Bahut bleeding ho to, agar safe ho, clean cloth se wound par firm, continuous pressure dein. Embedded object ko na nikalein; emergency responder ki instructions follow karein.";
  }

  if (q.includes("medical") || q.includes("doctor") ||
      q.includes("behosh") || q.includes("unconscious")) {
    return "Serious medical problem mein 112 call karein. Agar koi behosh hai aur normal breathing nahi kar raha, emergency operator ko turant batayein aur unki CPR instructions follow karein.";
  }

  if (q.includes("help") || q.includes("kya kar sakte")) {
    return "Main SOS, emergency number, hospitals, location sharing, trusted contacts, fire safety, road accident aur basic first-aid guidance mein help kar sakta hoon.";
  }

  return "Maaf kijiye, mere paas is sawaal ka verified jawab nahi hai. Emergency mein 112 par call karein. Aap SOS, location, hospital, trusted contacts, fire safety ya first aid ke baare mein pooch sakte hain.";
}

function addMessage(text, className) {
  const message = document.createElement("div");
  message.className = className;
  message.textContent = text;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

chatbotForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const question = chatbotInput.value.trim();
  if (!question) return;

  addMessage(question, "user-message");
  chatbotInput.value = "";

  addMessage(getBotReply(question), "bot-message");
});
