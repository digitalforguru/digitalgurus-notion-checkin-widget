import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://johavlaywmsjelumhirv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaGF2bGF5d21zamVsdW1oaXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODMwNDQsImV4cCI6MjA5Mzc1OTA0NH0.rEtIZ-Pzk0paEb2wom6wG1jJ6Dej_u5FO_TIoNRygEg"
);

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("checkinWidget");
  const textarea = document.getElementById("checkinText");
  const saveBtn = document.getElementById("saveCheckinBtn");
  const saveMessage = document.getElementById("saveMessage");
  const checkinPrompt = document.getElementById("checkinPrompt");

const prompts = [
  "what’s on your mind?",
  "what does your dream life look like?",
  "what is your ideal day this week?",
  "what are 3 things you're grateful for?",
  "what energy are you bringing into today?",
  "how have you changed in the last 5 years?",
  "what are you avoiding lately?",
  "what are you grateful for today?",
  "what’s been on repeat in your head?",
  "describe today in one sentence...",
  "if failing wasn't possible, what would you do?",
  "if someone else described you what would they say?",
  "write a letter to your future self...",
  "what is your biggest fear?",
  "what is going well in your life and why?",
  "what are 5 things that make you happy?",
  "my favorite memory is...",
  "discussing my opinion on social media...",
  "when is the last time you cried? why?",
  "describe your childhood and how it shaped you :)",
  "what is one thing you wish you could tell yourself 5 years ago?",
  "my love language and why...",
  "how did you sleep?",
  "something i am proud of myself for...",
  "how do i want to feel at the end of the day today?",
  "last night i dreamt about...",
  "what would make today great?",
  "one thing i learned yesterday...",
  "one positive thing to focus on today:"
];

const todaysPrompt =
  prompts[new Date().getDate() % prompts.length];

checkinPrompt.textContent = todaysPrompt;

  const themeToggle = document.getElementById("themeToggle");
  const themeOptions = document.getElementById("themeOptions");
  const themeCircles = document.querySelectorAll(".theme-circle");

  const fontToggle = document.getElementById("fontToggle");
  const fontOptions = document.getElementById("fontOptions");
  const fontChoices = document.querySelectorAll(".font-option");

  const viewEntriesBtn =
  document.getElementById("viewEntriesBtn");
  
  const entriesPopup =
  document.getElementById("entriesPopup");
  
  const entriesContainer =
  document.getElementById("entriesContainer");
  
  const closeEntriesBtn =
  document.getElementById("closeEntriesBtn");

  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMessage");

  const params = new URLSearchParams(window.location.search);

  const state = {
    theme: params.get("theme") || "pink",
    font: params.get("font") || "default",
    embed: params.get("embed") === "true"
  };

  const widgetId =
    params.get("id") ||
    (crypto.randomUUID ? crypto.randomUUID() : `checkin-${Date.now()}`);

  if (state.embed) {
    document.querySelector(".builder-ui")?.style.setProperty("display", "none");
  }

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function applyTheme(theme) {
    widget.classList.remove("pink", "green", "beige", "blue", "black", "white");
    widget.classList.add(theme);
    state.theme = theme;
  }

  function applyFont(font) {
    const fontFamily =
      font === "serif"
        ? "Georgia, serif"
        : font === "mono"
        ? "ui-monospace, SFMono-Regular, Menlo, monospace"
        : "'Satoshi', sans-serif";

    widget.style.fontFamily = fontFamily;
    state.font = font;
  }

  async function loadCheckin() {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    if (error) {
      console.error("Supabase load error:", error);
      return;
    }

    const saved =
      data?.data?.[todayKey()]?.text || "";
    
    textarea.value = saved;
  }

  async function saveCheckin() {
    const text = textarea.value.trim();

    const { data } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    const currentData = data?.data || {};
    currentData[todayKey()] = {
      prompt: todaysPrompt,
      text
    };

    const { error } = await supabase.from("mood_logs").upsert({
      id: widgetId,
      data: currentData,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error("Supabase save error:", error);
      return;
    }

    saveMessage.classList.remove("hidden");
    saveMessage.classList.add("show");

    clearTimeout(window.__saveTimer);
    window.__saveTimer = setTimeout(() => {
      saveMessage.classList.add("hidden");
      saveMessage.classList.remove("show");
    }, 1400);
  }

  themeToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions.classList.toggle("hidden");
  });

  themeCircles.forEach((circle) => {
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      applyTheme(circle.dataset.theme);
      themeOptions.classList.add("hidden");
    });
  });

  fontToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions.classList.toggle("hidden");
  });

  fontChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFont(option.dataset.font);
      fontOptions.classList.add("hidden");
    });
  });


  viewEntriesBtn?.addEventListener("click", async () => {
  const { data } = await supabase
    .from("mood_logs")
    .select("data")
    .eq("id", widgetId)
    .maybeSingle();

  const entries = data?.data || {};

  entriesContainer.innerHTML = "";

  Object.entries(entries)
    .reverse()
    .forEach(([date, entry]) => {
      if (!entry?.text) return;

      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <div class="entry-date">${date}</div>

        <div class="entry-prompt">
          ${entry.prompt || ""}
        </div>

        <div class="entry-text">
          ${entry.text}
        </div>
      `;

      entriesContainer.appendChild(card);
    });

  entriesPopup.classList.remove("hidden");
});

closeEntriesBtn?.addEventListener("click", () => {
  entriesPopup.classList.add("hidden");
});


  saveBtn?.addEventListener("click", saveCheckin);

  copyBtn?.addEventListener("click", async () => {
    const url =
      `${location.origin}${location.pathname}` +
      `?id=${encodeURIComponent(widgetId)}` +
      `&theme=${encodeURIComponent(state.theme)}` +
      `&font=${encodeURIComponent(state.font)}` +
      `&embed=true`;

    await navigator.clipboard.writeText(url);

    copyMsg.classList.remove("hidden");
    copyMsg.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      copyMsg.classList.add("hidden");
      copyMsg.classList.remove("show");
    }, 1500);
  });

  document.addEventListener("click", () => {
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
  });

  applyTheme(state.theme);
  applyFont(state.font);
  loadCheckin();
});
