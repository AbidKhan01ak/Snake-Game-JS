const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const pauseResumeButton = document.querySelector(".pause-resume");

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;
let isPaused = false;
let gameSpeed = 100;

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
    // Passing a random 1 - 30 value as food position
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
}

const handleGameOver = () => {
    clearInterval(setIntervalId);
    // Display the modal
    const modal = document.getElementById("gameOverModal");
    const closeButton = document.querySelector(".close-button");
    const currentScoreElement = document.getElementById("currentScore");
    const highScoreElement = document.getElementById("highScore");
    // Set modal content
    currentScoreElement.textContent = `Your Score: ${score}`;
    highScoreElement.textContent = `High Score: ${highScore}`;
    modal.style.display = "block";
    // Close modal when the close button is clicked
    closeButton.addEventListener("click", () => {
        modal.style.display = "none";
        location.reload(); // Restart the game
    });
}

const changeDirection = e => {
    if (isPaused) return;
    // Changing velocity value based on key press
    if (e.key === "ArrowUp" && velocityY != 1) {
        velocityX = 0;
        velocityY = -1;
    } else if (e.key === "ArrowDown" && velocityY != -1) {
        velocityX = 0;
        velocityY = 1;
    } else if (e.key === "ArrowLeft" && velocityX != 1) {
        velocityX = -1;
        velocityY = 0;
    } else if (e.key === "ArrowRight" && velocityX != -1) {
        velocityX = 1;
        velocityY = 0;
    }
}

// Calling changeDirection on each key click and passing key dataset value as an object
controls.forEach(button => button.addEventListener("click", () => changeDirection({ key: button.dataset.key })));

const togglePauseResume = () => {
    if (isPaused) {
        setIntervalId = setInterval(initGame, gameSpeed);
        pauseResumeButton.innerText = "Pause";
    } else {
        clearInterval(setIntervalId);
        pauseResumeButton.innerText = "Resume";
    }
    isPaused = !isPaused;
}
// Add event listener for the "Space" key
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); // Prevent scrolling on space key
        togglePauseResume();
    }
});
pauseResumeButton.addEventListener('click', togglePauseResume);

const initGame = () => {
    if (gameOver) return handleGameOver();
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // Checking if the snake hit the food
    if (snakeX === foodX && snakeY === foodY) {
        updateFoodPosition();
        snakeBody.push([foodY, foodX]); // Pushing food position to snake body array
        score++; // increment score by 1
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score", highScore);
        scoreElement.innerText = `Score: ${score}`;
        highScoreElement.innerText = `High Score: ${highScore}`;

        if (gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(setIntervalId);
            setIntervalId = setInterval(initGame, gameSpeed);
        }
    }
    // Updating the snake's head position based on the current velocity
    snakeX += velocityX;
    snakeY += velocityY;

    // Shifting forward the values of the elements in the snake body by one
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    snakeBody[0] = [snakeX, snakeY]; // Setting first element of snake body to current snake position

    // Checking if the snake's head is out of wall, if so setting gameOver to true
    if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
        return gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        // Adding a div for each part of the snake's body
        html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        // Checking if the snake head hit the body, if so set gameOver to true
        if (i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]) {
            gameOver = true;
        }
    }
    playBoard.innerHTML = html;
}

updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);

// Add swipe controls using Hammer.js
const hammer = new Hammer(playBoard);
hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
hammer.on("swipeup", () => changeDirection({ key: "ArrowUp" }));
hammer.on("swipedown", () => changeDirection({ key: "ArrowDown" }));
hammer.on("swipeleft", () => changeDirection({ key: "ArrowLeft" }));
hammer.on("swiperight", () => changeDirection({ key: "ArrowRight" }));