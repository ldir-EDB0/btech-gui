const inputFile = document.getElementById('inputFile');
const outputDir = document.getElementById('outputDir');
const browseFile = document.getElementById('browseFile');
const browseDir = document.getElementById('browseDir');
const probeSelect = document.getElementById('probeSelect');
const sheetSelect = document.getElementById('sheetSelect');
const generateBtn = document.getElementById('generateBtn');
const pushBtn = document.getElementById('pushBtn');
const logOutput = document.getElementById('logOutput');

function updatePushButtonState() {
  pushBtn.disabled = probeSelect.value === 'all' || sheetSelect.value === 'all';
}

browseFile.onclick = async () => {
  const file = await window.electronAPI.selectFile();
  if (file) {
    inputFile.value = file;

    const xlsx = require('xlsx');
    const workbook = xlsx.readFile(file);
    const sheetNames = workbook.SheetNames;
    const unicastJson = xlsx.utils.sheet_to_json(workbook.Sheets['unicast'] || {}, { defval: '' });

    const probes = [...new Set(unicastJson.map(r => r.FRIENDLY_NAME).filter(Boolean))];
    const sheets = sheetNames.filter(n => !['unicast', 'profiles', 'validation'].includes(n));

    updateDropdown(probeSelect, probes);
    updateDropdown(sheetSelect, sheets);
    updatePushButtonState();
  }
};

browseDir.onclick = async () => {
  const folder = await window.electronAPI.selectFolder();
  if (folder) outputDir.value = folder;
};

generateBtn.onclick = async () => {
  const res = await window.electronAPI.runScript({
    inputFile: inputFile.value,
    outputDir: outputDir.value,
    mode: 'generate'
  });
  logOutput.textContent = res.output;
};

pushBtn.onclick = async () => {
  const res = await window.electronAPI.runScript({
    inputFile: inputFile.value,
    probe: probeSelect.value,
    sheet: sheetSelect.value,
    mode: 'push'
  });
  logOutput.textContent = res.output;
};

probeSelect.onchange = updatePushButtonState;
sheetSelect.onchange = updatePushButtonState;

function updateDropdown(el, list) {
  el.innerHTML = '<option value="all">All</option>';
  list.forEach(item => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = item;
    el.appendChild(opt);
  });
}
