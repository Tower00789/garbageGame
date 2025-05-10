const images = ["images/organic_logo.png", "images/plastic_logo.png", "images/paper_logo.png"];
let currentIndex = [0, 0];
let statusPlayer = [false, false];
let selectedLogos = [null, null];

// Effetti sonori
const clickSound = new Audio("audios/click_4.mp3");
const selectSound = new Audio("audios/select_1.mp3");

// Imposta il volume degli effetti sonori
clickSound.volume = 0.7;
selectSound.volume = 0.7;

function Player(name, logo) {
    this.name = name;
    this.logo = logo;
}

let players = [null, null];

// Funzione per aggiornare l'immagine del logo
function updateImage(player) {
    document.querySelectorAll(".teamLogo")[player].src = images[currentIndex[player]];
}

// Funzione per passare al logo successivo
function nextImage(player) {
    if (statusPlayer[player]) return;
    currentIndex[player] = (currentIndex[player] + 1) % images.length;
    updateImage(player);
    selectSound.currentTime = 0; // Resetta l'audio per riprodurlo immediatamente
    selectSound.play();
}

// Funzione per passare al logo precedente
function prevImage(player) {
    if (statusPlayer[player]) return;
    currentIndex[player] = (currentIndex[player] - 1 + images.length) % images.length;
    updateImage(player);
    selectSound.currentTime = 0; // Resetta l'audio per riprodurlo immediatamente
    selectSound.play();
}

// Funzione per gestire lo stato "pronto" del giocatore
function getReady(player) {
    const button = document.getElementById(`buttonReady${player + 1}`);
    const input = document.getElementById(`input${player + 1}`);
    const selectedLogo = images[currentIndex[player]];

    // Riproduci il suono del click
    clickSound.currentTime = 0;
    clickSound.play();

    // Validazione nome vuoto
    if (input.value.trim() === "") {
        alert(`Il campo nome del giocatore ${player + 1} è vuoto`);
        return false;
    }

    // Validazione nomi uguali
    const otherPlayerInput = document.getElementById(`input${player === 0 ? 2 : 1}`);
    if (input.value.trim().toLowerCase() === otherPlayerInput.value.trim().toLowerCase()) {
        alert("I nomi dei due giocatori non possono essere uguali!");
        return false;
    }

    // Validazione logo già selezionato
    if (selectedLogos[player] === null) {
        if (selectedLogos.includes(selectedLogo)) {
            alert("Questo logo è già stato scelto da un altro giocatore. Scegli un altro logo.");
            return false;
        } else {
            selectedLogos[player] = selectedLogo;
        }
    }

    statusPlayer[player] = !statusPlayer[player];

    if (statusPlayer[player]) {
        // Stile quando pronto
        button.style.background = "rgba(255, 255, 255, 0.1)";
        button.style.backdropFilter = "blur(10px)";
        button.style.fontSize = "45px";
        button.style.transitionDuration = "1s";
        input.style.background = "rgba(255, 255, 255, 0.1)";
        input.style.backdropFilter = "blur(10px)";
        input.style.width = "460px";
        input.style.height = "60px";
        input.style.transitionDuration = "1s";
        input.style.fontSize = "40px";
        input.disabled = true;

        players[player] = new Player(input.value.trim(), selectedLogo);
    } else {
        // Stile quando non pronto
        button.style.backgroundImage = "linear-gradient(#004aad, #5de0e6)";
        button.style.fontSize = "40px";
        button.style.transitionDuration = "1s";
        button.style.backdropFilter = "none";
        input.style.background = "transparent";
        input.style.backdropFilter = "none";
        input.style.width = "450px";
        input.style.height = "50px";
        input.style.fontSize = "30px";
        input.disabled = false;

        players[player] = null;
        selectedLogos[player] = null;
    }

    // Controlla se entrambi sono pronti
    if (statusPlayer[0] && statusPlayer[1]) {
        // Verifica finale per sicurezza
        if (players[0].name.toLowerCase() === players[1].name.toLowerCase()) {
            alert("I nomi dei due giocatori non possono essere uguali!");
            // Resetta entrambi i giocatori
            resetPlayer(0);
            resetPlayer(1);
            return false;
        }

        // Salva i dati dei giocatori nel localStorage
        localStorage.setItem("player1", JSON.stringify(players[0]));
        localStorage.setItem("player2", JSON.stringify(players[1]));
        localStorage.setItem("selectedLogos", JSON.stringify(selectedLogos));

        // Passa alla schermata di gioco dopo 1 secondo
        setTimeout(() => {
            window.location.href = "multiplayerGame.html";
        }, 1000);
    }
    
    return true;
}

// Funzione per resettare lo stato del giocatore
function resetPlayer(player) {
    const button = document.getElementById(`buttonReady${player + 1}`);
    const input = document.getElementById(`input${player + 1}`);
    
    statusPlayer[player] = false;
    players[player] = null;
    selectedLogos[player] = null;
    
    button.style.backgroundImage = "linear-gradient(#004aad, #5de0e6)";
    button.style.fontSize = "40px";
    button.style.backdropFilter = "none";
    input.style.background = "transparent";
    input.style.backdropFilter = "none";
    input.style.width = "450px";
    input.style.height = "50px";
    input.style.fontSize = "30px";
    input.disabled = false;
}

// Aggiungi event listener per il suono di selezione sugli input
document.querySelectorAll('.nameInput').forEach(input => {
    input.addEventListener('focus', () => {
        selectSound.currentTime = 0;
        selectSound.play();
    });
});

// Aggiungi event listener per il suono di selezione sulle frecce
document.querySelectorAll('.buttonArrow').forEach(button => {
    button.addEventListener('click', () => {
        // Il suono viene già riprodotto nelle funzioni nextImage e prevImage
    });
});