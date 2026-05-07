import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_SUPABASE_ANON_KEY"
);

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("checkinWidget");
  const textarea = document.getElementById("checkinText");
  const saveBtn = document.getElementById("saveCheckinBtn");
  const saveMessage = document.getElementById("saveMessage");

  const themeToggle = document.getElementById("themeToggle");
  const themeOptions = document.getElementById("themeOptions");
  const themeCircles = document.querySelectorAll(".theme-circle");

  const fontToggle = document.getElementById("fontToggle");
  const fontOptions = document.getElementById("fontOptions");
  const fontChoices = document.querySelectorAll(".font-option");

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
    widget.classList.remove("pink", "green", "beige", "blue");
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

    const saved = data?.data?.[todayKey()] || "";
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
    currentData[todayKey()] = text;

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
