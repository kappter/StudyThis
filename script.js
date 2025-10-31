// Example Vocabulary for typing test - replace with uploaded vocab as needed
const testVocab = [
  'Algorithm', 'Loop', 'Variable', 'Function',
  'Constant', 'Parameter', 'Array', 'Object',
  'Class', 'Inheritance', 'Recursion', 'Syntax'
];

const typingTestSection = document.getElementById('typingTest');
const wordDisplay = document.getElementById('wordDisplay');
const typingInput = document.getElementById('typingInput');
const wpmDisplay = document.getElementById('wpmDisplay');
const accuracyDisplay = document.getElementById('accuracyDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const endTestBtn = document.getElementById('endTestBtn');
const testReport = document.getElementById('testReport');

let currentWordIndex = 0;
let totalTypedChars = 0;
let correctTypedChars = 0;
let startTime = null;
let timerInterval = null;
const testDuration = 60; // seconds
const fallingWordDiv = document.getElementById('fallingWord');
const definitionDiv = document.getElementById('definitionDisplay');
const fallingContainer = document.getElementById('fallingWordContainer');

const words = [
  { word: 'Algorithm', definition: 'A set of rules to solve a problem' },
  { word: 'Loop', definition: 'A structure that repeats code' },
  { word: 'Variable', definition: 'A storage location in memory' }
];

let currentIndex = 0;

function createUnderscores(word) {
  return word[0] + '_'.repeat(word.length - 1);
}

function animateFallingWord() {
  let pos = 0;
  const wordObj = words[currentIndex];
  fallingWordDiv.textContent = createUnderscores(wordObj.word);
  definitionDiv.textContent = wordObj.definition;
  
  const containerHeight = fallingContainer.clientHeight;
  const animationSpeed = 2; // pixels per 20ms
  
  function fall() {
    pos += animationSpeed;
    fallingWordDiv.style.top = pos + 'px';
    if (pos < containerHeight - 40) { // 40 for approx height of text
      requestAnimationFrame(fall);
    } else {
      // Reset for next word
      pos = 0;
      currentIndex = (currentIndex + 1) % words.length;
      fallingWordDiv.style.top = pos + 'px';
      fallingWordDiv.textContent = createUnderscores(words[currentIndex].word);
      definitionDiv.textContent = words[currentIndex].definition;
      setTimeout(() => requestAnimationFrame(fall), 1000);
    }
  }
  fall();
}

// Start animation
animateFallingWord();

function startTypingTest() {
  typingTestSection.style.display = 'block';
  currentWordIndex = 0;
  totalTypedChars = 0;
  correctTypedChars = 0;
  startTime = Date.now();
  typingInput.value = '';
  typingInput.disabled = false;
  testReport.style.display = 'none';
  endTestBtn.style.display = 'none';

  displayWord(testVocab[currentWordIndex]);
  updateStats(0, 100, testDuration);
  typingInput.focus();

  timerInterval = setInterval(() => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    const timeLeft = testDuration - elapsedTime;

    if (timeLeft <= 0) {
      endTypingTest();
    } else {
      timeDisplay.textContent = `Time Left: ${timeLeft}s`;
    }
  }, 500);
}

function displayWord(word) {
  wordDisplay.textContent = word;
}

function updateStats(wpm, accuracy, timeLeft) {
  wpmDisplay.textContent = `WPM: ${wpm}`;
  accuracyDisplay.textContent = `Accuracy: ${accuracy.toFixed(1)}%`;
  timeDisplay.textContent = `Time Left: ${timeLeft}s`;
}

typingInput.addEventListener('input', () => {
  const currentWord = testVocab[currentWordIndex];
  const typed = typingInput.value;

  totalTypedChars = totalTypedChars + 1;
  // Count correct characters typed so far in the current word
  let correctCharsInCurrent = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === currentWord[i]) correctCharsInCurrent++;
  }
  correctTypedChars = correctTypedChars + correctCharsInCurrent - (correctTypedChars > 0 ? correctTypedChars : 0);

  // If the word matches exactly, move to next word
  if (typed === currentWord) {
    typingInput.value = '';
    currentWordIndex++;
    if (currentWordIndex >= testVocab.length) {
      endTypingTest();
    } else {
      displayWord(testVocab[currentWordIndex]);
    }
  }

  // Calculate WPM and accuracy
  const elapsedMinutes = (Date.now() - startTime) / 60000;
  const wordsTyped = currentWordIndex;
  const wpm = elapsedMinutes > 0 ? wordsTyped / elapsedMinutes : 0;
  const accuracy = totalTypedChars > 0 ? (correctTypedChars / totalTypedChars) * 100 : 100;

  updateStats(Math.min(Math.round(wpm), 200), accuracy, Math.max(testDuration - Math.floor((Date.now() - startTime) / 1000), 0));
});

function endTypingTest() {
  clearInterval(timerInterval);
  typingInput.disabled = true;
  wordDisplay.textContent = 'Test Complete!';
  endTestBtn.style.display = 'inline-block';

  const finalWPM = wpmDisplay.textContent.split(' ')[1];
  const finalAccuracy = accuracyDisplay.textContent.split(' ')[1];

  testReport.style.display = 'block';
  testReport.textContent = `Final Words Per Minute: ${finalWPM}\nFinal Accuracy: ${finalAccuracy}\nWords Typed: ${currentWordIndex} of ${testVocab.length}`;
}

// You can call this function to start the test after user initiates it
// For example:
// startTypingTest();

// Optionally hook start button from your UI
document.getElementById('confirmStart').onclick = () => {
  document.getElementById('startModal')?.style.setProperty('display', 'none');
  startTypingTest();
};


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
