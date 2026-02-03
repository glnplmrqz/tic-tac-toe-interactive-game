// Default configuration
const defaultConfig = {
    game_title: "Tic-Tac-Toe Game",
    game_subtitle: "Find the correct answer in every question to make your move!",
    player_x_name: "Player X",
    player_o_name: "Player O"
};

// Game State
const state = {
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    gameOver: false,
    scoreX: 0,
    scoreO: 0,
    selectedAnswer: null,
    currentQuestion: null,
    currentSquare: null,
    maxWins: 2
};

// CRM Questions Database
const questions = [
    {
        question: "What does CRM stand for?",
        options: ["Customer Relationship Management", "Customer Resource Marketing", "Client Retention Method", "Consumer Report Management"],
        correct: 0
    },
    {
        question: "What is the main goal of CRM?",
        options: ["Maximize profits only", "Manage and improve customer relationships", "Reduce employee costs", "Increase product prices"],
        correct: 1
    },
    {
        question: "Which of these is a key CRM benefit?",
        options: ["It replaces all employees", "It tracks and analyzes customer interactions", "It automatically makes sales", "It guarantees 100% customer loyalty"],
        correct: 1
    },
    {
        question: "What type of data does CRM software store?",
        options: ["Only financial records", "Customer contact info, purchase history, and interactions", "Employee schedules only", "Warehouse inventory only"],
        correct: 1
    },
    {
        question: "What is cross-selling?",
        options: ["Selling products only through online channels", "Selling products at discounted prices", "Selling customers a wider range of products and services", "Selling products only to new customers"],
        correct: 2
    },
    {
        question: "How does CRM help with sales?",
        options: ["Makes products cheaper", "Tracks sales pipeline and identifies opportunities", "Delivers products faster", "Designs new products"],
        correct: 1
    },
    {
        question: "Why does the application select backup channels in cross-channel optimization?",
        options: ["To reduce campaign costs", "To ensure completion when a channel's capacity is exceeded", "To avoid using predictive analytics", "To focus only on high-value customers"],
        correct: 1
    },
    {
        question: "What is 'one-to-one marketing'?",
        options: ["Sending the same email to everyone", "Personalizing messages for individual customers", "Marketing to only one customer", "Using only one marketing channel"],
        correct: 1
    },
    {
        question: "How does CRM improve customer service?",
        options: ["By avoiding customer calls", "By providing complete customer history to agents", "By eliminating support staff", "By reducing service hours"],
        correct: 1
    },
    {
        question: "What does channel optimization enable marketers to do?",
        options: ["Anticipate customer responses and calculate campaign revenue", "Reduce the number of campaigns", "Focus only on direct mail campaigns", "Eliminate predictive analytics from marketing"],
        correct: 0
    },
    {
        question: "Which CRM process focuses on marketing?",
        options: ["Customer segmentation and targeting", "Production planning", "Warehouse management", "Staff training"],
        correct: 0
    },
    {
        question: "What does lead scoring help with?",
        options: ["Calculating employee salaries", "Prioritizing sales opportunities", "Managing inventory", "Planning office layouts"],
        correct: 1
    }
];

// Element SDK initialization
if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange: (config) => updateConfig(config),
        mapToCapabilities: () => ({
            recolorables: [],
            borderables: [],
            fontEditable: undefined,
            fontSizeable: undefined
        }),
        mapToEditPanelValues: (config) => new Map([
            ["game_title", config.game_title || defaultConfig.game_title],
            ["game_subtitle", config.game_subtitle || defaultConfig.game_subtitle],
            ["player_x_name", config.player_x_name || defaultConfig.player_x_name],
            ["player_o_name", config.player_o_name || defaultConfig.player_o_name]
        ])
    });
}

