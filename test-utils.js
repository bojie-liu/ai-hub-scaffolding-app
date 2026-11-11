/**
 * Test-only helpers for the connection harness (test.html).
 * Message log and per-step status indicators.
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

function updateStepStatus(stepId, status) {
  const el = document.getElementById('step-' + stepId);
  if (!el) return;

  if (status === 'busy') {
    el.className = 'step busy';
  } else if (status === 'skip') {
    el.className = 'step skip';
  } else if (status === 'ok') {
    el.className = 'step ok';
  } else if (status === 'error') {
    el.className = 'step err';
  }
}
