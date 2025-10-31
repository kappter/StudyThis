// Lock navigation and handle modal interactions
document.getElementById('typingBtn').addEventListener('click', () => {
  loadVocabPreview('typing');
});
document.getElementById('quizBtn').addEventListener('click', () => {
  loadVocabPreview('quiz');
});

// Load vocabulary preview, validate files, etc.
function loadVocabPreview(mode) {
  // Parse uploaded files or default vocab
  // Show a preview of the first few entries
  document.getElementById('vocabPreview').innerHTML = 'Sample terms...';
  document.getElementById('confirmStart').disabled = false;
}

// Finalize and start session
document.getElementById('confirmStart').addEventListener('click', () => {
  // Save session state
  // Remove modal
  document.getElementById('startModal').style.display = 'none';
  // Lock navigation
  history.pushState(null, null, location.href);
  window.onbeforeunload = () => 'Are you sure you want to leave? Progress will be lost.';
});
window.onpopstate = () => {
  // Prevent going back
  history.go(1);
};

document.addEventListener('DOMContentLoaded', () => {
  const startModal = document.getElementById('startModal');
  const typingBtn = document.getElementById('typingBtn');
  const quizBtn = document.getElementById('quizBtn');
  const vocabPreview = document.getElementById('vocabPreview');
  const fileUpload1 = document.getElementById('fileUpload1');
  const fileUpload2 = document.getElementById('fileUpload2');
  const confirmStart = document.getElementById('confirmStart');

  let selectedMode = null;
  let vocabData = null;

  // Show modal initially
  startModal.style.display = 'flex';

  // Disable confirm initially
  confirmStart.disabled = true;

  // Utility: Parse CSV text to array of objects {Term, Definition}
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(',').map(h => h.trim());
    return lines.map(line => {
      const values = line.split(',').map(v => v.trim());
      let obj = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });
  }

  // Load preview from parsed vocab entries
  function showVocabPreview(entries) {
    if (!entries || entries.length === 0) {
      vocabPreview.innerHTML = '<p>No vocabulary terms found.</p>';
      confirmStart.disabled = true;
      return;
    }
    let previewHTML = '<strong>Preview of Vocabulary Terms:</strong><ul>';
    for (let i = 0; i < Math.min(7, entries.length); i++) {
      previewHTML += `<li><strong>${entries[i].Term}</strong>: ${entries[i].Definition}</li>`;
    }
    previewHTML += '</ul>';
    vocabPreview.innerHTML = previewHTML;
    confirmStart.disabled = false;
  }

  // Handle file reads and parsing
  function loadFilesAndPreview() {
    const files = [fileUpload1.files[0], fileUpload2.files[0]].filter(Boolean);
    if (files.length === 0) {
      vocabPreview.innerHTML = '<p>Please upload at least one vocabulary CSV file.</p>';
      confirmStart.disabled = true;
      return;
    }

    let vocabEntries = [];
    let filesProcessed = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const entries = parseCSV(e.target.result);
          vocabEntries = vocabEntries.concat(entries);
        } catch (error) {
          vocabPreview.innerHTML = `<p>Error parsing file: ${file.name}</p>`;
          confirmStart.disabled = true;
          return;
        }
        filesProcessed++;
        if (filesProcessed === files.length) {
          vocabData = vocabEntries;
          showVocabPreview(vocabData);
        }
      };
      reader.readAsText(file);
    });
  }

  // Mode button clicks select mode and show preview instructions
  typingBtn.onclick = () => {
    selectedMode = 'typing';
    vocabPreview.innerHTML = '<p>Please upload vocabulary files to preview.</p>';
    confirmStart.disabled = true;
  };

  quizBtn.onclick = () => {
    selectedMode = 'quiz';
    vocabPreview.innerHTML = '<p>Please upload vocabulary files to preview.</p>';
    confirmStart.disabled = true;
  };

  // File inputs trigger loading and preview update
  fileUpload1.onchange = loadFilesAndPreview;
  fileUpload2.onchange = loadFilesAndPreview;

  // Confirm start button initializes session and hides modal
  confirmStart.onclick = () => {
    if (!selectedMode || !vocabData) return;
    sessionStorage.setItem('studyMode', selectedMode);
    sessionStorage.setItem('vocabularyData', JSON.stringify(vocabData));
    // Hide modal
    startModal.style.display = 'none';
    // Lock navigation
    history.pushState(null, null, location.href);
    window.onbeforeunload = () => 'Are you sure you want to leave? Your progress will be lost.';
  };

  // Prevent back navigation
  window.onpopstate = () => {
    history.go(1);
  };
});
