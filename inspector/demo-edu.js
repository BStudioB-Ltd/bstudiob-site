(() => {
  const root = document.getElementById("edu-demo");
  if (!root) return;
  const $ = (id) => root.querySelector(`#${id}`);
  const steps = [
    {
      command: "whoami",
      title: "Identify the sandbox user",
      output: "learner",
      expected:
        "A short username. It identifies the account associated with activity in the lab.",
      safety: "Do not query external identity services or install extra tools.",
    },
    {
      command: "hostname",
      title: "Label the sandbox host",
      output: "learner-workstation",
      expected:
        "A single host or container name. It ties your notes to the local workstation.",
      safety: "Do not scan for other hosts or public network names.",
    },
    {
      command: "ip addr",
      title: "Inspect local interfaces",
      output:
        "1: lo: <LOOPBACK,UP>\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,UP>\n    link/ether 02:42:ac:12:00:02\n    inet 172.18.0.2/16 scope global eth0",
      expected:
        "Interface records such as lo, eth0, inet and link-layer details. These describe the local network surfaces.",
      safety: "Do not run scans or external requests after listing interfaces.",
    },
  ];
  let stage = "entry";
  let step = 0;
  const feedback = (text) => {
    $("edu-feedback").textContent = text;
  };
  function taskStep() {
    const current = steps[step];
    $("edu-stage").textContent = `Task 01 / evidence ${step + 1} of 3`;
    $("edu-prompt").textContent = current.title;
    $("edu-objective").textContent = `Type ${current.command}.`;
    $("edu-command").placeholder = current.command;
    $("edu-expected").textContent = current.expected;
    $("edu-safety").textContent =
      `Real lesson safety: ${current.safety} This preview runs nothing.`;
    $("edu-command-form").hidden = false;
  }
  function reset() {
    stage = "entry";
    step = 0;
    $("edu-stage").textContent = "Cave entry / 00";
    $("edu-prompt").textContent = "A terminal glows in the cave.";
    $("edu-objective").textContent = "Type ls.";
    $("edu-command").value = "";
    $("edu-command").placeholder = "ls";
    $("edu-menu").hidden = true;
    $("edu-task-choice").hidden = true;
    $("edu-command-form").hidden = false;
    $("edu-output").textContent = "Awaiting sample command…";
    $("edu-evidence").replaceChildren(
      Object.assign(document.createElement("li"), {
        textContent: "No evidence collected yet.",
      }),
    );
    $("edu-expected").textContent =
      "A directory listing opens the Cave Bash menu.";
    $("edu-safety").textContent =
      "In the real lesson, work only inside an authorised learning environment. Do not probe public IPs or domains.";
    feedback("Only the displayed lesson command is accepted.");
  }
  $("edu-command-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const command = $("edu-command").value;
    const expected =
      stage === "entry" ? "ls" : stage === "task" ? steps[step].command : null;
    if (command !== expected) {
      feedback(
        `Use ${expected || "the menu"} exactly. This simulation accepts only the displayed sample command.`,
      );
      return;
    }
    $("edu-command").value = "";
    if (stage === "entry") {
      stage = "menu";
      $("edu-output").textContent =
        "> ls\nStory Mode   Task Mode\nInspector Online   Options\n\n[Fixed preview listing]";
      $("edu-stage").textContent = "Cave menu / 01";
      $("edu-prompt").textContent = "Choose a learning mode.";
      $("edu-objective").textContent =
        "Open Task Mode to follow the information-gathering preview.";
      $("edu-command-form").hidden = true;
      $("edu-menu").hidden = false;
      feedback("The cave menu is open. No command was run.");
      root.querySelector('[data-mode="task"]').focus();
      return;
    }
    const evidence = document.createElement("li");
    evidence.textContent = `${steps[step].command} → ${step === 2 ? "Local interface sample recorded" : steps[step].output} (fixed sample)`;
    if (step === 0) $("edu-evidence").replaceChildren();
    $("edu-evidence").append(evidence);
    $("edu-output").textContent =
      `> ${command}\n${steps[step].output}\n\n[Fixed sample output — no command executed]`;
    step++;
    if (step < steps.length) {
      taskStep();
      feedback(
        "Sample evidence recorded. Continue with the next displayed command.",
      );
    } else {
      stage = "complete";
      $("edu-stage").textContent = "Task 01 / sample complete";
      $("edu-prompt").textContent = "Three pieces of local evidence.";
      $("edu-objective").textContent =
        "User, host and interface evidence collected in this simulation.";
      $("edu-command-form").hidden = true;
      $("edu-expected").textContent =
        "The real task connects identity, host and interfaces without touching an external target.";
      feedback(
        "Preview complete. No learner progress was saved. Reset to begin again.",
      );
      $("edu-reset").focus();
    }
  });
  root.querySelectorAll("[data-mode]").forEach((button) =>
    button.addEventListener("click", () => {
      $("edu-task-choice").hidden = button.dataset.mode !== "task";
      if (button.dataset.mode === "task") {
        $("edu-prompt").textContent = "Task Mode";
        $("edu-objective").textContent = "Open the first bounded task.";
        feedback("Task 01 is available as a sample preview.");
        $("edu-open-task").focus();
      } else {
        $("edu-prompt").textContent = button.textContent;
        $("edu-objective").textContent =
          `${button.textContent} is shown in the real Cave Bash menu. This compact preview covers Task 01; select Task Mode to continue.`;
        feedback("Menu preview only. No account or app was opened.");
      }
    }),
  );
  $("edu-open-task").addEventListener("click", () => {
    stage = "task";
    step = 0;
    $("edu-menu").hidden = true;
    $("edu-task-choice").hidden = true;
    $("edu-output").textContent =
      "Task 01: Information Gathering\n\n[Sample local workstation — no sandbox launched]";
    taskStep();
    feedback("Task 01: Information Gathering. Begin with whoami.");
    $("edu-command").focus();
  });
  $("edu-reset").addEventListener("click", () => {
    reset();
    $("edu-command").focus();
  });
})();
