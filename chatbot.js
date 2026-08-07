(() => {
  const WA_NUMBER = "923234979798";

  const LAB_TESTS = [
    "CBC",
    "ABO Blood Grouping",
    "ESR",
    "Urine R/E",
    "Urine C/S",
    "Allergy Profile",
    "Blood Cultures",
    "CRP",
    "Dengue NS1",
    "Malaria by ICT",
    "LFTs",
    "RFTs",
    "Lipid Profile",
    "HbA1c",
    "HBsAg & Anti HCV by ICT",
    "PCR for Hep B & Hep C",
    "Uric Acid",
    "Vit D3",
    "Stool for H. pylori",
    "Thyroid Profile",
    "Serum Ferritin",
    "Serum Calcium",
    "Pus for C/S",
    "RH Factor",
    "PT / APTT / INR",
    "Semen Analysis",
    "Sputum for AFB",
    "Not in the list",
  ];

  const root = document.getElementById("chatbot");
  if (!root) return;

  const launcher = document.getElementById("chatbot-launcher");
  const panel = document.getElementById("chatbot-panel");
  const messagesEl = document.getElementById("chatbot-messages");
  const optionsEl = document.getElementById("chatbot-options");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const closeBtn = document.getElementById("chatbot-close");
  const restartBtn = document.getElementById("chatbot-restart");

  const state = {
    step: "name",
    name: "",
    location: "",
    category: "",
    generalNeed: "",
    generalOther: "",
    labTest: "",
    customTest: "",
  };

  const openPanel = () => {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    if (!messagesEl.childElementCount) startChat();
    setTimeout(() => input.focus(), 50);
  };

  const closePanel = () => {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  };

  const addBubble = (text, who = "bot") => {
    const el = document.createElement("div");
    el.className = `chat-bubble ${who}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const setInputVisible = (visible, placeholder = "Type here…") => {
    form.classList.toggle("is-hidden", !visible);
    input.placeholder = placeholder;
    input.value = "";
    input.required = visible;
    if (visible) setTimeout(() => input.focus(), 40);
  };

  const clearOptions = () => {
    optionsEl.innerHTML = "";
    optionsEl.hidden = true;
  };

  const showOptions = (items, onPick) => {
    clearOptions();
    optionsEl.hidden = false;
    items.forEach((label) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-option";
      btn.textContent = label;
      btn.addEventListener("click", () => onPick(label));
      optionsEl.appendChild(btn);
    });
  };

  const showWhatsApp = () => {
    clearOptions();
    optionsEl.hidden = false;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-option wa";
    btn.textContent = "Send on WhatsApp";
    btn.addEventListener("click", () => {
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage())}`;
      window.open(url, "_blank", "noopener");
    });
    optionsEl.appendChild(btn);

    const again = document.createElement("button");
    again.type = "button";
    again.className = "chat-option";
    again.textContent = "Start again";
    again.addEventListener("click", startChat);
    optionsEl.appendChild(again);
  };

  const buildMessage = () => {
    const lines = [
      "Assalam o Alaikum,",
      "Al Suba Clinic enquiry:",
      "",
      `Name: ${state.name}`,
      `Location: ${state.location}`,
      `Type: ${state.category}`,
    ];

    if (state.category === "General") {
      lines.push(`Request: ${state.generalNeed}`);
      if (state.generalOther) lines.push(`Details: ${state.generalOther}`);
    }

    if (state.category === "Lab Test") {
      const test =
        state.labTest === "Not in the list" ? state.customTest : state.labTest;
      lines.push(`Lab test: ${test}`);
    }

    lines.push("", "Please guide / confirm. Thank you.");
    return lines.join("\n");
  };

  const askCategory = () => {
    state.step = "category";
    setInputVisible(false);
    addBubble("Aapko kya chahiye?");
    showOptions(["General", "Lab Test"], (choice) => {
      state.category = choice;
      addBubble(choice, "user");
      clearOptions();

      if (choice === "General") {
        state.step = "general";
        addBubble("Aap appointment chahte hain ya kuch aur?");
        showOptions(["Appointment", "Kuch aur"], (need) => {
          state.generalNeed = need;
          addBubble(need, "user");
          clearOptions();

          if (need === "Kuch aur") {
            state.step = "generalOther";
            addBubble("Please bataiye aapko kya chahiye?");
            setInputVisible(true, "Apni zaroorat likhein…");
            return;
          }

          finishAndOfferWhatsApp();
        });
        return;
      }

      state.step = "lab";
      addBubble("Kaunsa lab test chahiye? List se select karein:");
      showOptions(LAB_TESTS, (test) => {
        state.labTest = test;
        addBubble(test, "user");
        clearOptions();

        if (test === "Not in the list") {
          state.step = "customLab";
          addBubble("Please likhein kaunsa test chahiye?");
          setInputVisible(true, "Test ka naam likhein…");
          return;
        }

        finishAndOfferWhatsApp();
      });
    });
  };

  const finishAndOfferWhatsApp = () => {
    state.step = "done";
    setInputVisible(false);
    addBubble(
      "Shukriya! Neeche button se yeh details WhatsApp par bhej sakte hain."
    );
    showWhatsApp();
  };

  const startChat = () => {
    Object.assign(state, {
      step: "name",
      name: "",
      location: "",
      category: "",
      generalNeed: "",
      generalOther: "",
      labTest: "",
      customTest: "",
    });
    messagesEl.innerHTML = "";
    clearOptions();
    addBubble("Assalam o Alaikum! Al Suba Clinic assistant. Aapka naam kya hai?");
    setInputVisible(true, "Apna naam likhein…");
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    addBubble(value, "user");
    input.value = "";

    if (state.step === "name") {
      state.name = value;
      state.step = "location";
      addBubble(`Shukriya, ${state.name}. Aap kis location / area se hain?`);
      setInputVisible(true, "Location / area likhein…");
      return;
    }

    if (state.step === "location") {
      state.location = value;
      askCategory();
      return;
    }

    if (state.step === "generalOther") {
      state.generalOther = value;
      finishAndOfferWhatsApp();
      return;
    }

    if (state.step === "customLab") {
      state.customTest = value;
      finishAndOfferWhatsApp();
    }
  });

  launcher.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  closeBtn.addEventListener("click", closePanel);
  restartBtn.addEventListener("click", startChat);

  // Auto-open once so visitors notice the assistant
  setTimeout(() => {
    if (panel.hidden) openPanel();
  }, 1200);
})();
