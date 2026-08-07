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

  const rootEl = document.getElementById("chatbot");
  if (!rootEl) return;

  const launcher = document.getElementById("chatbot-launcher");
  const panel = document.getElementById("chatbot-panel");
  const messagesEl = document.getElementById("chatbot-messages");
  const optionsEl = document.getElementById("chatbot-options");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const closeBtn = document.getElementById("chatbot-close");
  const restartBtn = document.getElementById("chatbot-restart");

  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches;

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

  const isOpen = () => panel.classList.contains("is-open");

  const lockScroll = (lock) => {
    document.documentElement.classList.toggle("chat-open", lock);
    document.body.classList.toggle("chat-open", lock);
  };

  const openPanel = () => {
    panel.hidden = false;
    panel.classList.add("is-open");
    launcher.setAttribute("aria-expanded", "true");
    lockScroll(true);
    if (!messagesEl.childElementCount) startChat();
    if (!isTouch) {
      setTimeout(function () {
        input.focus();
      }, 50);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const closePanel = () => {
    panel.hidden = true;
    panel.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    lockScroll(false);
    if (document.activeElement && panel.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  };

  const addBubble = (text, who) => {
    who = who || "bot";
    const el = document.createElement("div");
    el.className = "chat-bubble " + who;
    el.lang = "en";
    el.dir = "ltr";
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const setInputVisible = (visible, placeholder) => {
    placeholder = placeholder || "Type here...";
    form.classList.toggle("is-hidden", !visible);
    input.placeholder = placeholder;
    input.lang = "en";
    input.dir = "ltr";
    input.value = "";
    input.required = visible;
    if (visible && !isTouch) {
      setTimeout(function () {
        input.focus();
      }, 40);
    }
  };

  const clearOptions = () => {
    optionsEl.innerHTML = "";
    optionsEl.hidden = true;
  };

  const showOptions = (items, onPick) => {
    clearOptions();
    optionsEl.hidden = false;
    optionsEl.dir = "ltr";
    items.forEach(function (label) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-option";
      btn.lang = "en";
      btn.dir = "ltr";
      btn.textContent = label;
      btn.addEventListener("click", function () {
        onPick(label);
      });
      optionsEl.appendChild(btn);
    });
    optionsEl.scrollTop = 0;
  };

  const openWhatsApp = (text) => {
    const url =
      "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
    if (isTouch) {
      window.location.href = url;
    } else {
      const win = window.open(url, "_blank", "noopener");
      if (!win) window.location.href = url;
    }
  };

  const showWhatsApp = () => {
    clearOptions();
    optionsEl.hidden = false;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chat-option wa";
    btn.textContent = "Send on WhatsApp";
    btn.addEventListener("click", function () {
      openWhatsApp(buildMessage());
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
      "Name: " + state.name,
      "Location: " + state.location,
      "Type: " + state.category,
    ];

    if (state.category === "General") {
      lines.push("Request: " + state.generalNeed);
      if (state.generalOther) lines.push("Details: " + state.generalOther);
    }

    if (state.category === "Lab Test") {
      const test =
        state.labTest === "Not in the list" ? state.customTest : state.labTest;
      lines.push("Lab test: " + test);
    }

    lines.push("", "Please guide / confirm. Thank you.");
    return lines.join("\n");
  };

  const askCategory = () => {
    state.step = "category";
    setInputVisible(false);
    addBubble("Aapko kya chahiye?");
    showOptions(["General", "Lab Test"], function (choice) {
      state.category = choice;
      addBubble(choice, "user");
      clearOptions();

      if (choice === "General") {
        state.step = "general";
        addBubble("Aap appointment chahte hain ya kuch aur?");
        showOptions(["Appointment", "Kuch aur"], function (need) {
          state.generalNeed = need;
          addBubble(need, "user");
          clearOptions();

          if (need === "Kuch aur") {
            state.step = "generalOther";
            addBubble("Please bataiye aapko kya chahiye?");
            setInputVisible(true, "Apni zaroorat likhein...");
            return;
          }

          finishAndOfferWhatsApp();
        });
        return;
      }

      state.step = "lab";
      addBubble("Kaunsa lab test chahiye? List se select karein:");
      showOptions(LAB_TESTS, function (test) {
        state.labTest = test;
        addBubble(test, "user");
        clearOptions();

        if (test === "Not in the list") {
          state.step = "customLab";
          addBubble("Please likhein kaunsa test chahiye?");
          setInputVisible(true, "Test ka naam likhein...");
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
    state.step = "name";
    state.name = "";
    state.location = "";
    state.category = "";
    state.generalNeed = "";
    state.generalOther = "";
    state.labTest = "";
    state.customTest = "";
    messagesEl.innerHTML = "";
    clearOptions();
    addBubble(
      "Assalam o Alaikum! Al Suba Clinic assistant. Aapka naam kya hai?"
    );
    setInputVisible(true, "Apna naam likhein...");
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    addBubble(value, "user");
    input.value = "";

    if (state.step === "name") {
      state.name = value;
      state.step = "location";
      addBubble(
        "Shukriya, " + state.name + ". Aap kis location / area se hain?"
      );
      setInputVisible(true, "Location / area likhein...");
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

  launcher.addEventListener("click", function (e) {
    e.preventDefault();
    if (isOpen()) closePanel();
    else openPanel();
  });

  closeBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });

  restartBtn.addEventListener("click", function (e) {
    e.preventDefault();
    startChat();
  });

  document.querySelectorAll(".js-open-chat").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openPanel();
      const header = document.querySelector(".site-header");
      const toggle = document.querySelector(".nav-toggle");
      if (header) header.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) closePanel();
  });

  const syncViewport = () => {
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    rootEl.style.setProperty("--vv-height", vv.height + "px");
    rootEl.style.setProperty("--vv-offset", vv.offsetTop + "px");
  };
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport);
    window.visualViewport.addEventListener("scroll", syncViewport);
    syncViewport();
  }

  closePanel();
})();
