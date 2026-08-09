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

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const money = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(value || 0));
  const show = (node, visible) => { node.hidden = !visible; };
  const setStatus = (message, kind = '') => { status.textContent = message; status.className = `notice ${kind}`.trim(); show(status, Boolean(message)); };
  const clearViews = () => { show(signin, false); show(setup, false); show(denied, false); show(dashboard, false); show(signOut, false); };

  function renderProjects(rows) {
    const target = document.querySelector('#projects');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="project"><div><h3>${esc(row.name)}</h3><p>${esc(row.area)}${row.public_url ? ` · <a href="${esc(row.public_url)}" target="_blank" rel="noopener">public page ↗</a>` : ''}</p></div><span class="status ${esc(row.status)}">${esc(row.status)}</span><p>${esc(row.notes || 'No private note recorded.')}</p></article>`).join('') : '<p class="empty">No projects have been seeded yet.</p>';
  }

  function renderTasks(rows) {
    const target = document.querySelector('#tasks');
    target.innerHTML = rows.length ? rows.slice(0, 12).map((row) => `<article class="task"><div><h3>${esc(row.title)}</h3><p>${esc(row.status)}${row.due_date ? ` · due ${esc(row.due_date)}` : ''}</p></div><span class="priority">${esc(row.priority || 'normal')}</span></article>`).join('') : '<p class="empty">No open tasks have been seeded yet.</p>';
  }

  function renderFinance(rows) {
    const target = document.querySelector('#finance');
    target.innerHTML = rows.length ? rows.map((row) => `<article class="finance-item"><div><strong>${esc(row.description)}</strong><div class="meta">${esc(row.kind)} · ${esc(row.status)}</div></div><strong>${money(row.amount_gbp)}</strong>${row.due_date ? `<p>Due ${esc(row.due_date)}</p>` : ''}</article>`).join('') : '<p class="empty">No finance records have been seeded yet.</p>';
  }

  async function loadData(user) {
    const [projectsResult, tasksResult, financeResult] = await Promise.all([
      client.from('projects').select('id,name,area,status,public_url,notes,updated_at').order('updated_at', { ascending: false }),
      client.from('tasks').select('id,title,status,priority,due_date,updated_at').neq('status', 'done').order('due_date', { ascending: true, nullsFirst: false }),
      client.from('finance_items').select('id,description,kind,amount_gbp,status,due_date').order('due_date', { ascending: true, nullsFirst: false })
    ]);
    const failure = [projectsResult, tasksResult, financeResult].find((result) => result.error);
    if (failure) throw failure.error;
    const projects = projectsResult.data || [];
    const tasks = tasksResult.data || [];
    const finance = financeResult.data || [];
    document.querySelector('#identity').textContent = `${user.email} · ${user.id.slice(0, 8)}…`;
    document.querySelector('#metrics').innerHTML = `<article class="metric"><small>Projects</small><strong>${projects.length}</strong><span class="muted">private register</span></article><article class="metric"><small>Open tasks</small><strong>${tasks.length}</strong><span class="muted">next gates</span></article><article class="metric"><small>Finance rows</small><strong>${finance.length}</strong><span class="muted">reviewed snapshot</span></article><article class="metric"><small>Access</small><strong>RLS</strong><span class="muted">database enforced</span></article>`;
    renderProjects(projects); renderTasks(tasks); renderFinance(finance);
  }

  async function activateSession(session) {
    const email = (session.user.email || '').toLowerCase();
    if (!approvedEmails.has(email)) {
      await client.auth.signOut();
      setStatus('This Google account is not on the BStudioB founder allowlist.', 'error');
      show(denied, true);
      return;
    }
    show(signOut, true);
    setStatus('Authenticated. Private records are being loaded through database policies.', 'success');
    try {
      await loadData(session.user);
      show(dashboard, true);
    } catch (error) {
      setStatus(`Signed in, but the private schema is not ready yet (${error.message || 'database error'}).`, 'error');
    }
  }

  async function recoverOAuthFragment() {
    let lastError = '';
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      if (accessToken && refreshToken) {
        const result = await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (!result.error) {
          window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.search}`);
          return result.data.session;
        }
        lastError = result.error.message || 'session could not be established';
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (lastError) setStatus(`Google callback could not be completed (${lastError}).`, 'error');
    return null;
  }

  async function start() {
    clearViews();
    if (!config.url || !config.anonKey || config.anonKey.includes('PASTE_')) { setStatus('Secure shell configured, awaiting its public Supabase configuration.', ''); show(setup, true); return; }
    if (!window.supabase?.createClient) { setStatus('The authentication client could not load. Refresh and try again.', 'error'); return; }
    client = window.supabase.createClient(config.url, config.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    let activated = false;
    client.auth.onAuthStateChange((event, session) => {
      if (session && !activated) {
        activated = true;
        void activateSession(session);
      }
    });
    let { data: { session } } = await client.auth.getSession();
    if (!session) session = await recoverOAuthFragment();
    if (session && !activated) {
      activated = true;
      await activateSession(session);
      return;
    }
    if (!session) {
      if (!status.textContent.startsWith('Google callback could not be completed')) setStatus('Sign in is required.');
      show(signin, true);
    }
  }

  document.querySelector('#google-sign-in').addEventListener('click', async () => {
    if (!client) return;
    const { error } = await client.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/admin/ops/` } });
    if (error) setStatus(`Google sign-in could not start: ${error.message}`, 'error');
  });
  signOut.addEventListener('click', async () => { await client?.auth.signOut(); window.location.reload(); });
  start();
})();
