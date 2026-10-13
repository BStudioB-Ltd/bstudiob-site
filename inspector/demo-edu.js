(() => {
  const frame = document.getElementById("edu-activity-frame");
  const evidence = document.getElementById("edu-evidence");
  const guidance = document.getElementById("edu-expected");
  if (!frame || !evidence || !guidance) return;

  const emptyRecord = "No evidence collected yet.";
  const defaultGuidance =
    "Cave Bash is the startup menu. Choose Mira’s fictional café hacker mission in Story Mode or Task 01 in Task Mode. Story network actions are local simulations; Play starts third-party YouTube.";

  function clearEvidence() {
    const empty = document.createElement("li");
    empty.textContent = emptyRecord;
    evidence.replaceChildren(empty);
    guidance.textContent = defaultGuidance;
  }

  window.addEventListener("message", (message) => {
    if (message.source !== frame.contentWindow) return;
    const packet = message.data;
    if (
      !packet ||
      packet.type !== "inspector-edu-preview" ||
      packet.version !== 1 ||
      !packet.event ||
      typeof packet.event !== "object"
    ) {
      return;
    }

    const event = packet.event;
    if (event.kind === "reset") {
      clearEvidence();
      return;
    }

    if (event.kind === "evidence") {
      if (
        !["story", "task"].includes(event.mode) ||
        typeof event.record !== "string" ||
        event.record.length > 180 ||
        typeof event.guidance !== "string" ||
        event.guidance.length > 260
      ) {
        return;
      }
      const empty = evidence.querySelector("li");
      if (empty && empty.textContent === emptyRecord) empty.remove();
      const item = document.createElement("li");
      item.textContent = `${event.mode === "story" ? "Story" : "Task"}: ${event.record} (fixed sample)`;
      if (event.mode === "story" && event.video === "rickroll-requested") {
        // This link lives outside the sandboxed preview and requires a learner click.
        const videoLink = document.createElement("a");
        videoLink.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        videoLink.target = "_blank";
        videoLink.rel = "noopener noreferrer";
        videoLink.textContent = "Open the official YouTube video (third-party playback fallback)";
        item.append(document.createTextNode(" — "), videoLink);
      }
      evidence.append(item);
      guidance.textContent = event.guidance;
      return;
    }

    if (
      event.kind === "complete" &&
      ["story", "task"].includes(event.mode) &&
      typeof event.guidance === "string" &&
      event.guidance.length <= 260
    ) {
      guidance.textContent = event.guidance;
    }
  });
})();
