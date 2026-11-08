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
  // Every element is optional: a page may omit the identity card or role badge,
  // and a missing one must not stop the caller's startup.
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('id-username', identity.username || '—');
  setText('id-userid', identity.userId || '(guest)');
  setText('id-email', identity.email || '—');
  setText('id-role', identity.role || '—');
  setText('id-course', identity.course?.name || '—');
  setText('id-courseid', tbsInfo.courseId ?? '—');
  setText('id-toolid', tbsInfo.toolId ?? '—');
  const card = document.getElementById('identity-card');
  if (card) card.style.display = 'flex';

  const role = (tbsInfo.role || '').toLowerCase();
  const badge = document.getElementById('role-badge');
  if (badge) {
    badge.textContent = role;
    badge.className = role === 'teacher' ? 'teacher' : role === 'student' ? 'student' : 'guest';
    badge.style.display = 'block';
  }

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
