(() => {
  const activity = document.getElementById("activity");
  if (!activity) return;

  const $ = (id) => document.getElementById(id);
  const sceneKicker = $("scene-kicker");
  const sceneTitle = $("scene-title");
  const sceneCopy = $("scene-copy");
  const sceneActions = $("scene-actions");
  const sceneSignal = $("scene-signal");
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
  const blockPanel = $("block-panel");
  const blockWorkspace = $("block-workspace");
  const workspaceEmpty = $("workspace-empty");
  const runEchoBlock = $("run-echo-block");
  const blockFeedback = $("block-feedback");

  const taskSteps = [
    {
      command: "whoami",
      title: "Identify the sandbox user",
      objective: "Record which local learner identity is operating in this sample.",
      output: "learner",
      cue: "task-user-identified",
      evidence: "Local user identity: learner",
      guidance: "A short username identifies the account associated with activity in the lab.",
    },
    {
      command: "hostname",
      title: "Label the sandbox host",
      objective: "Record the name of the local training workstation.",
      output: "learner-workstation",
      cue: "task-host-labelled",
      evidence: "Local host label: learner-workstation",
      guidance: "A host label connects your notes to the local workstation.",
    },
    {
      command: "ip addr",
      title: "Inspect local interfaces",
      objective: "Review only the interfaces represented in this fixed sample.",
      output:
        "1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,UP>\n    link/ether 02:42:ac:12:00:02\n    inet 172.18.0.2/16 scope global eth0",
      cue: "task-interfaces-inspected",
      evidence: "Local interface records: lo, eth0, 127.0.0.1, 172.18.0.2",
      guidance: "The interface records describe local network surfaces. This preview makes no network request.",
    },
  ];

  let view = "menu";
  let activeMode = null;
  let taskStepIndex = 0;
  let echoBlockAdded = false;
  let cueSequence = 0;

  function publish(event) {
    if (window.parent === window) return;
    window.parent.postMessage(
      { type: "inspector-edu-preview", version: 1, event },
      "*",
    );
  }

  function actionButton(label, callback, secondary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    if (secondary) button.className = "secondary";
    button.addEventListener("click", callback);
    return button;
  }

  function setScene({ kicker, title, copy, actions = [] }) {
    sceneKicker.textContent = kicker;
    sceneTitle.textContent = title;
    sceneCopy.textContent = copy;
    sceneActions.replaceChildren(
      ...actions.map(({ label, callback, secondary }) =>
        actionButton(label, callback, secondary),
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
    menuReturn.hidden = true;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    blockPanel.hidden = true;
    setSelection(
      "Choose a mode in the cave",
      "Story Mode follows Mira through the original Cave Bash lesson. Task Mode opens Task 01: Information Gathering.",
    );
    setScene({
      kicker: "CAVE BASH / MAIN MENU",
      title: "DemoRPG: Cave Bash",
      copy: "A terminal glows in the cave. Choose how you want to investigate.",
      actions: [
        { label: "Story Mode →", callback: showStoryCard },
        { label: "Task Mode →", callback: showTaskCard },
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
    menuReturn.hidden = false;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    setSelection(
      "Story Mode / Mira’s cave lesson",
      "Follow the Cave Bash story through its two original actions: look around with ls, then send the echo hi block signal.",
    );
    setScene({
      kicker: "STORY MODE / SELECT A STORY",
      title: "DemoRPG: Cave Bash",
      copy: "Mira is waiting beside the glowing terminal. This short story uses the real lesson sequence and fixed browser-only responses.",
      actions: [
        { label: "Select Cave Bash →", callback: startStory },
        { label: "Back to menu", callback: showMainMenu, secondary: true },
      ],
    });
    focusSceneAction();
  }

  function showTaskCard() {
    view = "task-card";
    menuReturn.hidden = false;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
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
        { label: "Back to menu", callback: showMainMenu, secondary: true },
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
    selectionPanel.hidden = true;
    completionPanel.hidden = true;
    playPanel.hidden = false;
    menuReturn.hidden = false;
    modeLabel.textContent = "STORY MODE / DEMORPG: CAVE BASH";
    terminalForm.hidden = true;
    blockPanel.hidden = true;

    if (taskStepIndex === 0) {
      activityTitle.textContent = "Look around the cave";
      activityObjective.textContent = "Type ls in the sample terminal.";
      terminalPrompt.textContent = "Enter ls to look around the cave";
      terminalCommand.value = "";
      terminalCommand.placeholder = "ls";
      terminalForm.hidden = false;
      renderProgress(2, 0);
      setPlayScene(
        "STORY MODE / CHAPTER 01",
        "A terminal glows in the cave.",
        "Mira points to the local directory. Enter ls to reveal the Cave Bash menu.",
      );
      focusElement(terminalCommand);
      return;
    }

    activityTitle.textContent = "Send a custom block signal";
    activityObjective.textContent = "Add the echo block, then run echo hi.";
    renderProgress(2, 1);
    blockPanel.hidden = false;
    terminalCommand.value = "";
    setPlayScene(
      "STORY MODE / CHAPTER 02",
      "Send a custom block signal.",
      "Place the lesson’s echo block in the workspace and run it. The signal will light up the cave.",
      "The Cave Bash menu is open. Continue the story when ready.",
    );
    focusElement($("add-echo-block"));
  }

  function startStory() {
    taskStepIndex = 0;
    echoBlockAdded = false;
    terminalOutput.textContent = "Cave Bash preview ready.\nNo command has run.";
    commandFeedback.textContent = "Only ls is accepted for this story step.";
    blockFeedback.textContent = "The lesson expects echo hi.";
    blockWorkspace.replaceChildren(workspaceEmpty);
    workspaceEmpty.hidden = false;
    runEchoBlock.disabled = true;
    view = "story-play";
    showStoryStep();
  }

  function showTaskStep() {
    view = "task-play";
    activeMode = "task";
    selectionPanel.hidden = true;
    completionPanel.hidden = true;
    playPanel.hidden = false;
    menuReturn.hidden = false;
    blockPanel.hidden = true;
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
    activeMode = "task";
    terminalOutput.textContent = "Task 01: Information Gathering\n\n[Local workstation sample only]";
    commandFeedback.textContent = "Only the displayed sample command is accepted.";
    showTaskStep();
  }

  function showCaveMenuAfterLookAround() {
    view = "story-menu";
    terminalForm.hidden = true;
    blockPanel.hidden = true;
    activityTitle.textContent = "Cave Bash menu";
    activityObjective.textContent = "Continue the Cave Bash story or return to the mode selection.";
    commandFeedback.textContent = "The directory listing is fixed sample output.";
    setPlayScene(
      "CAVE BASH / MENU OPEN",
      "The cave answers.",
      "A local directory listing opens the Cave Bash menu. Continue Story Mode to send the custom block signal.",
      "Menu opened · Mira found a local directory.",
    );
    sceneActions.append(
      actionButton("Continue Story →", () => {
        taskStepIndex = 1;
        showStoryStep();
      }),
      actionButton("Back to modes", showMainMenu, true),
    );
    focusSceneAction();
    triggerCue("cave-menu-open", "The Cave Bash menu opened inside the scene.");
  }

  function showComplete(mode) {
    view = "complete";
    playPanel.hidden = true;
    completionPanel.hidden = false;
    menuReturn.hidden = true;
    const isStory = mode === "story";
    $("completion-title").textContent = isStory
      ? "The signal reached the cave."
      : "Three pieces of local evidence.";
    $("completion-copy").textContent = isStory
      ? "You followed the Cave Bash story from the ls directory listing to the echo hi block. Both scene cues played in this iframe."
      : "You recorded the local user, workstation name and interface sample. No external target was contacted.";
    setScene({
      kicker: isStory ? "STORY MODE / COMPLETE" : "TASK MODE / COMPLETE",
      title: isStory ? "Signal received." : "Evidence gathered.",
      copy: isStory
        ? "Mira confirms the local signal reached the cave. The sample story is complete."
        : "The local workstation evidence is recorded in this preview. The cave glows as Mira marks the task complete.",
      actions: [
        { label: "Return to Cave Bash menu →", callback: showMainMenu },
      ],
    });
    triggerCue(
      isStory ? "block-signal-sent" : "task-complete",
      isStory ? "Echo signal sent · sample story complete." : "Local evidence reviewed · sample task complete.",
    );
    publish({
      kind: "complete",
      mode,
      guidance: isStory
        ? "Story Mode complete: ls opened the Cave Bash menu, then the echo hi block sent a signal."
        : "Task Mode complete: local user, host and interface evidence are recorded.",
    });
    focusElement($("replay-activity"));
  }

  function acceptTerminalCommand(command) {
    if (activeMode === "story" && view === "story-play" && taskStepIndex === 0) {
      terminalOutput.textContent =
        "> ls\nREADME.md   cave_notes.txt\n\n[Fixed preview listing — no command executed]";
      publish({
        kind: "evidence",
        mode: "story",
        record: "ls → README.md · cave_notes.txt",
        guidance: "The local directory listing opens the Cave Bash menu. Continue Story Mode to reach the echo hi block step.",
      });
      showCaveMenuAfterLookAround();
      return;
    }

    if (activeMode !== "task" || view !== "task-play") return;
    const step = taskSteps[taskStepIndex];
    terminalOutput.textContent = `> ${command}\n${step.output}\n\n[Fixed sample output — no command executed]`;
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
    const expected =
      activeMode === "story" && view === "story-play" && taskStepIndex === 0
        ? "ls"
        : activeMode === "task" && view === "task-play"
          ? taskSteps[taskStepIndex]?.command
          : null;

    if (!expected) return;
    if (command !== expected) {
      commandFeedback.textContent = `Enter ${expected} exactly. This sample runs no other command.`;
      terminalCommand.focus();
      return;
    }
    acceptTerminalCommand(command);
    terminalCommand.value = "";
  }

  $("run-command").addEventListener("click", runCurrentTerminalCommand);
  terminalCommand.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    runCurrentTerminalCommand();
  });

  function addEchoBlock() {
    if (echoBlockAdded) return;
    echoBlockAdded = true;
    workspaceEmpty.hidden = true;
    const row = document.createElement("div");
    row.className = "block-row";
    const command = document.createElement("span");
    command.textContent = "echo";
    const argument = document.createElement("input");
    argument.id = "echo-argument";
    argument.type = "text";
    argument.value = "hi";
    argument.maxLength = 20;
    argument.autocomplete = "off";
    argument.setAttribute("aria-label", "echo block text argument");
    row.append(command, argument);
    blockWorkspace.replaceChildren(row);
    runEchoBlock.disabled = false;
    blockFeedback.textContent = "Block added. The lesson expects echo hi.";
    argument.focus();
  }

  $("add-echo-block").addEventListener("click", addEchoBlock);
  $("add-echo-block").addEventListener("dragstart", (event) => {
    if (!event.dataTransfer) return;
    event.dataTransfer.setData("text/plain", "inspector-echo-hi");
    event.dataTransfer.effectAllowed = "copy";
  });
  blockWorkspace.addEventListener("dragover", (event) => {
    event.preventDefault();
    blockWorkspace.classList.add("is-drop-target");
  });
  blockWorkspace.addEventListener("dragleave", () => {
    blockWorkspace.classList.remove("is-drop-target");
  });
  blockWorkspace.addEventListener("drop", (event) => {
    event.preventDefault();
    blockWorkspace.classList.remove("is-drop-target");
    if (event.dataTransfer?.getData("text/plain") === "inspector-echo-hi") {
      addEchoBlock();
    }
  });

  runEchoBlock.addEventListener("click", () => {
    const argument = $("echo-argument");
    if (!argument) return;
    const command = `echo ${argument.value}`;
    if (command !== "echo hi") {
      blockFeedback.textContent = "The lesson block must read echo hi exactly.";
      argument.focus();
      return;
    }
    terminalOutput.textContent =
      "> echo hi\nhi\n\n[Fixed sample output — no command executed]";
    blockFeedback.textContent = "The custom block returned the fixed sample response hi.";
    publish({
      kind: "evidence",
      mode: "story",
      record: "echo hi → hi",
      guidance: "The custom block signal reached the cave terminal and completed the Cave Bash story.",
    });
    showComplete("story");
  });

  menuReturn.addEventListener("click", showMainMenu);
  $("replay-activity").addEventListener("click", showMainMenu);
  $("reset-preview").addEventListener("click", resetPreview);

  showMainMenu();
  publish({ kind: "reset" });
})();
