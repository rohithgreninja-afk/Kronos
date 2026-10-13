// main.js: Kronos UI logic, API calls, animations
// Phase 2: do not edit until Phase 1 backend is complete

const COLORS = [
  { bg: '#B89AAA', text: '#1A0F1C' },
  { bg: '#7A6070', text: '#DDD0C0' },
  { bg: '#D4C4CE', text: '#1A0F1C' },
  { bg: '#5C4A5C', text: '#DDD0C0' },
  { bg: '#9E8494', text: '#1A0F1C' },
  { bg: '#4A3848', text: '#DDD0C0' }
];

const DEFAULT_PROCESSES = [
  { pid: 'P1', arrival_time: 0, burst_time: 5, priority: 2 },
  { pid: 'P2', arrival_time: 2, burst_time: 3, priority: 1 },
  { pid: 'P3', arrival_time: 4, burst_time: 1, priority: 3 },
];

const processTable = document.getElementById('process-table');
const addBtn = document.getElementById('add-btn');
const algoSelect = document.getElementById('algo-select');
const quantumRow = document.getElementById('quantum-row');
const quantumInput = document.getElementById('quantum-input');
const runBtn = document.getElementById('run-btn');
const inputError = document.getElementById('input-error');
const ganttContainer = document.getElementById('gantt-container');
const metricsContainer = document.getElementById('metrics-container');

function addRow(pid = '', at = '', bt = '', pr = '') {
  const tbody = processTable.querySelector('tbody');
  const tr = document.createElement('tr');
  tr.innerHTML =
    '<td><input type="text" value="' + pid + '"></td>' +
    '<td><input type="number" value="' + at + '"></td>' +
    '<td><input type="number" value="' + bt + '"></td>' +
    '<td><input type="number" value="' + pr + '"></td>' +
    '<td><button class="delete-btn" onclick="this.closest(\'tr\').remove()">×</button></td>';
  tbody.appendChild(tr);
}

document.addEventListener('DOMContentLoaded', () => {
  DEFAULT_PROCESSES.forEach(p => addRow(p.pid, p.arrival_time, p.burst_time, p.priority));
});

addBtn.onclick = () => {
  const n = processTable.querySelectorAll('tbody tr').length + 1;
  addRow('P' + n);
};

function toggleQuantum() {
  algoSelect.value === 'rr'
    ? quantumRow.style.display = 'flex'
    : quantumRow.style.display = 'none';
}

algoSelect.addEventListener('change', toggleQuantum);

function getProcesses() {
  const rows = processTable.querySelectorAll('tbody tr');
  const processes = [];

  for (const row of rows) {
    const inputs = row.querySelectorAll('input');
    const pid = inputs[0].value.trim();
    const arrivalStr = inputs[1].value;
    const burstStr = inputs[2].value;
    const priorityStr = inputs[3].value;

    if (!pid || arrivalStr === '' || burstStr === '' || priorityStr === '') {
      inputError.textContent = 'All fields are required for every process.';
      return null;
    }

    const arrival_time = parseInt(arrivalStr, 10);
    const burst_time = parseInt(burstStr, 10);
    const priority = parseInt(priorityStr, 10);

    if (arrival_time < 0) {
      inputError.textContent = 'Arrival time must be >= 0.';
      return null;
    }
    if (burst_time < 1) {
      inputError.textContent = 'Burst time must be >= 1.';
      return null;
    }
    if (priority < 1) {
      inputError.textContent = 'Priority must be >= 1.';
      return null;
    }

    processes.push({ pid, arrival_time, burst_time, priority });
  }

  inputError.textContent = '';
  return processes;
}

runBtn.addEventListener('click', async () => {
  const processes = getProcesses();
  if (processes === null) return;

  runBtn.textContent = 'Running...';
  runBtn.disabled = true;

  try {
    const res = await fetch('/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        processes,
        algorithm: algoSelect.value,
        quantum: parseInt(quantumInput.value, 10) || 2
      })
    });

    if (!res.ok) throw new Error('request failed');

    const data = await res.json();
    renderGantt(data.timeline);
    renderMetrics(data.metrics, data.averages);
  } catch {
    ganttContainer.innerHTML = '<p class="empty-state">Server error. Is app.py running?</p>';
  } finally {
    runBtn.textContent = 'Run Simulation';
    runBtn.disabled = false;
  }
});

function renderGantt(timeline) {
  const colorMap = {};
  let colorIndex = 0;

  for (const block of timeline) {
    if (!(block.pid in colorMap)) {
      colorMap[block.pid] = COLORS[colorIndex % COLORS.length];
      colorIndex++;
    }
  }

  const total = Math.max(...timeline.map(b => b.end));

  const track = document.createElement('div');
  track.className = 'gantt-track';

  for (const block of timeline) {
    const el = document.createElement('div');
    el.className = 'gantt-block';
    el.style.width = ((block.end - block.start) / total * 100).toFixed(2) + '%';
    el.style.background = colorMap[block.pid].bg;
    el.style.color = colorMap[block.pid].text;
    el.textContent = block.pid;
    track.appendChild(el);
  }

  const times = new Set();
  for (const block of timeline) {
    times.add(block.start);
    times.add(block.end);
  }
  const sortedTimes = [...times].sort((a, b) => a - b);

  const labels = document.createElement('div');
  labels.className = 'gantt-labels';

  for (const t of sortedTimes) {
    const span = document.createElement('span');
    span.className = 'gantt-label';
    span.style.left = (t / total * 100).toFixed(2) + '%';
    span.textContent = t;
    labels.appendChild(span);
  }

  ganttContainer.innerHTML = '';
  ganttContainer.appendChild(track);
  ganttContainer.appendChild(labels);
  ganttContainer.classList.add('fade-in');
  setTimeout(() => ganttContainer.classList.remove('fade-in'), 400);
}

function renderMetrics(metrics, averages) {
  const table = document.createElement('table');

  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>PID</th><th>CT</th><th>TAT</th><th>WT</th><th>RT</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const m of metrics) {
    const tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + m.pid + '</td>' +
      '<td>' + m.CT + '</td>' +
      '<td>' + m.TAT + '</td>' +
      '<td>' + m.WT + '</td>' +
      '<td>' + m.RT + '</td>';
    tbody.appendChild(tr);
  }

  const n = metrics.length;
  const mean = key => n ? (metrics.reduce((s, m) => s + m[key], 0) / n).toFixed(2) : '';

  const avgRow = document.createElement('tr');
  avgRow.className = 'averages-row';
  avgRow.innerHTML =
    '<td>Averages</td>' +
    '<td>' + mean('CT') + '</td>' +
    '<td>' + mean('TAT') + '</td>' +
    '<td>' + mean('WT') + '</td>' +
    '<td>' + mean('RT') + '</td>';
  tbody.appendChild(avgRow);

  table.appendChild(tbody);

  metricsContainer.innerHTML = '';
  metricsContainer.appendChild(table);
  metricsContainer.classList.add('fade-in');
  setTimeout(() => metricsContainer.classList.remove('fade-in'), 400);
}