// Helper functions
function updateConfig(config) {
    const titleEl = document.getElementById('game-title');
    const subtitleEl = document.getElementById('game-subtitle');
    const playerXNameEl = document.getElementById('player-x-name');
    const playerONameEl = document.getElementById('player-o-name');

    if (titleEl) titleEl.textContent = config.game_title || defaultConfig.game_title;
    if (subtitleEl) subtitleEl.textContent = config.game_subtitle || defaultConfig.game_subtitle;
    if (playerXNameEl) playerXNameEl.textContent = config.player_x_name || defaultConfig.player_x_name;
    if (playerONameEl) playerONameEl.textContent = config.player_o_name || defaultConfig.player_o_name;

    updatePlayerBadges();
}

function getRandomQuestion() {
    return questions[Math.floor(Math.random() * questions.length)];
}

function handleSquareClick(index) {
    if (state.board[index] !== '' || state.gameOver) return;

    state.currentSquare = index;
    state.currentQuestion = getRandomQuestion();
    state.selectedAnswer = null;

    displayQuestion();
    document.getElementById('result-modal').classList.add('hidden');
}

function displayQuestion() {
    const questionEl = document.getElementById('question-text');
    const optionsContainer = document.getElementById('answer-options');

    questionEl.textContent = state.currentQuestion.question;
    optionsContainer.innerHTML = '';

    state.currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.textContent = option;
        button.onclick = () => selectAnswer(index, button);
        optionsContainer.appendChild(button);
    });

    const messageEl = document.getElementById('answer-message');
    messageEl.classList.add('hidden');
    document.getElementById('submit-btn').disabled = false;
}

function selectAnswer(index, buttonElement) {
    document.querySelectorAll('.answer-option').forEach(btn => btn.classList.remove('selected'));
    buttonElement.classList.add('selected');
    state.selectedAnswer = index;
}

function submitAnswer() {
    if (state.selectedAnswer === null) {
        const messageEl = document.getElementById('answer-message');
        messageEl.textContent = '⚠️ Please select an answer!';
        messageEl.classList.remove('hidden');
        messageEl.className = 'text-center text-sm mt-3 font-semibold text-orange-600';
        return;
    }

    const isCorrect = state.selectedAnswer === state.currentQuestion.correct;
    const resultModal = document.getElementById('result-modal');
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    const resultEmoji = document.getElementById('result-emoji');
    const playerName = getPlayerName(state.currentPlayer);

    if (isCorrect) {
        state.board[state.currentSquare] = state.currentPlayer;
        updateBoard();

        resultEmoji.textContent = '✅';
        resultTitle.textContent = 'Correct!';
        resultMessage.textContent = `Great job! ${playerName}'s move has been placed.`;

        if (checkWin()) {
            handleWin();
            return;
        }

        if (state.board.every(square => square !== '')) {
            showDraw();
            return;
        }

        switchPlayer();
        updateGameStatus();
        resultModal.classList.remove('hidden');
    } else {
        resultEmoji.textContent = '❌';
        resultTitle.textContent = 'Incorrect!';
        const nextPlayerName = getPlayerName(state.currentPlayer === 'X' ? 'O' : 'X');
        resultMessage.textContent = `Wrong answer! Turn skipped to ${nextPlayerName}.`;

        switchPlayer();
        updateGameStatus();
        resultModal.classList.remove('hidden');
    }
}

function updateBoard() {
    const squares = document.querySelectorAll('.board-square');
    squares.forEach((square, index) => {
        square.textContent = state.board[index];
        square.classList.remove('x', 'o');
        if (state.board[index] === 'X') {
            square.classList.add('x');
        } else if (state.board[index] === 'O') {
            square.classList.add('o');
        }
    });
}

function updateGameStatus() {
    const statusEl = document.getElementById('game-status');
    const playerName = getPlayerName(state.currentPlayer);
    statusEl.textContent = `${playerName}'s Turn - Answer the question!`;
    updatePlayerBadges();
}

function updatePlayerBadges() {
    const playerXBadge = document.getElementById('player-x-badge');
    const playerOBadge = document.getElementById('player-o-badge');

    playerXBadge.classList.remove('active');
    playerOBadge.classList.remove('active');

    if (state.currentPlayer === 'X') {
        playerXBadge.classList.add('active');
    } else {
        playerOBadge.classList.add('active');
    }
}

function checkWin() {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winConditions.some(condition => {
        const [a, b, c] = condition;
        return state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c];
    });
}

