let lastTimestamp = 0;
const frameRate = 60;
const frameInterval = 1000 / frameRate;
let trashInterval;

let points = 0;
let currentGravity = 5;
let currentSpawnInterval = 2000;
let currentTrashPerSpawn = 1;
let gameActive = true;
let gameStarted = false;
let timer = 120;

document.addEventListener("DOMContentLoaded", function() {
    const player = JSON.parse(localStorage.getItem("singlePlayer"));
    
    if (!player) {
        alert("Errore nel caricamento dati!");
        window.location.href = "singlePlayer.html";
        return;
    }

    // Configurazioni per i diversi tipi di rifiuti
    const pitchBackgrounds = {
        "images/organic_logo.png": "images/organic_pitch_large.jpg",
        "images/plastic_logo.png": "images/plastic_pitch_large.jpg",
        "images/paper_logo.png": "images/paper_pitch_large.jpg"
    };

    const northGradients = {
        "images/organic_logo.png": "#566142",
        "images/plastic_logo.png": "#2f425b",
        "images/paper_logo.png": "#724f3d"
    };

    const binImages = {
        "images/organic_logo.png": "images/organic_bin.png",
        "images/plastic_logo.png": "images/plastic_bin.png",
        "images/paper_logo.png": "images/paper_bin.png"
    };

    const trashItems = {
        organic: "images/organic_trash_1.png",
        paper: "images/paper_trash_1.png",
        plastic: "images/plastic_trash_1.png"
    };

    const playerCategory = {
        "images/organic_logo.png": "organic",
        "images/paper_logo.png": "paper",
        "images/plastic_logo.png": "plastic"
    }[player.logo];

    // Imposta elementi UI
    document.getElementById("playerName").textContent = player.name;
    document.getElementById("playerPoints").textContent = points;
    document.getElementById("playerLogo").innerHTML = `<img src="${player.logo}" alt="Player Logo">`;
    document.getElementById("north").style.background = northGradients[player.logo];
    document.getElementById("pitch").style.backgroundImage = `url(${pitchBackgrounds[player.logo]})`;

    // Crea cestino
    const pitch = document.getElementById("pitch");
    pitch.style.position = "relative";
    const bin = createBinElement(binImages[player.logo], pitch);
    
    // Variabili di movimento
    const moveSpeed = 20;
    let binPosition = pitch.clientWidth / 2 - 60; // 60 è metà della larghezza del cestino
    const binWidth = 120;
    const leftLimit = 0;
    const rightLimit = pitch.clientWidth - binWidth;

    // Sistema di input migliorato
    const keysPressed = {
        a: false,
        d: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    document.addEventListener("keydown", (event) => {
        if (event.key in keysPressed) {
            keysPressed[event.key] = true;
        }
    });

    document.addEventListener("keyup", (event) => {
        if (event.key in keysPressed) {
            keysPressed[event.key] = false;
        }
    });

    // Mostra il countdown iniziale
    showStartCountdown();

    function gameLoop(timestamp) {
        if (!gameActive || !gameStarted) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // Controllo del frame rate
        if (timestamp - lastTimestamp >= frameInterval) {
            if ((keysPressed["a"] || keysPressed["ArrowLeft"]) && binPosition > leftLimit) {
                binPosition = Math.max(leftLimit, binPosition - moveSpeed);
            }
            if ((keysPressed["d"] || keysPressed["ArrowRight"]) && binPosition < rightLimit) {
                binPosition = Math.min(rightLimit, binPosition + moveSpeed);
            }
            
            bin.style.left = `${binPosition}px`;
            lastTimestamp = timestamp;
        }
        
        requestAnimationFrame(gameLoop);
    }

    gameLoop(); // Avvia il game loop

    // Countdown iniziale
    function showStartCountdown() {
        const countdownContainer = document.createElement("div");
        countdownContainer.id = "startCountdown";
        countdownContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: 'Righteous', sans-serif;
        `;

        const countdownText = document.createElement("div");
        countdownText.style.cssText = `
            font-size: 120px;
            color: white;
            text-align: center;
        `;
        countdownText.textContent = "3";
        countdownContainer.appendChild(countdownText);
        document.body.appendChild(countdownContainer);

        let count = 3;
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownText.textContent = count.toString();
            } else {
                countdownText.textContent = "VIA!";
                setTimeout(() => {
                    document.body.removeChild(countdownContainer);
                    gameStarted = true;
                    startGame();
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }

    // Avvia il gioco dopo il countdown
    function startGame() {
        updateTimerDisplay();
    const countdown = setInterval(() => {
        if (!gameStarted) return;
        
        timer--;
        updateTimerDisplay();
        
        if (timer <= 0) {
            clearInterval(countdown);
            showVictoryScreen();
        }
    }, 1000);

    // Avvia lo spawn dei rifiuti (usa la variabile globale)
    trashInterval = setInterval(() => {
        if (!gameStarted) return;
        spawnTrash();
    }, currentSpawnInterval);

        // Avvia l'aumento di difficoltà
        setInterval(() => {
            if (!gameStarted) return;
            if (currentGravity < 20) currentGravity += 1;
        }, 15000);

        setInterval(() => {
            if (!gameStarted) return;
            if (currentTrashPerSpawn < 4) currentTrashPerSpawn += 1;
        }, 30000);
    }

    // Gestione rifiuti
    function getRandomTrashCategory() {
        const randomValue = Math.random();
        
        if (randomValue < 0.33) {
            return "organic";
        } else if (randomValue < 0.66) {
            return "paper";
        } else {
            return "plastic";
        }
    }

    function createTrash(category, leftPosition) {
        if (!gameStarted) return;
        
        let trash = document.createElement("img");
        trash.src = trashItems[category];
        trash.style.width = "70px";
        trash.style.height = "auto";
        trash.style.position = "absolute";
        trash.style.top = "0px";
        trash.style.left = `${leftPosition}px`;
        pitch.appendChild(trash);
    
        function fall() {
            if (!gameActive || !gameStarted) return;
            
            let trashPos = parseInt(trash.style.top) + currentGravity;
            let binRect = bin.getBoundingClientRect();
            let pitchRect = pitch.getBoundingClientRect();
            
            let trashRect = {
                left: pitchRect.left + parseInt(trash.style.left),
                right: pitchRect.left + parseInt(trash.style.left) + 70,
                top: pitchRect.top + trashPos,
                bottom: pitchRect.top + trashPos + 70
            };
    
            // Collisione con il cestino
            if (trashRect.bottom >= binRect.top && trashRect.top <= binRect.bottom &&
                trashRect.right >= binRect.left && trashRect.left <= binRect.right) {
                
                if (playerCategory === category) {
                    points += 10;
                } else {
                    points = Math.max(0, points - 5);
                }
                
                updateScore();
                pitch.removeChild(trash);
                return;
            }
    
            // Oggetto mancato
            if (trashPos >= pitch.clientHeight - 70) {
                if (playerCategory === category) {
                    points = Math.max(0, points - 5);
                    updateScore();
                }
                
                pitch.removeChild(trash);
                return;
            }
    
            trash.style.top = `${trashPos}px`;
            requestAnimationFrame(fall);
        }
    
        requestAnimationFrame(fall);
    }

    function isPositionValid(newLeft, existingTrash, minDistance = 80) {
        return !existingTrash.some(trash => {
            const trashLeft = parseInt(trash.style.left);
            return Math.abs(trashLeft - newLeft) < minDistance;
        });
    }
    
    function spawnTrash() {
        if (!gameActive || !gameStarted) return;
        
        const existingTrash = Array.from(pitch.children)
            .filter(el => el !== bin && el.tagName === "IMG");
        
        for (let i = 0; i < currentTrashPerSpawn; i++) {
            let attempts = 0;
            let newLeft;
            let validPosition = false;
            
            while (attempts < 10 && !validPosition) {
                newLeft = Math.random() * (pitch.clientWidth - 70);
                validPosition = isPositionValid(newLeft, existingTrash);
                attempts++;
            }
            
            createTrash(getRandomTrashCategory(), newLeft);
        }
    }

    // Funzioni helper
    function createBinElement(binSrc, pitch) {
        let bin = document.createElement("img");
        bin.src = binSrc;
        bin.style.width = "120px";
        bin.style.height = "auto";
        bin.style.position = "absolute";
        bin.style.bottom = "10%";
        bin.style.left = `${pitch.clientWidth / 2 - 60}px`;
        pitch.appendChild(bin);
        return bin;
    }

    function updateTimerDisplay() {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function updateScore() {
        document.getElementById("playerPoints").textContent = points;
    }

    function showVictoryScreen() {
        gameActive = false;
    gameStarted = false;
    clearInterval(trashInterval);

    // Crea la schermata di vittoria
    const victoryScreen = document.createElement("div");
    victoryScreen.id = "victoryScreen";
    victoryScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        animation: fadeIn 0.5s ease-out forwards;
    `;

    const victoryContent = document.createElement("div");
    victoryContent.id = "victoryContent";
    victoryContent.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    `;
        
        const winnerLogo = document.createElement("img");
        winnerLogo.id = "winnerLogo";
        winnerLogo.src = player.logo;
        winnerLogo.alt = "Winner Logo";
        
        const winnerText = document.createElement("div");
        winnerText.id = "winnerText";
        winnerText.textContent = "PUNTEGGIO FINALE";
        
        const finalScore = document.createElement("div");
        finalScore.id = "finalScore";
        finalScore.textContent = `${player.name.toUpperCase()} - ${points} PUNTI`;
        
        const backButton = document.createElement("button");
        backButton.id = "backButton";
        backButton.textContent = "TORNA AL MENU";
        backButton.addEventListener("click", () => {
            // Rimuovi la schermata di vittoria
            const victoryScreen = document.getElementById("victoryScreen");
            if (victoryScreen) {
                document.body.removeChild(victoryScreen);
            }
            // Ripristina lo scroll
            document.body.style.overflow = "auto";
            window.location.href = "index.html";
        });
        
        const style = document.createElement("style");
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideIn {
            from { transform: translateY(50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Aggiungi animazioni agli elementi
    winnerLogo.style.animation = "slideIn 0.5s ease-out 0.3s forwards";
    winnerText.style.animation = "slideIn 0.5s ease-out 0.5s forwards";
    finalScore.style.animation = "slideIn 0.5s ease-out 0.7s forwards";
    backButton.style.animation = "slideIn 0.5s ease-out 0.9s forwards";

    victoryContent.appendChild(winnerLogo);
    victoryContent.appendChild(winnerText);
    victoryContent.appendChild(finalScore);
    victoryContent.appendChild(backButton);
    victoryScreen.appendChild(victoryContent);
    document.body.appendChild(victoryScreen);
    
    // Blocca lo scroll
    document.body.style.overflow = "hidden";
    }

    // Aggiorna posizione cestino al resize
    window.addEventListener('resize', () => {
        binPosition = Math.min(Math.max(leftLimit, binPosition), pitch.clientWidth - binWidth);
        bin.style.left = `${binPosition}px`;
    });
});