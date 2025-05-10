let pointP1 = 0;
let pointP2 = 0;
let currentGravity = 5;
let currentSpawnInterval = 2000;
let currentTrashPerSpawn = 1;
let gameActive = true;
let gameStarted = false;
let timer = 120;
let trashInterval;

document.addEventListener("DOMContentLoaded", function () {
    const player1 = JSON.parse(localStorage.getItem("player1"));
    const player2 = JSON.parse(localStorage.getItem("player2"));
    const selectedLogos = JSON.parse(localStorage.getItem("selectedLogos"));
    
    if (!player1 || !player2) {
        alert("Errore nel caricamento dati!");
        window.location.href = "multiplayer.html";
        return;
    }

    // Configurazioni per i diversi tipi di rifiuti
    const pitchBackgrounds = {
        "images/organic_logo.png": "images/organic_square.png",
        "images/plastic_logo.png": "images/plastic_square.png",
        "images/paper_logo.png": "images/paper_square.png"
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
        organic: [
            "images/organic_trash_1.png",
            "images/organic_trash_2.png",
            "images/organic_trash_3.png"
        ],
        paper: [
            "images/paper_trash_1.png",
            "images/paper_trash_2.png",
            "images/paper_trash_3.png"
        ],
        plastic: [
            "images/plastic_trash_1.png",
            "images/plastic_trash_2.png",
            "images/plastic_trash_3.png"
        ]
    };

    const playerCategories = {
        "images/organic_logo.png": "organic",
        "images/paper_logo.png": "paper",
        "images/plastic_logo.png": "plastic"
    };

    // Imposta elementi UI
    document.getElementById("nameP1").textContent = player1.name;
    document.getElementById("nameP2").textContent = player2.name;
    document.getElementById("pfpP1").innerHTML = `<img src="${player1.logo}" style="width:85px; height:85px;">`;
    document.getElementById("pfpP2").innerHTML = `<img src="${player2.logo}" style="width:85px; height:85px;">`;
    document.getElementById("pointP1").textContent = pointP1;
    document.getElementById("pointP2").textContent = pointP2;

    // Stili UI
    ["nameP1", "nameP2", "pointP1", "pointP2", "timer"].forEach(id => {
        const el = document.getElementById(id);
        el.style.color = "white";
        el.style.textTransform = "uppercase";
        el.style.fontSize = "40px";
        el.style.textAlign = "center";
    });

    // Imposta sfondi
    document.getElementById("pitchP1").style.backgroundImage = `url(${pitchBackgrounds[player1.logo]})`;
    document.getElementById("pitchP2").style.backgroundImage = `url(${pitchBackgrounds[player2.logo]})`;
    document.getElementById("north").style.background = `linear-gradient(to right, ${northGradients[player1.logo]}, ${northGradients[player2.logo]})`;

    // Inizializza pitch
    const pitchP1 = document.getElementById("pitchP1");
    const pitchP2 = document.getElementById("pitchP2");
    pitchP1.style.position = "relative";
    pitchP2.style.position = "relative";

    // Crea cestini
    const binP1 = createBinElement(binImages[player1.logo], pitchP1);
    const binP2 = createBinElement(binImages[player2.logo], pitchP2);

    // Variabili di movimento
    const moveSpeed = 10;
    let binP1Pos, binP2Pos;
    let leftLimitP1, rightLimitP1, leftLimitP2, rightLimitP2;

    // Inizializza limiti e posizioni
    updateLimits();

    // Sistema di input
    const keysPressed = {
        a: false,
        d: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    document.addEventListener("keydown", function (event) {
        if (event.key in keysPressed) {
            keysPressed[event.key] = true;
        }
    });

    document.addEventListener("keyup", function (event) {
        if (event.key in keysPressed) {
            keysPressed[event.key] = false;
        }
    });

    // Mostra il countdown iniziale
    showStartCountdown();

    // Game loop
    function gameLoop() {
        if (!gameStarted) {
            requestAnimationFrame(gameLoop);
            return;
        }

        // Movimento Player 1
        if (keysPressed["a"] || keysPressed["A"]) {
            if (binP1Pos - moveSpeed >= leftLimitP1) {
                binP1Pos -= moveSpeed;
            } else {
                binP1Pos = leftLimitP1;
            }
            binP1.style.left = `${binP1Pos}px`;
        }
        if (keysPressed["d"] || keysPressed["D"]) {
            if (binP1Pos + moveSpeed <= rightLimitP1) {
                binP1Pos += moveSpeed;
            } else {
                binP1Pos = rightLimitP1;
            }
            binP1.style.left = `${binP1Pos}px`;
        }

        // Movimento Player 2
        if (keysPressed["ArrowLeft"]) {
            if (binP2Pos - moveSpeed >= leftLimitP2) {
                binP2Pos -= moveSpeed;
            } else {
                binP2Pos = leftLimitP2;
            }
            binP2.style.left = `${binP2Pos}px`;
        }
        if (keysPressed["ArrowRight"]) {
            if (binP2Pos + moveSpeed <= rightLimitP2) {
                binP2Pos += moveSpeed;
            } else {
                binP2Pos = rightLimitP2;
            }
            binP2.style.left = `${binP2Pos}px`;
        }

        requestAnimationFrame(gameLoop);
    }

    // Avvia game loop
    gameLoop();

    // Funzioni helper
    function createBinElement(binSrc, pitch) {
        let bin = document.createElement("img");
        bin.src = binSrc;
        bin.style.width = "120px";
        bin.style.height = "auto";
        bin.style.position = "absolute";
        bin.style.bottom = "10%";
        pitch.appendChild(bin);
        return bin;
    }

    function updateLimits() {
        const binWidth = 120;
        
        // Limiti per il player 1
        const limitsP1 = getPitchLimits(pitchP1, binWidth);
        leftLimitP1 = limitsP1.left;
        rightLimitP1 = limitsP1.right;
        
        // Limiti per il player 2
        const limitsP2 = getPitchLimits(pitchP2, binWidth);
        leftLimitP2 = limitsP2.left;
        rightLimitP2 = limitsP2.right;
        
        // Posiziona i cestini al centro
        binP1Pos = limitsP1.width / 2 - binWidth / 2;
        binP2Pos = limitsP2.width / 2 - binWidth / 2;
        
        binP1.style.left = `${binP1Pos}px`;
        binP2.style.left = `${binP2Pos}px`;
    }

    function getPitchLimits(pitchElement, binWidth) {
        const pitchRect = pitchElement.getBoundingClientRect();
        return {
            left: 0,
            right: pitchRect.width - binWidth,
            width: pitchRect.width
        };
    }

    function updateTimerDisplay() {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        document.getElementById("timer").textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    function showVictoryScreen() {
        gameActive = false;
        gameStarted = false;
        clearInterval(trashInterval);
        
        // Determina il vincitore
        let winner = null;
        let winnerText = "";
        let isDraw = pointP1 === pointP2;
        
        if (!isDraw) {
            winner = pointP1 > pointP2 ? player1 : player2;
            winnerText = `${winner.name.toUpperCase()}`;
        } else {
            winnerText = "PAREGGIO!";
        }
    
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
    
        // Contenitore principale
        const victoryContent = document.createElement("div");
        victoryContent.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            width: 80%;
            max-width: 600px;
            color: white; /* Aggiunto colore bianco per tutto il contenuto */
        `;
    
        // Logo del vincitore o immagine di pareggio
        const centerImage = document.createElement("img");
        if (!isDraw) {
            centerImage.src = winner.logo;
            centerImage.alt = `${winner.name} logo`;
        } else {
            centerImage.src = "images/brr_brr_patapim.png";
            centerImage.alt = "Pareggio";

            const victoryAudio = new Audio("audios/b.mp3");
            victoryAudio.volume = 0.7;
            victoryAudio.play().catch(e => console.log("Audio error:", e));
        }
        centerImage.style.cssText = `
            width: 200px;
            height: 200px;
            object-fit: contain;
            margin-bottom: 30px;
            transform: scale(0);
            animation: logoAppear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        `;
        victoryContent.appendChild(centerImage);
    
        // Testo "VINCITORE" o "PAREGGIO"
        const winnerLabel = document.createElement("div");
        winnerLabel.textContent = isDraw ? "" : "VINCITORE";
        winnerLabel.style.cssText = `
            font-size: 24px;
            margin-bottom: ${isDraw ? "0" : "10px"};
            opacity: 0;
            transform: translateY(20px);
            animation: textAppear 0.5s ease-out 0.3s forwards;
            color: white; /* Testo bianco */
        `;
        victoryContent.appendChild(winnerLabel);
    
        // Nome del vincitore o testo pareggio
        const mainText = document.createElement("h1");
        mainText.textContent = winnerText;
        mainText.style.cssText = `
            font-size: ${isDraw ? "60px" : "48px"};
            margin: 0;
            text-transform: uppercase;
            opacity: 0;
            transform: translateY(20px);
            animation: textAppear 0.5s ease-out 0.5s forwards;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        `;
        victoryContent.appendChild(mainText);
    
        // Punteggi
        const scores = document.createElement("div");
        scores.style.cssText = `
            margin-top: 40px;
            font-size: 24px;
            opacity: 0;
            transform: translateY(20px);
            animation: textAppear 0.5s ease-out 0.7s forwards;
            color: white; /* Testo bianco */
        `;
        scores.innerHTML = `
            <div>${player1.name.toUpperCase()} ${pointP1}</div>
            <div style="margin: 10px 0">${player2.name.toUpperCase()} ${pointP2}</div>
        `;
        victoryContent.appendChild(scores);
    
        // Bottone per tornare al menu
        const backButton = document.createElement("button");
        backButton.textContent = "TORNA AL MENU";
        backButton.style.cssText = `
            margin-top: 40px;
            padding: 15px 30px;
            font-size: 18px;
            background: rgba(255, 255, 255, 0.2);
            color: white; /* Testo bianco */
            border: 2px solid white;
            border-radius: 50px;
            cursor: pointer;
            font-family: 'Righteous', sans-serif;
            opacity: 0;
            animation: textAppear 0.5s ease-out 0.9s forwards;
            transition: all 0.3s ease;
        `;
        backButton.addEventListener("mouseover", () => {
            backButton.style.background = "rgba(255, 255, 255, 0.4)";
        });
        backButton.addEventListener("mouseout", () => {
            backButton.style.background = "rgba(255, 255, 255, 0.2)";
        });
        backButton.addEventListener("click", () => {
            const victoryScreen = document.getElementById("victoryScreen");
            if (victoryScreen) {
                document.body.removeChild(victoryScreen);
            }
            document.body.style.overflow = "auto";
            window.location.href = "index.html";
        });
        victoryContent.appendChild(backButton);
    
        // Aggiungi gli stili CSS per le animazioni
        const style = document.createElement("style");
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes logoAppear {
                0% { transform: scale(0); opacity: 0; }
                80% { transform: scale(1.1); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes textAppear {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    
        victoryScreen.appendChild(victoryContent);
        document.body.appendChild(victoryScreen);
    
        // Blocca lo scroll
        document.body.style.overflow = "hidden";
    }

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
         // Avvia il timer principale
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

    // Avvia lo spawn dei rifiuti usando la variabile globale
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

    function createTrash(pitch, category, existingTrash) {
        if (!gameStarted) return;

        const trashImages = trashItems[category];
        const randomTrashImage = trashImages[Math.floor(Math.random() * trashImages.length)];
        
        let trash = document.createElement("img");
        trash.src = randomTrashImage;  // Usa l'immagine selezionata casualmente
        trash.style.width = "70px";
        trash.style.height = "auto";
        trash.style.position = "absolute";
        trash.style.top = "0px";

        let validPosition = false;
        let trashLeft;
        const pitchWidth = pitch === pitchP1 ? pitchP1.clientWidth : pitchP2.clientWidth;
        
        while (!validPosition) {
            trashLeft = Math.random() * (pitchWidth - 70);
            validPosition = !existingTrash.some(t => Math.abs(parseInt(t.style.left) - trashLeft) < 80);
        }

        trash.style.left = `${trashLeft}px`;
        pitch.appendChild(trash);
        existingTrash.push(trash);

        function fall() {
            if (!gameActive || !gameStarted) return;
            
            let trashPos = parseInt(trash.style.top) + currentGravity;
            let bin = pitch === pitchP1 ? binP1 : binP2;
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
                
                let playerCategory = pitch === pitchP1 ? playerCategories[player1.logo] : playerCategories[player2.logo];
                
                if (playerCategory === category) {
                    pitch === pitchP1 ? pointP1 += 10 : pointP2 += 10;
                } else {
                    pitch === pitchP1 ? pointP1 = Math.max(0, pointP1 - 5) : pointP2 = Math.max(0, pointP2 - 5);
                }
                
                updateScore();
                pitch.removeChild(trash);
                return;
            }
    
            // Oggetto mancato
            if (trashPos >= pitch.clientHeight - 70) {
                let playerCategory = pitch === pitchP1 ? playerCategories[player1.logo] : playerCategories[player2.logo];
                
                if (playerCategory === category) {
                    pitch === pitchP1 ? pointP1 = Math.max(0, pointP1 - 5) : pointP2 = Math.max(0, pointP2 - 5);
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
    
    function updateScore() {
        document.getElementById("pointP1").textContent = pointP1;
        document.getElementById("pointP2").textContent = pointP2;
    }

    function spawnTrash() {
        if (!gameActive || !gameStarted) return;
        let existingTrashP1 = Array.from(pitchP1.children).filter(c => c !== binP1);
        let existingTrashP2 = Array.from(pitchP2.children).filter(c => c !== binP2);

        for (let i = 0; i < currentTrashPerSpawn; i++) {
            createTrash(pitchP1, getRandomTrashCategory(), existingTrashP1);
            createTrash(pitchP2, getRandomTrashCategory(), existingTrashP2);
        }
    }

    // Aggiorna limiti al resize
    window.addEventListener('resize', updateLimits);
});