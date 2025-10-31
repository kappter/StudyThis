document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const startModal = document.getElementById('startModal'); // Optional, if you have modal overlay
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

  // Example vocab, replace with uploaded vocab from your system
  const words = [
    { word: 'Algorithm', definition: 'A set of rules to solve a problem' },
    { word: 'Loop', definition: 'A structure that repeats code' },
    { word: 'Variable', definition: 'A storage location in memory' },
    { word: 'Function', definition: 'A reusable code block' },
  ];

  // Typing test variables
  let currentWordIndex = 0;
  let totalTypedChars = 0;
  let correctTypedChars = 0;
  let startTime = null;
  const testDuration = 60; // seconds
  let timerInterval = null;
  let animationRequest = null;
  let pos = 0;
  const animationSpeed = 1; // pixels moved per frame
  const pauseDuration = 1500; // ms pause at bottom

  // Utility to create underscore word with first letter shown
  function createUnderscores(word) {
    return word[0] + '_'.repeat(word.length - 1);
  }

  function displayWordAndDefinition() {
    const currentWord = words[currentWordIndex];
    fallingWordDiv.textContent = createUnderscores(currentWord.word);
    definitionDiv.textContent = currentWord.definition;
    pos = 0; // reset position
    fallingWordDiv.style.top = pos + 'px';
  }

  // Falling animation, recursive with pause
  function fall() {
    const containerHeight = fallingContainer.clientHeight;
    pos += animationSpeed;
    fallingWordDiv.style.top = pos + 'px';

    if (pos < containerHeight - 40) {
      animationRequest = requestAnimationFrame(fall);
    } else {
      // Pause at bottom, then move to next word
      setTimeout(() => {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        displayWordAndDefinition();
        animationRequest = requestAnimationFrame(fall);
      }, pauseDuration);
    }
  }

  // Start the falling animation
  function startFallingWords() {
    currentWordIndex = 0;
    displayWordAndDefinition();
    animationRequest = requestAnimationFrame(fall);
  }

  // Stop falling animation
  function stopFallingWords() {
    if (animationRequest) cancelAnimationFrame(animationRequest);
  }

  // Typing test logic similar to previous demos
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

    displayWordAndDefinition();
    startFallingWords();

    updateStats(0, 100, testDuration);
    typingInput.focus();

    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = testDuration - elapsed;

      if (timeLeft <= 0) {
        endTypingTest();
      } else {
        timeDisplay.textContent = `Time Left: ${timeLeft}s`;
      }
    }, 500);
  }

  function updateStats(wpm, accuracy, timeLeft) {
    wpmDisplay.textContent = `WPM: ${wpm}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy.toFixed(1)}%`;
    timeDisplay.textContent = `Time Left: ${timeLeft}s`;
  }

  typingInput.addEventListener('input', () => {
    const currentWord = words[currentWordIndex].word;
    const typed = typingInput.value;

    totalTypedChars++;
    let correctCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === currentWord[i]) correctCount++;
    }
    correctTypedChars += correctCount - (correctTypedChars > 0 ? correctTypedChars : 0);

    if (typed === currentWord) {
      typingInput.value = '';
      // Go to next word & reset animation
      currentWordIndex++;
      if (currentWordIndex >= words.length) {
        endTypingTest();
        return;
      }
      stopFallingWords();
      displayWordAndDefinition();
      startFallingWords();
    }

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

  // Start test on confirm start button click
  confirmStart.addEventListener('click', () => {
    // Hide start panel content (if using modal, adjust accordingly)
    document.querySelector('.start-panel').style.display = 'none';
    startTypingTest();
  });
});
