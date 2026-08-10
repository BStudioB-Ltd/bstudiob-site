(() => {
  const approvedEmails = new Set(['nathan@bstudiob.co.uk', 'hello@bstudiob.co.uk']);
  const config = window.BSTUDIOB_SUPABASE || {};
  const status = document.querySelector('#status');
  const signin = document.querySelector('#signin');
  const setup = document.querySelector('#setup');
  const denied = document.querySelector('#denied');
  const dashboard = document.querySelector('#dashboard');
  const signOut = document.querySelector('#sign-out');
  let client = null;
  let projects = [];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const money = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
  const show = (node, visible) => { node.hidden = !visible; };
  const setStatus = (message, kind = '') => { status.textContent = message; status.className = `notice ${kind}`.trim(); show(status, Boolean(message)); };
  const clearViews = () => { show(signin, false); show(setup, false); show(denied, false); show(dashboard, false); show(signOut, false); };
  const projectName = (key) => projects.find((project) => project.slug === key)?.name || key;

  function renderProjects(rows) {
    const target = document.querySelector('#projects');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="project"><div><h3>${esc(row.name)}</h3><p>${esc(row.area)}${row.public_url ? ` · <a href="${esc(row.public_url)}" target="_blank" rel="noopener">public page ↗</a>` : ''}</p></div><span class="status ${esc(row.status)}">${esc(row.status)} · ${Number(row.progress || 0)}%</span><p>${esc(row.notes || 'No private note recorded.')}</p></article>`).join('') : '<p class="empty">No projects have been seeded yet.</p>';
  }

  function renderTasks(rows) {
    const target = document.querySelector('#tasks');
    target.innerHTML = rows.length ? rows.slice(0, 12).map((row) => `<article class="task"><div><h3>${esc(row.title)}</h3><p>${esc(row.status)}${row.due_date ? ` · due ${esc(row.due_date)}` : ''}</p></div><span class="priority">${esc(row.priority || 'normal')}</span></article>`).join('') : '<p class="empty">No open tasks have been seeded yet.</p>';
  }

  function renderFinance(rows) {
    const target = document.querySelector('#finance');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="finance-item"><div><strong>${esc(row.description)}</strong><div class="meta">${esc(row.kind)} · ${esc(row.status)}</div></div><strong>${money(row.amount_gbp)}</strong>${row.due_date ? `<p>Due ${esc(row.due_date)}</p>` : ''}</article>`).join('') : '<p class="empty">No finance records have been seeded yet.</p>';
  }

  function renderAccess(rows) {
    const target = document.querySelector('#access');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="record"><div><strong>${esc(row.account_username)}</strong><span>${esc(projectName(row.product_key))} · ${esc(row.plan_name || 'No plan')}</span><small>${esc(row.access_status)} · ${esc(row.subscription_status)} · ${esc(row.source)}</small></div><div class="record-actions">${row.access_status === 'blocked' || row.access_status === 'removed' ? `<button class="mini-button" data-action="unblock-access" data-id="${esc(row.id)}">Restore</button>` : `<button class="mini-button danger-button" data-action="block-access" data-id="${esc(row.id)}">Block</button>`}<button class="mini-button danger-button" data-action="remove-access" data-id="${esc(row.id)}">Remove</button></div></article>`).join('') : '<p class="empty">No accounts have been added yet. Add an opaque account username above.</p>';
  }

  function renderMailing(rows) {
    const target = document.querySelector('#mailing-lists');
    target.innerHTML = `<form id="mailing-form" class="compact-form"><label>Username<input name="account_username" required minlength="2" maxlength="120" pattern="[^@]+" placeholder="opaque account username"></label><label>Product<select name="product_key" required>${projects.map((p) => `<option value="${esc(p.slug)}">${esc(p.name)}</option>`).join('')}</select></label><label>List key<input name="list_key" required pattern="[a-z0-9-]+" placeholder="flowcue-beta"></label><button class="mini-button" type="submit">Add</button></form>` + (rows.length ? rows.map((row) => `<article class="record"><div><strong>${esc(row.account_username)}</strong><span>${esc(projectName(row.product_key))} · ${esc(row.list_key)}</span><small>${esc(row.status)} · ${esc(row.source)}</small></div><div class="record-actions"><button class="mini-button" data-action="toggle-list" data-id="${esc(row.id)}" data-status="${esc(row.status)}">${row.status === 'blocked' ? 'Restore' : 'Block'}</button><button class="mini-button danger-button" data-action="unsubscribe-list" data-id="${esc(row.id)}">Unsubscribe</button></div></article>`).join('') : '<p class="empty">No mailing-list accounts have been recorded. Provider inboxes retain contact details.</p>');
  }

  function renderRequests(rows) {
    const target = document.querySelector('#requests');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="record"><div><strong>${esc(projectName(row.product_key))}</strong><span>${esc(row.request_type)}${row.account_username ? ` · ${esc(row.account_username)}` : ''}</span><small>${esc(row.status)} · ${esc(row.source)}</small>${row.non_pii_summary ? `<p>${esc(row.non_pii_summary)}</p>` : ''}</div><select class="request-status" data-action="request-status" data-id="${esc(row.id)}" aria-label="Request status"><option ${row.status === 'new' ? 'selected' : ''}>new</option><option ${row.status === 'reviewing' ? 'selected' : ''}>reviewing</option><option ${row.status === 'approved' ? 'selected' : ''}>approved</option><option ${row.status === 'rejected' ? 'selected' : ''}>rejected</option><option ${row.status === 'closed' ? 'selected' : ''}>closed</option></select></article>`).join('') : '<p class="empty">No new requests have been mirrored. Keep email/contact details in FormSubmit, Brevo or Gmail.</p>';
  }

  function fillProductOptions() {
    document.querySelector('#access-product').innerHTML = projects.map((project) => `<option value="${esc(project.slug)}">${esc(project.name)}</option>`).join('');
  }

  async function loadData(user) {
    const results = await Promise.all([
      client.from('projects').select('id,slug,name,area,status,progress,public_url,notes,updated_at').order('updated_at', { ascending: false }),
      client.from('tasks').select('id,title,status,priority,due_date,updated_at').neq('status', 'done').order('due_date', { ascending: true, nullsFirst: false }),
      client.from('finance_items').select('id,description,kind,amount_gbp,status,due_date').order('due_date', { ascending: true, nullsFirst: false }),
      client.from('product_access').select('id,account_username,product_key,plan_name,access_status,subscription_status,source,updated_at').order('updated_at', { ascending: false }),
      client.from('mailing_list_members').select('id,account_username,product_key,list_key,status,source,updated_at').order('updated_at', { ascending: false }),
      client.from('access_requests').select('id,account_username,product_key,request_type,status,source,non_pii_summary,created_at,updated_at').order('created_at', { ascending: false })
    ]);
    const failure = results.find((result) => result.error);
    if (failure) throw failure.error;
    projects = results[0].data || [];
    const tasks = results[1].data || [];
    const finance = results[2].data || [];
    const access = results[3].data || [];
    const mailing = results[4].data || [];
    const requests = results[5].data || [];
    document.querySelector('#identity').textContent = `${user.email} · ${user.id.slice(0, 8)}…`;
    document.querySelector('#metrics').innerHTML = `<article class="metric"><small>Projects</small><strong>${projects.length}</strong><span class="muted">private register</span></article><article class="metric"><small>Open tasks</small><strong>${tasks.length}</strong><span class="muted">next gates</span></article><article class="metric"><small>Finance rows</small><strong>${finance.length}</strong><span class="muted">reviewed snapshot</span></article><article class="metric"><small>Accounts</small><strong>${access.filter((row) => row.access_status !== 'removed').length}</strong><span class="muted">access records</span></article><article class="metric"><small>Lists</small><strong>${mailing.filter((row) => row.status === 'subscribed').length}</strong><span class="muted">subscribed</span></article><article class="metric"><small>Requests</small><strong>${requests.filter((row) => ['new','reviewing'].includes(row.status)).length}</strong><span class="muted">needs triage</span></article>`;
    renderProjects(projects); renderTasks(tasks); renderFinance(finance); fillProductOptions(); renderAccess(access); renderMailing(mailing); renderRequests(requests);
  }

  async function audit(entityType, entityId, action, productKey) {
    await client.from('access_audit_events').insert({ entity_type: entityType, entity_id: entityId, action, product_key: productKey });
  }

  async function refresh() {
    const { data: { user } } = await client.auth.getUser();
    if (user) await loadData(user);
  }

  async function updateAccess(id, action) {
    const next = action === 'block-access' ? 'blocked' : action === 'remove-access' ? 'removed' : 'active';
    const rowResult = await client.from('product_access').select('product_key').eq('id', id).single();
    if (rowResult.error) throw rowResult.error;
    const result = await client.from('product_access').update({ access_status: next }).eq('id', id);
    if (result.error) throw result.error;
    await audit('access', id, next === 'blocked' ? 'blocked' : next === 'removed' ? 'removed' : 'unblocked', rowResult.data.product_key);
  }

  document.querySelector('#access-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const project = projects.find((row) => row.slug === data.product_key);
    const result = await client.from('product_access').insert({ ...data, project_id: project?.id || null });
    if (result.error) { setStatus(`Could not add access: ${result.error.message}`, 'error'); return; }
    setStatus('Access record added. No PII was stored.', 'success'); event.currentTarget.reset(); await refresh();
  });

  document.addEventListener('submit', async (event) => {
    if (event.target.id !== 'mailing-form') return;
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    const result = await client.from('mailing_list_members').insert({ ...data, source: 'manual' });
    if (result.error) { setStatus(`Could not add mailing-list record: ${result.error.message}`, 'error'); return; }
    setStatus('Mailing-list record added without PII.', 'success'); await refresh();
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.dataset.action === 'request-status') return;
    try {
      if (button.dataset.action === 'block-access' || button.dataset.action === 'remove-access' || button.dataset.action === 'unblock-access') await updateAccess(button.dataset.id, button.dataset.action);
      if (button.dataset.action === 'toggle-list' || button.dataset.action === 'unsubscribe-list') {
        const next = button.dataset.action === 'unsubscribe-list' ? 'unsubscribed' : button.dataset.status === 'blocked' ? 'subscribed' : 'blocked';
        const rowResult = await client.from('mailing_list_members').select('product_key').eq('id', button.dataset.id).single();
        if (rowResult.error) throw rowResult.error;
        const result = await client.from('mailing_list_members').update({ status: next }).eq('id', button.dataset.id);
        if (result.error) throw result.error;
        await audit('mailing-list', button.dataset.id, next === 'blocked' ? 'blocked' : next === 'subscribed' ? 'unblocked' : 'updated', rowResult.data.product_key);
      }
      setStatus('Record updated.', 'success'); await refresh();
    } catch (error) { setStatus(`Update failed: ${error.message || 'database error'}`, 'error'); }
  });

  document.addEventListener('change', async (event) => {
    const select = event.target.closest('[data-action="request-status"]');
    if (!select) return;
    try {
      const rowResult = await client.from('access_requests').select('product_key').eq('id', select.dataset.id).single();
      if (rowResult.error) throw rowResult.error;
      const result = await client.from('access_requests').update({ status: select.value }).eq('id', select.dataset.id);
      if (result.error) throw result.error;
      await audit('request', select.dataset.id, select.value === 'approved' ? 'approved' : select.value === 'rejected' ? 'rejected' : select.value === 'closed' ? 'closed' : 'updated', rowResult.data.product_key);
      setStatus('Request status updated.', 'success'); await refresh();
    } catch (error) { setStatus(`Request update failed: ${error.message || 'database error'}`, 'error'); }
  });

  async function activateSession(session) {
    const email = (session.user.email || '').toLowerCase();
    if (!approvedEmails.has(email)) { await client.auth.signOut(); setStatus('This Google account is not on the BStudioB founder allowlist.', 'error'); show(denied, true); return; }
    show(signOut, true); setStatus('Authenticated. Private records are being loaded through database policies.', 'success');
    try { await loadData(session.user); show(dashboard, true); } catch (error) { setStatus(`Signed in, but the private schema is not ready yet (${error.message || 'database error'}).`, 'error'); }
  }

  async function recoverOAuthFragment() {
    let lastError = '';
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get('access_token'); const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) { const result = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }); if (!result.error) { window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`); return result.data.session; } lastError = result.error.message || 'session could not be established'; }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (lastError) setStatus(`Google callback could not be completed (${lastError}).`, 'error');
    return null;
  }

  async function start() {
    clearViews();
    if (!config.url || !config.anonKey || config.anonKey.includes('PASTE_')) { setStatus('Secure shell configured, awaiting its public Supabase configuration.'); show(setup, true); return; }
    if (!window.supabase?.createClient) { setStatus('The authentication client could not load. Refresh and try again.', 'error'); return; }
    client = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    let activated = false;
    client.auth.onAuthStateChange((event, session) => { if (session && !activated) { activated = true; void activateSession(session); } });
    let { data: { session } } = await client.auth.getSession();
    if (!session) session = await recoverOAuthFragment();
    if (session && !activated) { activated = true; await activateSession(session); return; }
    if (!session) { if (!status.textContent.startsWith('Google callback could not be completed')) setStatus('Sign in is required.'); show(signin, true); }
  }

  document.querySelector('#google-sign-in').addEventListener('click', async () => { if (!client) return; const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/admin/ops/` } }); if (error) setStatus(`Google sign-in could not start: ${error.message}`, 'error'); });
  signOut.addEventListener('click', async () => { await client?.auth.signOut(); window.location.reload(); });
  start();
})();
