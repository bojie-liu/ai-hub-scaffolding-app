/**
 * Shared UI helpers for the tool page and the connection test harness.
 * Renders identity, the connection badge, and the fatal-error screen.
 * Requires #identity-card, #role-badge, #conn-badge and #error-screen in the page.
 */

function setConnBadge(state) {
  const badge = document.getElementById('conn-badge');
  if (!badge) return;
  badge.textContent = state === 'connecting' ? 'connecting…' : state;
  badge.dataset.state = state;
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

  const d = document.getElementById('err-detail');
  if (detail) {
    d.style.display = 'block';
    d.textContent = typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2);
  } else {
    d.style.display = 'none';
    d.textContent = '';
  }
}
