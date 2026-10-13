(() => {
  const frame = document.getElementById("edu-activity-frame");
  const evidence = document.getElementById("edu-evidence");
  const guidance = document.getElementById("edu-expected");
  if (!frame || !evidence || !guidance) return;

  const emptyRecord = "No evidence collected yet.";
  const defaultGuidance =
    "Choose either mode, complete its activity and watch Mira and the cave respond inside the frame.";

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
