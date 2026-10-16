/**
 * Test & Debug Utilities
 *
 * Logging, identity display, and error screen helpers.
 */

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function log(dir, text) {
  const wrap = document.getElementById('log-wrap');
  if (!wrap) return;

  const row = document.createElement('div');
  row.className = 'log-row';
  const ts = new Date().toLocaleTimeString();
  const symbol = dir === 'in' ? '←' : dir === 'out' ? '→' : dir === 'err' ? '✕' : '·';

  row.innerHTML =
    '<span class="log-ts">' + ts + '</span>' +
    '<span class="log-dir ' + dir + '">' + symbol + '</span>' +
    '<span class="log-body">' + escHtml(text) + '</span>';

  wrap.appendChild(row);
  wrap.scrollTop = wrap.scrollHeight;
}

function clearLog() {
  const wrap = document.getElementById('log-wrap');
  if (wrap) wrap.innerHTML = '';
}

function showIdentity(identity, tbsInfo) {
  document.getElementById('id-username').textContent = identity.username || '—';
  document.getElementById('id-userid').textContent = identity.userId || '(guest)';
  document.getElementById('id-email').textContent = identity.email || '—';
  document.getElementById('id-role').textContent = identity.role || '—';
  document.getElementById('id-course').textContent = identity.course?.name || '—';
  document.getElementById('id-courseid').textContent = tbsInfo.courseId ?? '—';
  document.getElementById('id-toolid').textContent = tbsInfo.toolId ?? '—';
  document.getElementById('identity-card').style.display = 'flex';

  const badge = document.getElementById('role-badge');
  const role = (tbsInfo.role || '').toLowerCase();
  badge.textContent = role;
  badge.className = role === 'teacher' ? 'teacher' : role === 'student' ? 'student' : 'guest';
  badge.style.display = 'block';

  const stateSyncOpt = document.getElementById('opt-state-sync');
  if (stateSyncOpt) {
    stateSyncOpt.style.display = role === 'teacher' ? '' : 'none';
  }

  return role;
}

function fatal(title, desc, detail) {
  document.getElementById('main').style.display = 'none';
  const es = document.getElementById('error-screen');
  es.style.display = 'flex';
  document.getElementById('err-title').textContent = title;
  document.getElementById('err-desc').textContent = desc;

  if (detail) {
    const d = document.getElementById('err-detail');
    d.style.display = 'block';
    d.textContent = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
  }
}

function updateStepStatus(stepId, status) {
  const el = document.getElementById('step-' + stepId);
  if (!el) return;

  if (status === 'busy') {
    el.className = 'step busy';
  } else if (status === 'ok') {
    el.className = 'step ok';
  } else if (status === 'error') {
    el.className = 'step err';
  }
}
