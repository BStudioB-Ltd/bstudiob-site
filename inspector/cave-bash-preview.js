(() => {
  const activity = document.getElementById("activity");
  if (!activity) return;

  const $ = (id) => document.getElementById(id);
  const sceneKicker = $("scene-kicker");
  const sceneTitle = $("scene-title");
  const sceneCopy = $("scene-copy");
  const sceneActions = $("scene-actions");
  const sceneSignal = $("scene-signal");
  const hudLocation = $("hud-location");
  const selectionPanel = $("selection-panel");
  const selectionTitle = $("selection-title");
  const selectionCopy = $("selection-copy");
  const playPanel = $("play-panel");
  const completionPanel = $("completion-panel");
  const menuReturn = $("menu-return");
  const modeLabel = $("mode-label");
  const activityTitle = $("activity-title");
  const activityObjective = $("activity-objective");
  const stepProgress = $("step-progress");
  const terminalOutput = $("terminal-output");
  const terminalForm = $("terminal-form");
  const terminalCommand = $("terminal-command");
  const terminalPrompt = $("terminal-prompt");
  const commandFeedback = $("command-feedback");
  const scopeCheckpoint = $("scope-checkpoint");

  const storySteps = [
    {
      command: "whoami",
      chapter: "01",
      title: "Who is at the terminal?",
      objective: "Run whoami to confirm the local training operator.",
      output: "learner",
      cue: "story-operator-identified",
      evidence: "operator confirmed: learner",
      guidance:
        "Mira confirms the sample operator. This is local sandbox context, not a real-world identity claim.",
      sceneCopy:
        "Mira checks your badge before trusting any evidence from the training workstation.",
      signal: "Operator badge confirmed · sample identity only.",
    },
    {
      command: "hostname",
      chapter: "01",
      title: "Confirm the workstation",
      objective: "Run hostname to record the local training workstation.",
      output: "learner-workstation",
      cue: "story-workstation-confirmed",
      evidence: "local workstation: learner-workstation",
      guidance:
        "The workstation name ties the notes to this fictional local lab. The local-only boundary is now marked in the scene.",
      sceneCopy:
        "The workstation is identified. Mira marks the cafe as a local-only training scene.",
      signal: "Local-only training boundary marked.",
    },
    {
      command: "netstat -an",
      chapter: "02",
      title: "What is on the network?",
      objective:
        "Run netstat -an to inspect the fixed local connection sample.",
      output:
        "Proto  Local Address          Foreign Address        State\ntcp    127.0.0.1:3000         127.0.0.1:53014       ESTABLISHED\ntcp    127.0.0.1:4444         127.0.0.1:53018       ESTABLISHED\n\nTraining observation: Table 04 is marked needs review. No person is identified.",
      cue: "story-traffic-spotted",
      evidence: "local traffic observed: Table 04 needs review",
      guidance:
        "The highlighted table is a fictional training observation, not a real suspect. Check the local-only boundary before collecting evidence.",
      sceneCopy:
        "A fictional local traffic sample flags Table 04 for review. Mira records an observation, not an accusation.",
      signal: "Table 04 highlighted · training observation only.",
    },
    {
      command: "echo mira-coffee-shop local-only evidence suspicious",
      chapter: "04",
      title: "Gather local evidence",
      objective:
        "Run the displayed echo command to record a bounded training note.",
      output: "mira-coffee-shop local-only evidence suspicious",
      cue: "story-evidence-collected",
      evidence: "local-only evidence note recorded",
      guidance:
        "The sample note records a fictional observation before any response. Nothing is written to a real file or sent outside this frame.",
      sceneCopy:
        "Mira adds the local-only observation to the evidence board before choosing a response.",
      signal: "Evidence board updated · local sample only.",
    },
    {
      command: "echo decoy-warning-ready",
      chapter: "05",
      title: "Stage the simulated response",
      objective:
        "Run echo decoy-warning-ready to stage the fictional training warning.",
      output: "decoy-warning-ready",
      cue: "story-decoy-played",
      evidence: "simulated warning staged; no alert sent",
      guidance:
        "The story ends with a simulated defensive warning. It is not sent to staff or anyone outside the preview.",
      sceneCopy:
        "The responder appears in the story. Mira stages a safe training warning; no real alert is sent.",
      signal: "Simulated response staged · no external delivery.",
    },
  ];

  const taskSteps = [
    {
      command: "whoami",
      title: "Identify the sandbox user",
      objective: "Record which local learner identity is operating in this sample.",
      output: "learner",
      cue: "task-user-identified",
      evidence: "local user identity: learner",
      guidance:
        "A short username identifies the account associated with activity in the lab.",
    },
    {
      command: "hostname",
      title: "Label the sandbox host",
      objective: "Record the name of the local training workstation.",
      output: "learner-workstation",
      cue: "task-host-labelled",
      evidence: "local host label: learner-workstation",
      guidance:
        "A host label connects your notes to the local workstation.",
    },
    {
      command: "ip addr",
      title: "Inspect local interfaces",
      objective: "Review only the interfaces represented in this fixed sample.",
      output:
        "1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,UP>\n    link/ether 02:42:ac:12:00:02\n    inet 172.18.0.2/16 scope global eth0",
      cue: "task-interfaces-inspected",
      evidence: "local interfaces: lo, eth0, 127.0.0.1, 172.18.0.2",
      guidance:
        "The interface records describe local network surfaces. This preview makes no network request.",
    },
  ];

  let view = "menu";
  let activeMode = null;
  let storyStepIndex = 0;
  let taskStepIndex = 0;
  let cueSequence = 0;

  function publish(event) {
    if (window.parent === window) return;
    window.parent.postMessage(
      { type: "inspector-edu-preview", version: 1, event },
      "*",
    );
  }

  function actionButton(label, callback, secondary = false, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (secondary) button.className = "secondary";
    if (disabled) {
      button.disabled = true;
      button.title = "This Cave Bash menu option is outside the website preview.";
    } else {
      button.addEventListener("click", callback);
    }
    return button;
  }

  function setScene({ kicker, title, copy, actions = [] }) {
    sceneKicker.textContent = kicker;
    sceneTitle.textContent = title;
    sceneCopy.textContent = copy;
    sceneActions.replaceChildren(
      ...actions.map(({ label, callback, secondary, disabled }) =>
        actionButton(label, callback, secondary, disabled),
      ),
    );
  }

  function focusElement(element) {
    if (!element) return;
    window.requestAnimationFrame(() => element.focus());
  }

  function focusSceneAction() {
    focusElement(sceneActions.querySelector("button"));
  }

  function setSelection(title, copy) {
    selectionTitle.textContent = title;
    selectionCopy.textContent = copy;
  }

  function setLocation(location, label) {
    activity.dataset.location = location;
    hudLocation.textContent = label;
  }

  function triggerCue(cue, message) {
    cueSequence += 1;
    const currentSequence = cueSequence;
    activity.dataset.cue = "idle";
    sceneSignal.textContent = message;
    requestAnimationFrame(() => {
      if (currentSequence === cueSequence) activity.dataset.cue = cue;
    });
    window.setTimeout(() => {
      if (currentSequence === cueSequence) activity.dataset.cue = "idle";
    }, 2600);
  }

  function showMainMenu() {
    view = "menu";
    activeMode = null;
    setLocation("cave", "CAVE BASH · STARTUP");
    activity.dataset.storyProgress = "0";
    menuReturn.hidden = true;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    scopeCheckpoint.hidden = true;
    terminalForm.hidden = true;
    setSelection(
      "Cave Bash startup menu",
      "Choose Story Mode for Mira: Coffee Shop Recon, or Task Mode for Task 01. Inspector Online and Options are shown as menu labels; those screens are outside this preview.",
    );
    setScene({
      kicker: "CAVE BASH / STARTUP MENU",
      title: "DemoRPG: Cave Bash",
      copy: "Cave Bash start-up menu. Story Mode and Task Mode are interactive; Inspector Online and Options are shown for context.",
      actions: [
        { label: "Story Mode →", callback: showStoryCard },
        { label: "Task Mode →", callback: showTaskCard },
        { label: "Inspector Online", disabled: true },
        { label: "Options", disabled: true },
      ],
    });
    focusSceneAction();
  }

  function resetPreview() {
    showMainMenu();
    publish({ kind: "reset" });
  }

  function showStoryCard() {
    view = "story-card";
    activeMode = "story";
    setLocation("cave", "STORY MODE · SELECT A STORY");
    menuReturn.hidden = false;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    scopeCheckpoint.hidden = true;
    setSelection(
      "Story Mode / Mira’s Coffee Shop Recon",
      "A five-step story about local context, network awareness, bounded evidence and an ethical simulated response.",
    );
    setScene({
      kicker: "STORY MODE / SELECT A STORY",
      title: "Mira: Coffee Shop Recon",
      copy: "Mira is investigating a fictional cafe training network. Establish local context, observe activity, record evidence and stage a safe simulated response.",
      actions: [
        { label: "Select Coffee Shop Recon →", callback: startStory },
        { label: "Back to Cave Bash", callback: showMainMenu, secondary: true },
      ],
    });
    focusSceneAction();
  }

  function showTaskCard() {
    view = "task-card";
    activeMode = "task";
    setLocation("cave", "TASK MODE · TASK 01");
    menuReturn.hidden = false;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    scopeCheckpoint.hidden = true;
    setSelection(
      "Task Mode / Task 01",
      "Identify the local user and host, then inspect the sample interface records. The target is the fictional learner workstation only.",
    );
    setScene({
      kicker: "TASK MODE / AVAILABLE TASK",
      title: "Task 01: Information Gathering",
      copy: "Start with your local identity, label the workstation, and review its sample interfaces. No external target is involved.",
      actions: [
        { label: "Start Task 01 →", callback: startTask },
        { label: "Back to Cave Bash", callback: showMainMenu, secondary: true },
      ],
    });
    focusSceneAction();
  }

  function renderProgress(total, current) {
    stepProgress.replaceChildren();
    stepProgress.setAttribute("aria-label", `Step ${current + 1} of ${total}`);
    for (let index = 0; index < total; index += 1) {
      const dot = document.createElement("span");
      dot.className = "step-dot";
      if (index < current) dot.classList.add("complete");
      if (index === current) dot.classList.add("current");
      dot.setAttribute("aria-hidden", "true");
      stepProgress.appendChild(dot);
    }
  }

  function setPlayScene(kicker, title, copy, signal = "Mira is ready.") {
    setScene({ kicker, title, copy });
    sceneSignal.textContent = signal;
  }

  function showStoryStep() {
    view = "story-play";
    activeMode = "story";
    setLocation("coffee-shop", "COFFEE SHOP · MIRA ARC");
    activity.dataset.storyProgress = String(storyStepIndex);
    selectionPanel.hidden = true;
    completionPanel.hidden = true;
    playPanel.hidden = false;
    menuReturn.hidden = false;
    scopeCheckpoint.hidden = true;
    terminalForm.hidden = false;
    modeLabel.textContent = "STORY MODE / MIRA: COFFEE SHOP RECON";

    const step = storySteps[storyStepIndex];
    activityTitle.textContent = step.title;
    activityObjective.textContent = step.objective;
    terminalPrompt.textContent = `Enter ${step.command} for this fixed sample`;
    terminalCommand.value = "";
    terminalCommand.placeholder = step.command;
    commandFeedback.textContent = `Only ${step.command} is accepted for this step.`;
    renderProgress(storySteps.length, storyStepIndex);
    setPlayScene(
      `STORY MODE / CHAPTER ${step.chapter}`,
      step.title,
      step.sceneCopy,
      step.signal,
    );
    focusElement(terminalCommand);
  }

  function showScopeCheckpoint() {
    view = "story-scope";
    activeMode = "story";
    activity.dataset.storyProgress = String(storyStepIndex);
    selectionPanel.hidden = true;
    completionPanel.hidden = true;
    playPanel.hidden = false;
    menuReturn.hidden = false;
    terminalForm.hidden = true;
    scopeCheckpoint.hidden = false;
    modeLabel.textContent = "STORY MODE / SCOPE CHECKPOINT";
    activityTitle.textContent = "Stay inside the training boundary";
    activityObjective.textContent =
      "Before collecting evidence, confirm the cafe and its traffic are fictional local samples.";
    renderProgress(storySteps.length, storyStepIndex);
    setPlayScene(
      "STORY MODE / CHAPTER 03",
      "What is local and safe?",
      "The cafe is fictional. Keep this investigation inside the training scene and treat the flagged table as an observation, not a person or real device.",
      "Local-only boundary check · no external target.",
    );
    focusElement($("continue-safely"));
  }

  function startStory() {
    storyStepIndex = 0;
    terminalOutput.textContent =
      "Mira: Coffee Shop Recon\nFictional local-only training sample.\nNo command has run.";
    commandFeedback.textContent = "Only the displayed sample command is accepted.";
    publish({ kind: "reset" });
    showStoryStep();
  }

  function showTaskStep() {
    view = "task-play";
    activeMode = "task";
    setLocation("cave", "TASK MODE · TASK 01");
    selectionPanel.hidden = true;
    completionPanel.hidden = true;
    playPanel.hidden = false;
    menuReturn.hidden = false;
    scopeCheckpoint.hidden = true;
    terminalForm.hidden = false;
    modeLabel.textContent = "TASK MODE / TASK 01: INFORMATION GATHERING";

    const step = taskSteps[taskStepIndex];
    activityTitle.textContent = step.title;
    activityObjective.textContent = step.objective;
    terminalPrompt.textContent = `Enter ${step.command} to record this sample`;
    terminalCommand.value = "";
    terminalCommand.placeholder = step.command;
    commandFeedback.textContent = `Only ${step.command} is accepted for this step.`;
    renderProgress(taskSteps.length, taskStepIndex);
    setPlayScene(
      `TASK MODE / EVIDENCE 0${taskStepIndex + 1}`,
      step.title,
      step.objective,
      "Mira is ready for the next local sample.",
    );
    focusElement(terminalCommand);
  }

  function startTask() {
    taskStepIndex = 0;
    terminalOutput.textContent =
      "Task 01: Information Gathering\n\n[Local workstation sample only]";
    commandFeedback.textContent = "Only the displayed sample command is accepted.";
    publish({ kind: "reset" });
    showTaskStep();
  }

  function showComplete(mode) {
    view = "complete";
    playPanel.hidden = true;
    scopeCheckpoint.hidden = true;
    completionPanel.hidden = false;
    menuReturn.hidden = true;
    const isStory = mode === "story";
    $("completion-title").textContent = isStory
      ? "Coffee Shop Recon complete"
      : "Three pieces of local evidence";
    $("completion-copy").textContent = isStory
      ? "You confirmed the operator and workstation, observed fictional local traffic, recorded bounded evidence and staged a simulated warning. Nothing was sent outside the preview."
      : "You recorded the local user, workstation name and interface sample. No external target was contacted.";
    setScene({
      kicker: isStory ? "STORY MODE / COMPLETE" : "TASK MODE / COMPLETE",
      title: isStory ? "Mira’s report is ready." : "Evidence gathered.",
      copy: isStory
        ? "The fictional cafe investigation ends with a local evidence note and a simulated response."
        : "The local workstation evidence is recorded in this preview. Mira marks the task complete.",
      actions: [
        { label: "Return to Cave Bash menu →", callback: showMainMenu },
      ],
    });
    triggerCue(
      isStory ? "story-complete" : "task-complete",
      isStory
        ? "Coffee Shop Recon complete · simulated response only."
        : "Local evidence reviewed · sample task complete.",
    );
    publish({
      kind: "complete",
      mode,
      guidance: isStory
        ? "Mira’s Coffee Shop Recon is complete: local context, traffic observation, safe evidence collection and a simulated response."
        : "Task Mode complete: local user, host and interface evidence are recorded.",
    });
    focusElement($("replay-activity"));
  }

  function recordStoryStep(step) {
    terminalOutput.textContent = `> ${step.command}\n${step.output}\n\n[Fixed sample output — no command executed]`;
    commandFeedback.textContent =
      "Sample evidence recorded. Mira responds in the coffee shop scene.";
    publish({
      kind: "evidence",
      mode: "story",
      record: `${step.command} → ${step.evidence}`,
      guidance: step.guidance,
    });
    triggerCue(step.cue, step.signal);
    storyStepIndex += 1;
    activity.dataset.storyProgress = String(storyStepIndex);

    if (storyStepIndex >= storySteps.length) {
      showComplete("story");
    } else if (storyStepIndex === 3) {
      showScopeCheckpoint();
    } else {
      showStoryStep();
    }
  }

  function recordTaskStep(step) {
    terminalOutput.textContent = `> ${step.command}\n${step.output}\n\n[Fixed sample output — no command executed]`;
    commandFeedback.textContent = "Sample evidence recorded. Mira responds in the cave scene.";
    publish({
      kind: "evidence",
      mode: "task",
      record: `${step.command} → ${step.evidence}`,
      guidance: step.guidance,
    });
    triggerCue(step.cue, `${step.command} · local evidence recorded.`);
    taskStepIndex += 1;
    if (taskStepIndex >= taskSteps.length) {
      showComplete("task");
      return;
    }
    showTaskStep();
  }

  function runCurrentTerminalCommand() {
    const command = terminalCommand.value;
    if (activeMode === "story" && view === "story-play") {
      const step = storySteps[storyStepIndex];
      if (command !== step.command) {
        commandFeedback.textContent = `Enter ${step.command} exactly. This sample runs no other command.`;
        terminalCommand.focus();
        return;
      }
      recordStoryStep(step);
      terminalCommand.value = "";
      return;
    }

    if (activeMode === "task" && view === "task-play") {
      const step = taskSteps[taskStepIndex];
      if (command !== step.command) {
        commandFeedback.textContent = `Enter ${step.command} exactly. This sample runs no other command.`;
        terminalCommand.focus();
        return;
      }
      recordTaskStep(step);
      terminalCommand.value = "";
    }
  }

  $("run-command").addEventListener("click", runCurrentTerminalCommand);
  terminalCommand.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    runCurrentTerminalCommand();
  });

  $("continue-safely").addEventListener("click", showStoryStep);
  menuReturn.addEventListener("click", showMainMenu);
  $("replay-activity").addEventListener("click", showMainMenu);
  $("reset-preview").addEventListener("click", resetPreview);

  showMainMenu();
  publish({ kind: "reset" });
})();
