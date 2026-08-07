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
    "فہرست میں نہیں",
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
    el.lang = "ur";
    el.dir = "rtl";
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const setInputVisible = (visible, placeholder) => {
    placeholder = placeholder || "یہاں لکھیں...";
    form.classList.toggle("is-hidden", !visible);
    input.placeholder = placeholder;
    input.lang = "ur";
    input.dir = "rtl";
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
    optionsEl.dir = "rtl";
    items.forEach(function (label) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chat-option";
      btn.lang = "ur";
      btn.dir = "rtl";
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
    btn.textContent = "واٹس ایپ پر بھیجیں";
    btn.addEventListener("click", function () {
      openWhatsApp(buildMessage());
    });
    optionsEl.appendChild(btn);

    const again = document.createElement("button");
    again.type = "button";
    again.className = "chat-option";
    again.lang = "ur";
    again.dir = "rtl";
    again.textContent = "دوبارہ شروع کریں";
    again.addEventListener("click", startChat);
    optionsEl.appendChild(again);
  };

  const buildMessage = () => {
    const lines = [
      "السلام علیکم،",
      "آل صبا کلینک پوچھ گچھ:",
      "",
      "نام: " + state.name,
      "مقام: " + state.location,
      "قسم: " + state.category,
    ];

    if (state.category === "جنرل") {
      lines.push("درخواست: " + state.generalNeed);
      if (state.generalOther) lines.push("تفصیل: " + state.generalOther);
    }

    if (state.category === "لیب ٹیسٹ") {
      const test =
        state.labTest === "فہرست میں نہیں" ? state.customTest : state.labTest;
      lines.push("لیب ٹیسٹ: " + test);
    }

    lines.push("", "براہ کرم رہنمائی / تصدیق فرمائیں۔ شکریہ۔");
    return lines.join("\n");
  };

  const askCategory = () => {
    state.step = "category";
    setInputVisible(false);
    addBubble("آپ کو کیا چاہیے؟");
    showOptions(["جنرل", "لیب ٹیسٹ"], function (choice) {
      state.category = choice;
      addBubble(choice, "user");
      clearOptions();

      if (choice === "جنرل") {
        state.step = "general";
        addBubble("کیا آپ اپائنٹمنٹ چاہتے ہیں یا کچھ اور؟");
        showOptions(["اپائنٹمنٹ", "کچھ اور"], function (need) {
          state.generalNeed = need;
          addBubble(need, "user");
          clearOptions();

          if (need === "کچھ اور") {
            state.step = "generalOther";
            addBubble("براہ کرم بتائیں آپ کو کیا چاہیے؟");
            setInputVisible(true, "اپنی ضرورت لکھیں...");
            return;
          }

          finishAndOfferWhatsApp();
        });
        return;
      }

      state.step = "lab";
      addBubble("کون سا لیب ٹیسٹ چاہیے؟ فہرست سے منتخب کریں:");
      showOptions(LAB_TESTS, function (test) {
        state.labTest = test;
        addBubble(test, "user");
        clearOptions();

        if (test === "فہرست میں نہیں") {
          state.step = "customLab";
          addBubble("براہ کرم لکھیں کون سا ٹیسٹ چاہیے؟");
          setInputVisible(true, "ٹیسٹ کا نام لکھیں...");
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
      "شکریہ! نیچے بٹن سے یہ تفصیلات واٹس ایپ پر بھیج سکتے ہیں۔"
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
      "السلام علیکم! آل صبا کلینک اسسٹنٹ۔ آپ کا نام کیا ہے؟"
    );
    setInputVisible(true, "اپنا نام لکھیں...");
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
        "شکریہ، " + state.name + "۔ آپ کس مقام / علاقے سے ہیں؟"
      );
      setInputVisible(true, "مقام / علاقہ لکھیں...");
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
    root.style.setProperty("--vv-height", vv.height + "px");
    root.style.setProperty("--vv-offset", vv.offsetTop + "px");
  };
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", syncViewport);
    window.visualViewport.addEventListener("scroll", syncViewport);
    syncViewport();
  }

  closePanel();
})();
