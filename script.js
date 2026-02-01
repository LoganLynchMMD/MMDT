let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let username = "";
let timerInterval;
let timeLeft = 30;
let maxPoints = 100; // Base points per question
let currentPotentialPoints = 100;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const movieImg = document.getElementById('movie-img');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('current-score');
const potentialDisplay = document.getElementById('potential-points');

// 1. Fetch JSON Data
 async function loadQuestions() {
    try {
        const response = await fetch('./questions.json');
        questions = await response.json();
    } catch (error) {
        console.error("Could not load questions:", error);
        alert("Error loading game data. Please check console.");
    }
}

// 2. Start Game
document.getElementById('start-btn').addEventListener('click', () => {
    username = document.getElementById('username').value.trim();
    if (!username) {
        alert("Please enter a username!");
        return;
    }
    showScreen(gameScreen);
    startGame();
});

function startGame() {
    currentQuestionIndex = 0;
    score = 0;
    updateScoreDisplay();
    loadNextQuestion();
}

function loadNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    // Reset Timer and Points
    clearInterval(timerInterval);
    timeLeft = 30;
    currentPotentialPoints = questions[currentQuestionIndex].maxPoints || 100;
    
    // Display Question Data
    const q = questions[currentQuestionIndex];
    questionText.textContent = q.question;
    movieImg.src = q.image;
    
    // Generate Buttons
    optionsContainer.innerHTML = '';
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.classList.add('option-btn');
        btn.onclick = () => checkAnswer(opt);
        optionsContainer.appendChild(btn);
    });

    startTimer();
}

// 3. Timer & Scoring Logic
function startTimer() {
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        calculatePotentialPoints();
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Time out - 0 points, move to next
            currentQuestionIndex++;
            loadNextQuestion();
        }
    }, 1000);
}

function calculatePotentialPoints() {
    // Formula: Points decrease linearly over 30 seconds
    // But minimum is 5 IF you answer correctly.
    // If time hits 0, you get 0.
    
    const max = questions[currentQuestionIndex].maxPoints || 100;
    const decayPerSecond = max / 30; 
    
    // Current points based on time elapsed
    let calcPoints = Math.floor(max - ((30 - timeLeft) * decayPerSecond));
    
    // Ensure it doesn't drop below 5 while timer is running
    if (calcPoints < 5) calcPoints = 5;
    
    currentPotentialPoints = calcPoints;
    potentialDisplay.textContent = `Points for this Q: ${currentPotentialPoints}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = `Time: ${timeLeft}`;
}

function updateScoreDisplay() {
    scoreDisplay.textContent = `Score: ${score}`;
}

// 4. Check Answer
function checkAnswer(selectedOption) {
    clearInterval(timerInterval); // Stop timer immediately
    
    const correct = questions[currentQuestionIndex].answer;
    
    if (selectedOption === correct) {
        // Award the calculated points (minimum 5)
        score += currentPotentialPoints;
    } else {
        // Wrong answer gets 0 points
    }

    updateScoreDisplay();
    currentQuestionIndex++;
    loadNextQuestion();
}

// 5. End Game & Leaderboard
function endGame() {
    showScreen(endScreen);
    document.getElementById('final-score').textContent = score;
    saveScore(username, score);
    displayLeaderboard();
}

function saveScore(user, points) {
    // Get existing scores from LocalStorage
    let scores = JSON.parse(localStorage.getItem('movieTriviaScores')) || [];
    scores.push({ user, points });
    
    // Sort by points (highest first)
    scores.sort((a, b) => b.points - a.points);
    
    // Save back to LocalStorage
    localStorage.setItem('movieTriviaScores', JSON.stringify(scores));
}

function displayLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('movieTriviaScores')) || [];

    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${entry.user}</span> <span>${entry.points} pts</span>`;
        list.appendChild(li);
    });
}

document.getElementById('restart-btn').addEventListener('click', () => {
    showScreen(loginScreen);
});

// Helper to switch screens
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// Init

//loadQuestions();
