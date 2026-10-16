(() => {
  const root = document.getElementById('network-simulation');
  if (!root) return;
  const $ = id => root.querySelector(`#${id}`);
  const label = 'Simulated browser sample';
  const ns = 'http://www.w3.org/2000/svg';
  let hardened = false;
  let running = false;
  let completed = false;
  let events = [];
  let timer;
  let revision = 0;
  // The exact same ordered event objects supply the timeline and flow overlay.
  function scenario(deny) {
    return [
      { text: 'Attacker attempts access to the service; the attempt arrives at the boundary.', path: 'M240 145 H275', kind: 'attempt' },
      deny
        ? { text: 'Boundary deny rule matches untrusted access. The attempt is blocked.', path: 'M240 145 H280', kind: 'blocked' }
        : { text: 'Weak boundary policy allows untrusted access toward the service.', path: 'M275 145 H295 M505 145 H560', kind: 'allowed' },
      deny
        ? { text: 'The service is not reached in this sample. The deny rule changes the outcome.', kind: 'blocked' }
        : { text: 'The service is reached in this sample. Finding: untrusted access is allowed.', kind: 'allowed' },
    ];
  }
  function render() {
    $('scenario-events').replaceChildren();
    $('scenario-flow').replaceChildren();
    events.forEach((event, index) => {
      const li = document.createElement('li');
      const tag = document.createElement('span');
      tag.textContent = `${label} / ${String(index + 1).padStart(2, '0')}`;
      li.append(tag, document.createTextNode(event.text));
      $('scenario-events').append(li);
      if (event.path) {
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', event.path);
        path.setAttribute('class', `flow-path ${event.kind}`);
        const title = document.createElementNS(ns, 'title');
        title.textContent = `${label}: ${event.text}`;
        path.append(title);
        $('scenario-flow').append(path);
      }
      if (event.path && event.kind === 'blocked') {
        const marker = document.createElementNS(ns, 'path');
        marker.setAttribute('d', 'M280 127 V163');
        marker.setAttribute('class', 'stop-marker');
        $('scenario-flow').append(marker);
      }
    });
    $('map-desc').textContent = events.length
      ? events.map(event => `${label}: ${event.text}`).join(' ')
      : 'No attempt played yet. The topology connects an attacker to a router/firewall boundary and then a service.';
    $('scenario-play').disabled = running;
    $('scenario-harden').disabled = running || hardened;
    $('scenario-play').textContent = completed ? 'Replay same scenario' : 'Play scenario';
    $('policy-state').textContent = hardened ? 'Current policy: deny untrusted access' : 'Current policy: allow untrusted access';
    const last = events.at(-1);
    $('flow-result').textContent = !last ? 'Awaiting playback' : running
      ? `Playing / ${events.length} of 3 events`
      : `Last replay: ${last.kind === 'blocked' ? 'blocked at boundary' : 'service reached'}`;
  }
  $('scenario-play').addEventListener('click', () => {
    clearTimeout(timer);
    const run = ++revision;
    const ordered = scenario(hardened);
    const deny = hardened;
    events = [];
    running = true;
    $('scenario-status').textContent = `${label}: playing the ${deny ? 'deny-rule' : 'weak-policy'} attempt.`;
    function advance() {
      if (run !== revision) return;
      events.push(ordered[events.length]);
      if (events.length === ordered.length) {
        running = false;
        completed = true;
        $('scenario-status').textContent = `${label}: ${deny ? 'blocked at the boundary; the service was not reached.' : 'allowed through the boundary; the service was reached.'}`;
        if (deny) $('after-finding').textContent = 'Replayed with the deny rule: the boundary blocked the attempt. The service was not reached in this sample.';
      }
      render();
      if (running) timer = setTimeout(advance, 650);
    }
    advance();
  });
  $('scenario-harden').addEventListener('click', () => {
    hardened = true;
    $('after-finding').textContent = 'Deny rule applied locally. Replay the same attempt to collect the changed result.';
    $('scenario-status').textContent = `${label}: deny rule applied. The existing record shows the previous playback; replay to see the new policy result.`;
    render();
  });
  $('scenario-reset').addEventListener('click', () => {
    clearTimeout(timer);
    revision++;
    hardened = running = completed = false;
    events = [];
    $('after-finding').textContent = 'Apply the deny rule and replay to collect the changed result.';
    $('scenario-status').textContent = `${label}: reset to weak policy. Playback record cleared.`;
    render();
  });
  render();
})();