function handleWin() {
    const winner = state.currentPlayer;
    
    if (winner === 'X') {
        state.scoreX++;
        document.getElementById('score-x').textContent = state.scoreX;
        
        if (state.scoreX >= state.maxWins) {
            showChampionWinner('X');
            return;
        }
    } else {
        state.scoreO++;
        document.getElementById('score-o').textContent = state.scoreO;
        
        if (state.scoreO >= state.maxWins) {
            showChampionWinner('O');
            return;
        }
    }

    showRoundWinner();
}

function showRoundWinner() {
    state.gameOver = true;
    const gameoverModal = document.getElementById('gameover-modal');
    const winnerText = document.getElementById('winner-text');
    const finalMessage = document.getElementById('final-message');
    const playerName = getPlayerName(state.currentPlayer);

    document.getElementById('winner-emoji').textContent = '🏆';
    winnerText.textContent = `${playerName} Wins the Round!`;
    finalMessage.textContent = `Great job, ${playerName}! You won this round!`;

    gameoverModal.classList.remove('hidden');
}

function showChampionWinner(winner) {
    state.gameOver = true;
    const gameoverModal = document.getElementById('gameover-modal');
    const winnerText = document.getElementById('winner-text');
    const finalMessage = document.getElementById('final-message');
    const playerName = getPlayerName(winner);

    document.getElementById('winner-emoji').textContent = '👑';
    winnerText.textContent = `${playerName} is the Champion!`;
    finalMessage.textContent = `🎉 Congratulations, ${playerName}! You officially won the game with ${state.maxWins} wins! 🎉`;

    // Change button text for champion win
    const playAgainBtn = gameoverModal.querySelector('.btn-primary');
    playAgainBtn.textContent = 'Try Again';
    playAgainBtn.onclick = () => {
        resetEverything();
        gameoverModal.classList.add('hidden');
    };

    gameoverModal.classList.remove('hidden');
}

function showDraw() {
    state.gameOver = true;
    const gameoverModal = document.getElementById('gameover-modal');
    const winnerEmoji = document.getElementById('winner-emoji');
    const winnerText = document.getElementById('winner-text');
    const finalMessage = document.getElementById('final-message');

    winnerEmoji.textContent = '🤝';
    winnerText.textContent = 'It\'s a Draw!';
    finalMessage.textContent = 'Both players did great! The board is full!';

    gameoverModal.classList.remove('hidden');
}

function getPlayerName(player) {
    const id = player === 'X' ? 'player-x-name' : 'player-o-name';
    return document.getElementById(id).textContent;
}

function switchPlayer() {
    state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
}

function closeResultModal() {
    document.getElementById('result-modal').classList.add('hidden');
}

function anotherGame() {
    // IMPORTANT: When a player wins, the OTHER player starts the next game
    // If X won, O starts next. If O won, X starts next.
    // But we're already on the winner, so we need to switch first
    switchPlayer(); // Switch to the other player for next game
    
    resetGameBoard();
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('result-modal').classList.add('hidden');
}

function resetGameBoard() {
    state.board = ['', '', '', '', '', '', '', '', ''];
    state.gameOver = false;
    state.selectedAnswer = null;
    state.currentQuestion = null;
    state.currentSquare = null;

    updateBoard();
    updateGameStatus();
}

function resetGame() {
    // Reset to X starting when using reset button
    state.currentPlayer = 'X';
    resetGameBoard();
    
    // Reset scores
    state.scoreX = 0;
    state.scoreO = 0;
    
    document.getElementById('score-x').textContent = state.scoreX;
    document.getElementById('score-o').textContent = state.scoreO;
    
    document.getElementById('gameover-modal').classList.add('hidden');
    document.getElementById('result-modal').classList.add('hidden');
}

function resetEverything() {
    resetGame();
    
    // Reset the play again button to original state
    const gameoverModal = document.getElementById('gameover-modal');
    const playAgainBtn = gameoverModal.querySelector('.btn-primary');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.onclick = anotherGame;
}

// Initialize game
updateBoard();
updateGameStatus();