document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const confirmStart = document.getElementById('confirmStart');
  const typingTestSection = document.getElementById('typingTest');
  const fallingWordDiv = document.getElementById('fallingWord');
  const definitionDiv = document.getElementById('definitionDisplay');
  const fallingContainer = document.getElementById('fallingWordContainer');
  const typingInput = document.getElementById('typingInput');
  const wpmDisplay = document.getElementById('wpmDisplay');
  const accuracyDisplay = document.getElementById('accuracyDisplay');
  const timeDisplay = document.getElementById('timeDisplay');
  const endTestBtn = document.getElementById('endTestBtn');
  const testReport = document.getElementById('testReport');

  // Your vocabulary array - replace or expand as needed
  const words = [
    { word: 'Algorithm', definition: 'A set of rules to solve a problem' },
    { word: 'Loop', definition: 'A structure that repeats code' },
    { word: 'Variable', definition: 'A storage in memory' },
    { word: 'Function', definition: 'A reusable code block' }
  ];

  // Variables
  let currentWordIndex = 0;
  let totalTypedChars = 0;
  let correctTypedChars = 0;
  let startTime = null;
  const testDuration = 60; // seconds
  let timerInterval = null;
  let animationRequest = null;
  let fallingPos = 0;
  const animationSpeed = 1; // px per frame
  const pauseDuration = 1500; // ms

  // Create underscore with first letter revealed
  function createUnderscores(w) {
    return w[0] + '_'.repeat(w.length - 1);
  }

  function displayWordAndDefinition() {
    const currentWord = words[currentWordIndex];
    fallingWordDiv.textContent = createUnderscores(currentWord.word);
    definitionDiv.textContent = currentWord.definition;
    fallingPos = 0; // reset position
    fallingWordDiv.style.top = fallingPos + 'px';
  }

  // Recursive fall with pause at bottom
  function fall() {
    const containerHeight = fallingContainer.clientHeight;
    fallingPos += animationSpeed;
    fallingWordDiv.style.top = fallingPos + 'px';

    if (fallingPos < containerHeight - 40) {
      animationRequest = requestAnimationFrame(fall);
    } else {
      // Pause at bottom then move to next word
      setTimeout(() => {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        displayWordAndDefinition();
        animationRequest = requestAnimationFrame(fall);
      }, pauseDuration);
    }
  }

  function startFallingWords() {
    displayWordAndDefinition();
    animationRequest = requestAnimationFrame(fall);
  }

  function stopFallingWords() {
    if (animationRequest) cancelAnimationFrame(animationRequest);
  }

  // Timer and stats
  function startTypingTest() {
    // Show test section
    typingTestSection.style.display = 'block';
    // Initialize variables
    currentWordIndex = 0;
    totalTypedChars = 0;
    correctTypedChars = 0;
    startTime = Date.now();
    typingInput.value = '';
    typingInput.disabled = false;
    testReport.style.display = 'none';
    endTestBtn.style.display = 'none';

    // Start falling words
    displayWordAndDefinition();
    startFallingWords();

    // Start timer
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = testDuration - elapsed;
      if (remaining <= 0) {
        endTypingTest();
      } else {
        timeDisplay.textContent = `Time Left: ${remaining}s`;
      }
    }, 500);
  }

  function updateStats(wpm, accuracy, timeLeft) {
    wpmDisplay.textContent = `WPM: ${wpm}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy.toFixed(1)}%`;
    timeDisplay.textContent = `Time Left: ${timeLeft}s`;
  }

  let lastTypedLength = 0;

  typingInput.addEventListener('input', () => {
    const currentWord = words[currentWordIndex].word;
    let typed = typingInput.value;

    // Limit input to current word length
    if (typed.length > currentWord.length) {
      typed = typed.substr(0, currentWord.length);
      typingInput.value = typed;
    }

    // Count total typed chars
    totalTypedChars += typed.length - lastTypedLength;
    lastTypedLength = typed.length;

    // Count correct chars in current input
    let correctInCurrent = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === currentWord[i]) correctInCurrent++;
    }
    correctTypedChars = correctInCurrent; 

    // Next word if fully correct
    if (typed === currentWord) {
      // Reset input
      typingInput.value = '';
      lastTypedLength = 0;
      
      currentWordIndex++;
      if (currentWordIndex >= words.length) {
        endTypingTest();
        return;
      }

      stopFallingWords();
      displayWordAndDefinition();
      startFallingWords();
    }

    // WPM and accuracy
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const wpm = elapsedMinutes > 0 ? currentWordIndex / elapsedMinutes : 0;
    const accuracy = totalTypedChars > 0 ? (correctTypedChars / totalTypedChars) * 100 : 100;
    updateStats(Math.min(Math.round(wpm), 200), accuracy, Math.max(testDuration - Math.floor((Date.now() - startTime) / 1000), 0));
  });

  function endTypingTest() {
    clearInterval(timerInterval);
    stopFallingWords();
    typingInput.disabled = true;
    fallingWordDiv.textContent = 'Test Complete!';
    endTestBtn.style.display = 'inline-block';

    const finalWPM = wpmDisplay.textContent.split(' ')[1];
    const finalAccuracy = accuracyDisplay.textContent.split(' ')[1];

    testReport.style.display = 'block';
    testReport.textContent = `Final Words Per Minute: ${finalWPM}\nFinal Accuracy: ${finalAccuracy}\nWords Typed: ${currentWordIndex} of ${words.length}`;
  }

  // Initialize start button
  confirmStart.addEventListener('click', () => {
    document.querySelector('.start-panel').style.display = 'none';
    startTypingTest();
  });
});
