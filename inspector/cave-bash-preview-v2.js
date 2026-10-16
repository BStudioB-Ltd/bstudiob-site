(() => {
  const activity = document.getElementById("activity");
  if (!activity) return;
  const scene = activity.querySelector(".scene");

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
  const storyActions = $("story-actions");
  const welcomePanel = $("welcome-panel");
  const videoPlayer = $("video-player");
  const clientLabel = $("client-label");
  const responderStatus = $("responder-status");
  const spriteActors = new Map();
  const pendingSpriteClips = new Map();
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const sceneResizeObserver = window.ResizeObserver
    ? new window.ResizeObserver(updateSpriteScales)
    : null;

  function drawSpriteFrame(actor, frame) {
    const { cell, source } = actor.pose;
    const scale = actor.scale;
    actor.currentFrame = frame;
    actor.node.style.width = `${cell.width * scale}px`;
    actor.node.style.height = `${cell.height * scale}px`;
    actor.node.style.backgroundSize = `${source.width * scale}px ${source.height * scale}px`;
    actor.node.style.backgroundPosition = `${-frame.x * scale}px ${-frame.y * scale}px`;
  }

  function playSpriteClip(actor, requestedClip, requestedDirection) {
    if (!actor) return;
    const hasClip = (directionName, clipName) => (
      actor.pose.directions[directionName]?.[clipName]?.length
      && actor.pose.clips[clipName]
    );
    let directionName = requestedDirection || actor.direction || "down";
    if (!hasClip(directionName, requestedClip) && hasClip("down", requestedClip)) {
      directionName = "down";
    }
    if (!hasClip(directionName, requestedClip) && !hasClip(directionName, "idle")) {
      directionName = "down";
    }
    const direction = actor.pose.directions[directionName];
    const clipName = hasClip(directionName, requestedClip) ? requestedClip : "idle";
    const frames = direction[clipName];
    const clip = actor.pose.clips[clipName];
    if (!frames?.length || !clip) return;

    window.clearTimeout(actor.timer);
    const sequence = ++actor.sequence;
    actor.direction = directionName;
    actor.clipName = clipName;
    let frameIndex = 0;
    drawSpriteFrame(actor, frames[frameIndex]);

    if (reducedMotion?.matches) return;
    const advance = () => {
      if (sequence !== actor.sequence) return;
      if (clip.loopMode === "loop") {
        frameIndex = (frameIndex + 1) % frames.length;
      } else if (frameIndex + 1 < frames.length) {
        frameIndex += 1;
      } else {
        if (clipName !== "idle") playSpriteClip(actor, "idle");
        return;
      }
      drawSpriteFrame(actor, frames[frameIndex]);
      actor.timer = window.setTimeout(advance, clip.frameDurationMs);
    };

    actor.timer = window.setTimeout(advance, clip.frameDurationMs);
  }

  function setSpriteClip(actorId, clipName, direction = "down") {
    pendingSpriteClips.set(actorId, { clipName, direction });
    playSpriteClip(spriteActors.get(actorId), clipName, direction);
  }

  function sceneScaleFactor() {
    return Math.min(1, Math.max(0.25, scene.clientWidth / 700));
  }

  function updateSpriteScales() {
    const scaleFactor = sceneScaleFactor();
    for (const actor of spriteActors.values()) {
      actor.scale = actor.baseScale * scaleFactor;
      if (actor.currentFrame) drawSpriteFrame(actor, actor.currentFrame);
    }
  }

  const spriteMapLoads = new Map();
  const spriteMapRequests = new Map();
  let spriteRequestSequence = 0;

  window.addEventListener("message", (message) => {
    if (message.source !== window.parent) return;
    const packet = message.data;
    if (
      !packet || packet.type !== "inspector-edu-sprite-map" ||
      packet.version !== 1 || packet.kind !== "result"
    ) return;
    const request = spriteMapRequests.get(packet.requestId);
    if (!request || packet.character !== request.character || !packet.map?.poses) return;
    window.clearInterval(request.retry);
    spriteMapRequests.delete(packet.requestId);
    request.resolve(packet.map);
  });

  function loadSpriteMap(character, mapUrl) {
    if (spriteMapLoads.has(character)) return spriteMapLoads.get(character);
    const pendingMap = window.parent === window
      ? fetch(mapUrl).then((response) => {
        if (!response.ok) throw new Error("Sprite map unavailable");
        return response.json();
      })
      : new Promise((resolve, reject) => {
        const requestId = `sprite-${++spriteRequestSequence}`;
        let attempts = 0;
        const request = {
          character,
          resolve,
          retry: 0,
        };
        const send = () => {
          if (++attempts > 40) {
            window.clearInterval(request.retry);
            spriteMapRequests.delete(requestId);
            reject(new Error("Sprite map bridge unavailable"));
            return;
          }
          // Retry covers a parent defer script that starts after this frame.
          window.parent.postMessage({
            type: "inspector-edu-sprite-map",
            version: 1,
            kind: "request",
            requestId,
            character,
          }, "*");
        };
        spriteMapRequests.set(requestId, request);
        request.retry = window.setInterval(send, 250);
        send();
      });
    spriteMapLoads.set(character, pendingMap);
    return pendingMap;
  }

  async function loadSpriteActor(node) {
    const character = node.dataset.spriteCharacter;
    const poseName = node.dataset.spritePose;
    const actorId = node.dataset.spriteActor;
    const mapUrl = new URL(`assets/preview-sprites/${character}/sprite-map.json`, document.baseURI);
    try {
      const map = await loadSpriteMap(character, mapUrl);
      const pose = map.poses[poseName];
      if (!pose) throw new Error("Sprite pose unavailable");
      node.style.backgroundImage = `url("${new URL(pose.sheet, mapUrl).href}")`;
      const actor = {
        node,
        pose,
        baseScale: Number(node.dataset.spriteScale) || 1,
        scale: (Number(node.dataset.spriteScale) || 1) * sceneScaleFactor(),
        sequence: 0,
        timer: 0,
        direction: "down",
        clipName: "idle",
      };
      spriteActors.set(actorId, actor);
      const pendingClip = pendingSpriteClips.get(actorId) || { clipName: "idle", direction: "down" };
      playSpriteClip(actor, pendingClip.clipName, pendingClip.direction);
    } catch {
      node.hidden = true;
    }
  }

  function loadSceneSprites() {
    if (sceneResizeObserver) {
      sceneResizeObserver.observe(scene);
    } else {
      window.addEventListener("resize", updateSpriteScales);
    }
    document.querySelectorAll("[data-sprite-actor]").forEach((node) => {
      loadSpriteActor(node);
    });
  }

  function syncReducedMotion(event) {
    for (const actor of spriteActors.values()) {
      if (event.matches) {
        window.clearTimeout(actor.timer);
        actor.sequence += 1;
        const frames = actor.pose.directions[actor.direction]?.[actor.clipName];
        if (frames?.length) drawSpriteFrame(actor, frames[0]);
      } else {
        playSpriteClip(actor, actor.clipName);
      }
    }
  }

  if (reducedMotion?.addEventListener) {
    reducedMotion.addEventListener("change", syncReducedMotion);
  } else if (reducedMotion?.addListener) {
    reducedMotion.addListener(syncReducedMotion);
  }

  function setRespondersClip(clipName, direction = "down") {
    setSpriteClip("responder-left", clipName, direction);
    setSpriteClip("responder-right", clipName, direction);
  }

  function resetSceneSprites() {
    activity.dataset.trafficFound = "false";
    setSpriteClip("mira", "idle");
    setSpriteClip("barista", "idle");
    setSpriteClip("suspect", "idle");
    setSpriteClip("suspect-escort", "idle");
    setRespondersClip("idle");
  }

  function animateSceneCue(cue) {
    if (cue === "story-traffic-spotted") {
      activity.dataset.trafficFound = "true";
      setSpriteClip("mira", "investigate");
      setSpriteClip("barista", "investigate");
      setSpriteClip("suspect", "investigate");
    } else if (cue === "story-client-disconnected") {
      setSpriteClip("mira", "alert");
      setSpriteClip("barista", "investigate");
      setSpriteClip("suspect", "alert");
    } else if (["story-client-rejoined", "story-welcome-shown"].includes(cue)) {
      setSpriteClip("mira", "investigate");
      setSpriteClip("barista", "interact");
      setSpriteClip("suspect", "investigate");
    } else if (cue === "story-rickroll-played") {
      setSpriteClip("mira", "alert");
      setSpriteClip("barista", "investigate");
      setSpriteClip("suspect", "alert");
    } else if (cue === "story-fbi-arrived") {
      setSpriteClip("mira", "alert");
      setSpriteClip("barista", "investigate");
      setSpriteClip("suspect", "alert");
      setRespondersClip("walk", "left");
      window.setTimeout(() => {
        if (activity.dataset.storyBeat === "fbi") setRespondersClip("idle", "down");
      }, 1100);
    } else if (cue === "story-hacker-escorted") {
      setRespondersClip("walk", "right");
      setSpriteClip("suspect-escort", "walk", "right");
      window.setTimeout(() => {
        if (activity.dataset.storyBeat === "escorted") {
          setRespondersClip("idle", "right");
          setSpriteClip("suspect-escort", "idle", "right");
        }
      }, 1900);
    } else if (cue.startsWith("task-")) {
      setSpriteClip("mira", "investigate");
    }
  }

  // Story controls update only this page. Wireless actions are never executable commands.
  const storySteps = [
    {
      command: "netstat -an",
      title: "Investigate the café traffic",
      objective: "Enter netstat -an to inspect the fictional café traffic sample.",
      output: "CAFÉ TRAINING SAMPLE\nClient: cafe-client-04 · Table 04\nState: CONNECTED\nObservation: unusual traffic in this fictional sample.\nStory target: the fictional hacker at Table 04.",
      beat: "observe",
      cue: "story-traffic-spotted",
      evidence: "fictional suspicious client identified: cafe-client-04 at Table 04",
      guidance: "Mira traces the sample traffic to the fictional hacker at Table 04. The next action simulates a disconnect inside this page.",
      sceneCopy: "Mira notices unusual café traffic. Inspect the sample to trace it to the fictional hacker at Table 04.",
      signal: "Fictional café traffic · no live connection inspected.",
      client: "TABLE 04 · CONNECTED",
    },
    {
      action: "Simulate deauthentication →",
      title: "Disconnect the fictional client",
      objective: "Simulate deauthentication: mark cafe-client-04 disconnected in this page. No wireless signal is sent.",
      output: "SIMULATED DEAUTHENTICATION\ncafe-client-04 → DISCONNECTED\nOnly the fictional scene state changed. No radio or network action occurred.",
      beat: "identified",
      cue: "story-client-disconnected",
      evidence: "simulated deauthentication: cafe-client-04 disconnected locally",
      guidance: "The fictional client is disconnected. Deauthentication here is a scene action only; no wireless command or signal is sent.",
      sceneCopy: "The sample identifies the hacker at Table 04. Mira prepares a fictional disconnect so the client will rejoin the café network.",
      signal: "Table 04 traced · simulation controls only.",
      client: "TABLE 04 · HACKER IDENTIFIED",
    },
    {
      action: "Let the client rejoin →",
      title: "Wait for the client to rejoin",
      objective: "Let cafe-client-04 rejoin the fictional café network. This updates the local story state.",
      output: "SIMULATED REJOIN\ncafe-client-04 → CONNECTED\nThe fictional café welcome page is ready. No real client was contacted.",
      beat: "disconnected",
      cue: "story-client-rejoined",
      evidence: "fictional client rejoined; welcome page ready",
      guidance: "The fictional hacker rejoins the café network. Next, show the in-page welcome screen; no captive portal is created.",
      sceneCopy: "Table 04 goes offline in the simulation. The hacker notices the disconnect and tries to rejoin the fictional café network.",
      signal: "Table 04 disconnected · local simulation.",
      client: "TABLE 04 · DISCONNECTED",
    },
    {
      action: "Show the welcome page →",
      title: "Open the fictional welcome page",
      objective: "Show the café welcome page inside this preview. It redirects no real device and requests no credentials.",
      output: "FICTIONAL WELCOME PAGE\nShown to cafe-client-04 in the story.\nRickroll ready · press Play to load the third-party YouTube video.",
      beat: "rejoined",
      cue: "story-welcome-shown",
      evidence: "in-page welcome screen shown; video has not loaded",
      guidance: "The fictional welcome page is visible. Play explicitly loads Rick Astley’s official video from YouTube; all network story actions remain simulated.",
      sceneCopy: "The hacker rejoins. Mira shows a playful café welcome screen inside the training scene, with a Rickroll ready to reveal his table.",
      signal: "Table 04 rejoined · fictional welcome page ready.",
      client: "TABLE 04 · REJOINED",
    },
    {
      action: "Play the Rickroll on YouTube →",
      title: "Play the welcome-page Rickroll",
      objective: "Click Play to load the official Rick Astley video from third-party YouTube. The fictional hacker’s table is revealed in the scene.",
      output: "USER-STARTED VIDEO\nYouTube player requested after your Play click.\nStory: music at Table 04 reveals the fictional hacker.\nLOCAL FICTIONAL FBI ALERT: the Rickroll alerts the agents in the story.\nNo alert was sent and no agency was contacted.\nPlayback depends on YouTube availability; the story can continue.",
      beat: "welcome",
      cue: "story-rickroll-played",
      evidence: "Play clicked; Rickroll player requested; fictional music revealed Table 04 and triggered a local story FBI alert",
      guidance: "Your Play click requested the third-party YouTube player. In the story, the Rickroll reveals Table 04 and triggers a fictional FBI alert locally. No alert is sent. Continue to see the agents arrive.",
      sceneCopy: "The fictional welcome page is open. Start the Rickroll: in the story, music rings out from the hacker’s table.",
      signal: "Welcome screen visible · video awaits your click.",
      client: "TABLE 04 · WELCOME PAGE",
    },
    {
      action: "Continue to the FBI arrival →",
      title: "The Rickroll triggers a fictional FBI alert",
      objective: "Continue the fictional story to see the FBI arrive. This sends no alert and contacts no agency.",
      output: "FICTIONAL FBI ARRIVAL\nAgents arrive at the café in the story.\nNo external alert, report or agency contact occurred.",
      beat: "music",
      cue: "story-fbi-arrived",
      evidence: "fictional FBI arrived in the scene; no alert sent",
      guidance: "The FBI have arrived in the fictional scene. Finish the story to see the hacker escorted away. No agency was contacted.",
      sceneCopy: "The Rickroll reveals Table 04 and triggers a fictional FBI alert inside this scene. No message leaves the page. Continue to see the agents arrive.",
      signal: "Rickroll → local fictional FBI alert · nothing sent.",
      client: "TABLE 04 · ♪ RICKROLL ♪",
    },
    {
      action: "See the hacker taken away →",
      title: "The FBI arrive at the café",
      objective: "Finish the fictional scene: the agents escort the hacker away. No real enforcement action occurs.",
      output: "MISSION COMPLETE\nThe fictional FBI escort the hacker away from Table 04.\nAll investigation, disconnect, rejoin and enforcement actions were simulated locally.",
      beat: "fbi",
      cue: "story-hacker-escorted",
      evidence: "fictional hacker escorted away; mission complete",
      guidance: "Mission complete: sample traffic traced, disconnect and rejoin simulated, welcome Rickroll started, and fictional FBI ending shown.",
      sceneCopy: "The fictional FBI enter the café and approach Table 04. Finish the scene to see them take the hacker away.",
      signal: "FBI at Table 04 · fictional story ending.",
      client: "TABLE 04 · FBI PRESENT",
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
    animateSceneCue(cue);
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
    storyStepIndex = 0;
    taskStepIndex = 0;
    activity.dataset.storyProgress = "0";
    activity.dataset.storyBeat = "idle";
    cueSequence += 1;
    activity.dataset.cue = "idle";
    resetSceneSprites();
    sceneSignal.textContent = "The cave is quiet.";
    videoPlayer.replaceChildren();
    menuReturn.hidden = true;
    selectionPanel.hidden = false;
    playPanel.hidden = true;
    completionPanel.hidden = true;
    storyActions.hidden = true;
    welcomePanel.hidden = true;
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
    storyActions.hidden = true;
    welcomePanel.hidden = true;
    setSelection(
      "Story Mode / Mira’s Coffee Shop Recon",
      "Trace fictional café traffic, simulate a disconnect and rejoin, play the welcome-page Rickroll, then see the fictional FBI take the hacker away.",
    );
    setScene({
      kicker: "STORY MODE / SELECT A STORY",
      title: "Mira: Coffee Shop Recon",
      copy: "Mission: Trace the Hacker. Follow Mira through the fictional café investigation, welcome-page Rickroll and FBI ending. Every wireless and enforcement action is simulated locally.",
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
    storyActions.hidden = true;
    welcomePanel.hidden = true;
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
    storyActions.hidden = true;
    welcomePanel.hidden = true;
    terminalForm.hidden = false;
    modeLabel.textContent = "STORY MODE / MIRA: COFFEE SHOP RECON";

    const step = storySteps[storyStepIndex];
    activity.dataset.storyBeat = step.beat;
    clientLabel.textContent = step.client;
    responderStatus.textContent = "AGENTS AT TABLE 04";
    activityTitle.textContent = step.title;
    activityObjective.textContent = step.objective;
    terminalForm.hidden = !step.command;
    terminalCommand.value = "";
    if (step.command) {
      terminalPrompt.textContent = `Enter ${step.command} for this fixed sample`;
      terminalCommand.placeholder = step.command;
      commandFeedback.textContent = `Only ${step.command} is accepted for this step.`;
    } else {
      storyActions.hidden = false;
      storyActions.replaceChildren(actionButton(step.action, () => {
        if (view !== "story-play" || storySteps[storyStepIndex] !== step) return;
        if (step.beat === "welcome") loadRickroll();
        recordStoryStep(step);
      }));
      commandFeedback.textContent = step.beat === "welcome"
        ? "Play loads third-party YouTube after your click; the network story stays simulated."
        : "Use the story action below. Only the fictional page state changes.";
    }
    welcomePanel.hidden = !["welcome", "music"].includes(step.beat);
    if (welcomePanel.hidden) videoPlayer.replaceChildren();
    renderProgress(storySteps.length, storyStepIndex);
    setPlayScene(
      `STORY MODE / BEAT ${storyStepIndex + 1} OF ${storySteps.length}`,
      step.title,
      step.sceneCopy,
      step.signal,
    );
    focusElement(step.command ? terminalCommand : storyActions.querySelector("button"));
  }

  function loadRickroll() {
    // Created only in the explicit Play button handler; never preloaded or embedded at startup.
    const player = document.createElement("iframe");
    player.src = "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1";
    player.title = "Rick Astley — Never Gonna Give You Up (official YouTube video)";
    player.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    player.referrerPolicy = "strict-origin-when-cross-origin";
    player.allowFullscreen = true;
    videoPlayer.replaceChildren(player);
  }

  function startStory() {
    storyStepIndex = 0;
    resetSceneSprites();
    terminalOutput.textContent =
      "Mira: Coffee Shop Recon\nFictional local-only training sample.\nNo command has run.";
    videoPlayer.replaceChildren();
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
    storyActions.hidden = true;
    welcomePanel.hidden = true;
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
    videoPlayer.replaceChildren();
    activity.dataset.storyBeat = "idle";
    terminalOutput.textContent =
      "Task 01: Information Gathering\n\n[Local workstation sample only]";
    commandFeedback.textContent = "Only the displayed sample command is accepted.";
    publish({ kind: "reset" });
    showTaskStep();
  }

  function showComplete(mode) {
    view = "complete";
    playPanel.hidden = true;
    storyActions.hidden = true;
    welcomePanel.hidden = true;
    completionPanel.hidden = false;
    menuReturn.hidden = true;
    const isStory = mode === "story";
    videoPlayer.replaceChildren();
    if (isStory) {
      activity.dataset.storyBeat = "escorted";
      clientLabel.textContent = "TABLE 04 · HACKER TAKEN AWAY";
      responderStatus.textContent = "HACKER ESCORTED AWAY";
    }
    $("completion-title").textContent = isStory
      ? "Coffee Shop Recon complete"
      : "Three pieces of local evidence";
    $("completion-copy").textContent = isStory
      ? "You traced the fictional hacker, simulated a disconnect and rejoin, opened the welcome page and requested the Rickroll player. The fictional FBI arrived and took the hacker away. Only your Play click requested third-party YouTube; all story actions stayed local."
      : "You recorded the local user, workstation name and interface sample. No external target was contacted.";
    setScene({
      kicker: isStory ? "STORY MODE / COMPLETE" : "TASK MODE / COMPLETE",
      title: isStory ? "Mission: Trace the Hacker — complete." : "Evidence gathered.",
      copy: isStory
        ? "The FBI escort the fictional hacker away from Table 04. Mira’s café mission is complete. No real client, agency or enforcement action was involved."
        : "The local workstation evidence is recorded in this preview. Mira marks the task complete.",
      actions: [
        { label: "Return to Cave Bash menu →", callback: showMainMenu },
      ],
    });
    triggerCue(
      isStory ? "story-hacker-escorted" : "task-complete",
      isStory
        ? "Fictional hacker taken away · mission complete."
        : "Local evidence reviewed · sample task complete.",
    );
    publish({
      kind: "complete",
      mode,
      guidance: isStory
        ? "Mira’s mission is complete: fictional traffic traced, disconnect and rejoin simulated, welcome Rickroll requested, and FBI escort shown. No real network or enforcement action occurred."
        : "Task Mode complete: local user, host and interface evidence are recorded.",
    });
    focusElement($("replay-activity"));
  }

  function recordStoryStep(step) {
    terminalOutput.textContent = `> ${step.command || step.action}\n${step.output}\n\n[Fixed story sample — no network or shell action executed]`;
    commandFeedback.textContent =
      "Sample evidence recorded. Mira responds in the coffee shop scene.";
    publish({
      kind: "evidence",
      mode: "story",
      record: step.command ? `${step.command} → ${step.evidence}` : step.evidence,
      guidance: step.guidance,
      video: step.beat === "welcome" ? "rickroll-requested" : undefined,
    });
    storyStepIndex += 1;
    activity.dataset.storyProgress = String(storyStepIndex);

    if (storyStepIndex >= storySteps.length) {
      showComplete("story");
    } else {
      showStoryStep();
      triggerCue(step.cue, sceneSignal.textContent);
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

  menuReturn.addEventListener("click", showMainMenu);
  $("replay-activity").addEventListener("click", showMainMenu);
  $("reset-preview").addEventListener("click", resetPreview);

  loadSceneSprites();
  showMainMenu();
  publish({ kind: "reset" });
})();
