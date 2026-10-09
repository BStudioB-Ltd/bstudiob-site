(() => {
  const root = document.getElementById("pro-demo");
  if (!root) return;
  const $ = (id) => root.querySelector(`#${id}`);
  const makeNode = (id, name, x, y) => ({
    id,
    name,
    kind: "linux",
    image: "alpine:3.20",
    properties: { exec: [], env: {}, binds: [] },
    ui: { position: { x, y }, color: null, icon: null },
    configurableFields: ["name", "kind", "image", "exec", "env", "binds"],
  });
  const initial = () => ({
    name: "inspector-preview",
    nodes: [
      makeNode("router", "Lab router", 23, 35),
      makeNode("workstation", "Workstation", 72, 35),
      makeNode("service", "Local service", 49, 73),
    ],
    links: [
      makeLink(
        "link-router-workstation",
        "router",
        "eth0",
        "workstation",
        "eth0",
      ),
      makeLink("link-router-service", "router", "eth1", "service", "eth0"),
    ],
  });
  function makeLink(id, source, sourceInterface, target, targetInterface) {
    return {
      id,
      source: { deviceId: source, interface: sourceInterface },
      target: { deviceId: target, interface: targetInterface },
      link_type: null,
      link_params: {},
    };
  }
  let topology = initial();
  let selected = topology.nodes[0].id;
  let editingLink = null;
  let sequence = 0;
  const status = (text) => {
    $("pro-status").textContent = text;
  };
  const invalidate = (message) => {
    $("pro-errors").replaceChildren();
    status(message || "Sample changed. Check structure again.");
  };
  const selectedNode = () =>
    topology.nodes.find((node) => node.id === selected);
  const lines = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  function selectNode(id) {
    selected = id;
    root
      .querySelectorAll(".device")
      .forEach((button) =>
        button.setAttribute(
          "aria-pressed",
          String(button.dataset.id === selected),
        ),
      );
    const node = selectedNode();
    $("node-fields").disabled = !node;
    $("node-id").textContent = node
      ? `ID / ${node.id}`
      : "No devices / add one to begin";
    $("node-error").textContent = "";
    $("node-env").removeAttribute("aria-invalid");
    for (const field of ["name", "kind", "image"])
      $(`node-${field}`).value = node ? node[field] : "";
    $("node-exec").value = node ? node.properties.exec.join("\n") : "";
    $("node-env").value = node
      ? JSON.stringify(node.properties.env, null, 2)
      : "{}";
    $("node-binds").value = node ? node.properties.binds.join("\n") : "";
    $("node-x").value = node ? Math.round(node.ui.position.x) : "";
    $("node-y").value = node ? Math.round(node.ui.position.y) : "";
  }
  function drawLines() {
    $("topology-links").replaceChildren();
    for (const link of topology.links) {
      const source = topology.nodes.find(
        (node) => node.id === link.source.deviceId,
      );
      const target = topology.nodes.find(
        (node) => node.id === link.target.deviceId,
      );
      if (!source || !target) continue;
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      for (const [key, value] of Object.entries({
        x1: source.ui.position.x * 10,
        y1: source.ui.position.y * 10,
        x2: target.ui.position.x * 10,
        y2: target.ui.position.y * 10,
      }))
        line.setAttribute(key, value);
      $("topology-links").append(line);
    }
  }
  // Reserve room for each card and its 3px outline + 3px outline offset.
  function boundedPosition(button, x, y) {
    const canvas = $("topology-canvas");
    if (!canvas.clientWidth || !canvas.clientHeight) return { x, y };
    const insetX = ((button.offsetWidth / 2 + 8) / canvas.clientWidth) * 100;
    const insetY = ((button.offsetHeight / 2 + 8) / canvas.clientHeight) * 100;
    return {
      x: clamp(x, Math.max(12, insetX), Math.min(88, 100 - insetX)),
      y: clamp(y, Math.max(15, insetY), Math.min(85, 100 - insetY)),
    };
  }
  function containCards() {
    root.querySelectorAll(".device").forEach((button) => {
      const node = topology.nodes.find((item) => item.id === button.dataset.id);
      if (!node) return;
      const position = boundedPosition(
        button,
        node.ui.position.x,
        node.ui.position.y,
      );
      const changed =
        position.x !== node.ui.position.x || position.y !== node.ui.position.y;
      node.ui.position = position;
      button.style.left = `${position.x}%`;
      button.style.top = `${position.y}%`;
      if (changed && node.id === selected) {
        $("node-x").value = Math.round(position.x);
        $("node-y").value = Math.round(position.y);
      }
    });
    drawLines();
  }
  function moveNode(node, button, x, y) {
    node.ui.position = boundedPosition(button, x, y);
    button.style.left = `${node.ui.position.x}%`;
    button.style.top = `${node.ui.position.y}%`;
    $("node-x").value = Math.round(node.ui.position.x);
    $("node-y").value = Math.round(node.ui.position.y);
    drawLines();
    invalidate("Device position changed in the local sample.");
  }
  function drawNodes() {
    $("topology-nodes").replaceChildren();
    topology.nodes.forEach((node) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "device";
      button.dataset.id = node.id;
      button.style.left = `${node.ui.position.x}%`;
      button.style.top = `${node.ui.position.y}%`;
      button.setAttribute("aria-pressed", String(node.id === selected));
      button.setAttribute(
        "aria-label",
        `Select ${node.name || node.id}; arrow keys move device`,
      );
      for (const [tag, value] of [
        ["span", node.id],
        ["strong", node.name || "(name missing)"],
        ["span", node.kind || "(kind missing)"],
      ])
        button.append(
          Object.assign(document.createElement(tag), { textContent: value }),
        );
      button.addEventListener("click", () => selectNode(node.id));
      button.addEventListener("keydown", (event) => {
        const directions = {
          ArrowLeft: [-2, 0],
          ArrowRight: [2, 0],
          ArrowUp: [0, -2],
          ArrowDown: [0, 2],
        };
        if (!directions[event.key]) return;
        event.preventDefault();
        if (selected !== node.id) selectNode(node.id);
        const [dx, dy] = directions[event.key];
        moveNode(
          node,
          button,
          node.ui.position.x + dx,
          node.ui.position.y + dy,
        );
      });
      let dragging = false;
      let offset = { x: 0, y: 0 };
      button.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        selectNode(node.id);
        button.focus();
        const rect = $("topology-canvas").getBoundingClientRect();
        offset = {
          x:
            ((event.clientX - rect.left) / rect.width) * 100 -
            node.ui.position.x,
          y:
            ((event.clientY - rect.top) / rect.height) * 100 -
            node.ui.position.y,
        };
        dragging = true;
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        const rect = $("topology-canvas").getBoundingClientRect();
        moveNode(
          node,
          button,
          ((event.clientX - rect.left) / rect.width) * 100 - offset.x,
          ((event.clientY - rect.top) / rect.height) * 100 - offset.y,
        );
      });
      const endDrag = () => {
        dragging = false;
      };
      button.addEventListener("pointerup", endDrag);
      button.addEventListener("pointercancel", endDrag);
      $("topology-nodes").append(button);
    });
    containCards();
  }
  function fillLinkSelects() {
    for (const field of ["source", "target"]) {
      const select = $(`link-${field}`);
      const value = select.value;
      select.replaceChildren();
      topology.nodes.forEach((node) => {
        const option = document.createElement("option");
        option.value = node.id;
        option.textContent = `${node.name || "(unnamed)"} / ${node.id}`;
        select.append(option);
      });
      if (topology.nodes.some((node) => node.id === value))
        select.value = value;
    }
  }
  function newLink() {
    editingLink = null;
    $("link-form-title").textContent = "Create ordinary link";
    $("link-submit").textContent = "Create link";
    $("link-interface-fields").hidden = true;
    $("link-new").hidden = true;
    $("link-error").textContent = "";
    if (
      topology.nodes.length > 1 &&
      $("link-source").value === $("link-target").value
    )
      $("link-target").value = topology.nodes.find(
        (node) => node.id !== $("link-source").value,
      ).id;
  }
  function drawLinks() {
    $("link-list").replaceChildren();
    if (!topology.links.length)
      $("link-list").append(
        Object.assign(document.createElement("li"), {
          textContent: "No links in this sample.",
        }),
      );
    topology.links.forEach((link, index) => {
      const li = document.createElement("li");
      const edit = document.createElement("button");
      const remove = document.createElement("button");
      edit.type = remove.type = "button";
      edit.textContent = `${link.source.deviceId}:${link.source.interface} → ${link.target.deviceId}:${link.target.interface}`;
      edit.setAttribute("aria-label", `Edit link ${edit.textContent}`);
      edit.addEventListener("click", () => {
        editingLink = index;
        $("link-form-title").textContent = "Edit link endpoints";
        $("link-submit").textContent = "Apply link";
        $("link-interface-fields").hidden = false;
        $("link-new").hidden = false;
        for (const field of ["source", "target"]) {
          $(`link-${field}`).value = link[field].deviceId;
          $(`link-${field}-interface`).value = link[field].interface;
        }
        $("link-error").textContent = "";
        $("link-source").focus();
      });
      remove.textContent = "×";
      remove.setAttribute("aria-label", `Remove link ${index + 1}`);
      remove.addEventListener("click", () => {
        topology.links.splice(index, 1);
        newLink();
        drawLinks();
        drawLines();
        count();
        invalidate("Link removed from the sample.");
        $("link-source").focus();
      });
      li.append(edit, remove);
      $("link-list").append(li);
    });
  }
  function count() {
    $("pro-count").textContent =
      `${topology.nodes.length} devices / ${topology.links.length} links`;
  }
  function render() {
    drawNodes();
    fillLinkSelects();
    newLink();
    drawLinks();
    selectNode(selected);
    count();
  }
  // Mirrors core/topology_utils.py validate_topology and check_interface_duplicates.
  function structuralErrors() {
    const errors = [];
    if (!topology.name) errors.push("Topology name is required.");
    if (!topology.nodes.length) {
      errors.push("At least one node is required.");
      return errors;
    }
    if (topology.nodes.length > 100)
      errors.push(
        "Topology has more than 100 nodes; the native validator treats this as a failure.",
      );
    const ids = new Set();
    topology.nodes.forEach((node, index) => {
      if (!node.id) errors.push(`Node ${index} missing id.`);
      for (const field of ["kind", "name", "image", "properties"])
        if (!node[field]) errors.push(`Node ${node.id} missing ${field}.`);
      if (ids.has(node.id)) errors.push(`Duplicate node id: ${node.id}.`);
      ids.add(node.id);
    });
    const interfaces = new Set();
    topology.links.forEach((link, index) => {
      for (const side of ["source", "target"]) {
        const endpoint = link[side];
        if (!endpoint.deviceId)
          errors.push(`Link ${index} missing ${side} deviceId.`);
        if (!endpoint.interface)
          errors.push(`Link ${index} missing ${side} interface.`);
        if (endpoint.deviceId && !ids.has(endpoint.deviceId))
          errors.push(
            `Link ${index} references non-existent ${side} device: ${endpoint.deviceId}.`,
          );
      }
      if (link.source.deviceId === link.target.deviceId)
        errors.push(`Link ${index}: Cannot create link from device to itself.`);
      for (const other of topology.links.slice(index + 1)) {
        if (
          link.source.deviceId === other.source.deviceId &&
          link.target.deviceId === other.target.deviceId &&
          link.source.interface === other.source.interface &&
          link.target.interface === other.target.interface
        ) {
          errors.push(
            `Duplicate directed link: ${link.source.deviceId}:${link.source.interface} → ${link.target.deviceId}:${link.target.interface}.`,
          );
        }
      }
      // The Python validator compares both endpoints before registering either.
      const sourceKey = `${link.source.deviceId}:${link.source.interface}`;
      const targetKey = `${link.target.deviceId}:${link.target.interface}`;
      if (interfaces.has(sourceKey))
        errors.push(`${sourceKey} already connected.`);
      if (interfaces.has(targetKey))
        errors.push(`${targetKey} already connected.`);
      interfaces.add(sourceKey);
      interfaces.add(targetKey);
    });
    return errors;
  }
  function check() {
    const errors = structuralErrors();
    $("pro-errors").replaceChildren();
    errors.forEach((text) =>
      $("pro-errors").append(
        Object.assign(document.createElement("li"), { textContent: text }),
      ),
    );
    status(
      errors.length
        ? `${errors.length} structural finding${errors.length === 1 ? "" : "s"}. Edit the record and check again.`
        : "Structure passes the preview checks. No network, IP, routing or reachability was checked.",
    );
    return !errors.length;
  }
  $("topology-name").addEventListener("input", () => {
    topology.name = $("topology-name").value;
    invalidate();
  });
  $("node-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const node = selectedNode();
    if (!node) return;
    let env;
    try {
      env = JSON.parse($("node-env").value);
      if (
        !env ||
        Array.isArray(env) ||
        typeof env !== "object" ||
        Object.values(env).some((value) => typeof value !== "string")
      )
        throw new Error();
    } catch {
      $("node-error").textContent =
        'Env must be a JSON object with string values, for example {"MODE":"sample"}. Changes were not applied.';
      $("node-env").setAttribute("aria-invalid", "true");
      $("node-env").focus();
      return;
    }
    const x = $("node-x").valueAsNumber;
    const y = $("node-y").valueAsNumber;
    if (
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      x < 12 ||
      x > 88 ||
      y < 15 ||
      y > 85
    ) {
      $("node-error").textContent =
        "Use a position X from 12–88 and Y from 15–85.";
      return;
    }
    $("node-env").removeAttribute("aria-invalid");
    for (const field of ["name", "kind", "image"])
      node[field] = $(`node-${field}`).value;
    node.properties = {
      exec: lines($("node-exec").value),
      env,
      binds: lines($("node-binds").value),
    };
    node.ui.position = { x, y };
    render();
    invalidate(
      "Device edits applied to the sample. Check structure to inspect required fields.",
    );
  });
  $("pro-add").addEventListener("click", () => {
    let id;
    do {
      id = `device-${++sequence}`;
    } while (topology.nodes.some((node) => node.id === id));
    topology.nodes.push(
      makeNode(
        id,
        `Device ${sequence}`,
        45 + (sequence % 4) * 5,
        45 + (sequence % 3) * 8,
      ),
    );
    selected = id;
    render();
    invalidate("Device added to the local sample.");
    $("node-name").focus();
  });
  $("pro-remove-node").addEventListener("click", () => {
    topology.nodes = topology.nodes.filter((node) => node.id !== selected);
    topology.links = topology.links.filter(
      (link) =>
        link.source.deviceId !== selected && link.target.deviceId !== selected,
    );
    selected = topology.nodes[0]?.id || null;
    render();
    invalidate("Device and its connected links removed from the sample.");
    $("pro-add").focus();
  });
  function nextInterface(id) {
    const used = new Set(
      topology.links
        .flatMap((link) => [link.source, link.target])
        .filter((endpoint) => endpoint.deviceId === id)
        .map((endpoint) => endpoint.interface),
    );
    let number = 0;
    while (used.has(`eth${number}`)) number++;
    return `eth${number}`;
  }
  $("link-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const source = $("link-source").value;
    const target = $("link-target").value;
    if (!source || !target) {
      $("link-error").textContent =
        "Add at least two devices before creating a link.";
      return;
    }
    if (editingLink === null && source === target) {
      $("link-error").textContent =
        "Choose two different devices. A link cannot connect a device to itself.";
      return;
    }
    if (editingLink === null)
      topology.links.push(
        makeLink(
          `sample-link-${++sequence}`,
          source,
          nextInterface(source),
          target,
          nextInterface(target),
        ),
      );
    else {
      const link = topology.links[editingLink];
      link.source = {
        deviceId: source,
        interface: $("link-source-interface").value,
      };
      link.target = {
        deviceId: target,
        interface: $("link-target-interface").value,
      };
    }
    newLink();
    drawLinks();
    drawLines();
    count();
    check();
  });
  $("link-new").addEventListener("click", () => {
    newLink();
    $("link-source").focus();
  });
  $("pro-validate").addEventListener("click", check);
  $("pro-reset").addEventListener("click", () => {
    topology = initial();
    selected = topology.nodes[0].id;
    sequence = 0;
    $("topology-name").value = topology.name;
    render();
    invalidate("Original sample restored. All local edits were discarded.");
  });
  const quote = (value) => JSON.stringify(String(value));
  function yaml() {
    const output = [
      "# Inspector-Pro browser preview data. No network launched.",
      `name: ${quote(topology.name)}`,
      "topology:",
      topology.nodes.length ? "  nodes:" : "  nodes: {}",
    ];
    topology.nodes.forEach((node) => {
      output.push(`    ${quote(node.id)}:`, `      kind: ${quote(node.kind)}`);
      if (node.image) output.push(`      image: ${quote(node.image)}`);
      for (const key of ["exec", "binds"])
        if (node.properties[key].length) {
          output.push(`      ${key}:`);
          node.properties[key].forEach((value) =>
            output.push(`        - ${quote(value)}`),
          );
        }
      if (Object.keys(node.properties.env).length) {
        output.push("      env:");
        Object.entries(node.properties.env).forEach(([key, value]) =>
          output.push(`        ${quote(key)}: ${quote(value)}`),
        );
      }
    });
    if (topology.links.length) {
      output.push("  links:");
      topology.links.forEach((link) =>
        output.push(
          `    - endpoints: [${quote(`${link.source.deviceId}:${link.source.interface}`)}, ${quote(`${link.target.deviceId}:${link.target.interface}`)}]`,
        ),
      );
    }
    return output.join("\n") + "\n";
  }
  function download(format) {
    const valid = check();
    const content =
      format === "json" ? JSON.stringify(topology, null, 2) + "\n" : yaml();
    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "application/yaml",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      format === "json"
        ? "inspector-pro-preview.json"
        : "inspector-pro-preview.clab.yml";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status(
      `${format.toUpperCase()} preview data downloaded from this browser. ${valid ? "Structural checks passed." : "Structural findings remain; this sample contains errors."} No network was launched.`,
    );
  }
  $("pro-json").addEventListener("click", () => download("json"));
  $("pro-yaml").addEventListener("click", () => download("yaml"));
  render();
  if (typeof ResizeObserver !== "undefined") {
    const canvasResize = new ResizeObserver(containCards);
    canvasResize.observe($("topology-canvas"));
  } else {
    window.addEventListener("resize", containCards);
  }
})();
