const images = ["images/organic_logo.png", "images/plastic_logo.png", "images/paper_logo.png"];
let currentIndex = 0;

// Effetti sonori
const clickSound = new Audio("audios/click_4.mp3");
const selectSound = new Audio("audios/select_1.mp3");
const readySound = new Audio("audios/ready_sound.mp3"); // Aggiungi un file audio per il "pronto"

// Imposta il volume degli effetti sonori
clickSound.volume = 0.7;
selectSound.volume = 0.7;
readySound.volume = 0.7;

function Player(name, logo) {
    this.name = name;
    this.logo = logo;
}

// Funzione per aggiornare l'immagine del logo
function updateImage() {
    document.getElementById("teamLogo").src = images[currentIndex];
}

// Funzione per passare al logo successivo
function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
    selectSound.currentTime = 0; // Resetta l'audio per riprodurlo immediatamente
    selectSound.play();
}

// Funzione per passare al logo precedente
function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
    selectSound.currentTime = 0; // Resetta l'audio per riprodurlo immediatamente
    selectSound.play();
}

// Funzione per avviare il gioco
function startGame() {
    const input = document.getElementById("playerInput");
    const button = document.getElementById("playButton");
    const selectedLogo = images[currentIndex];

    // Riproduci il suono del click
    clickSound.currentTime = 0;
    clickSound.play();

    // Validazione nome vuoto
    if (input.value.trim() === "") {
        alert("Il campo nome è vuoto");
        return;
    }

    // Riproduci suono di "pronto"
    readySound.currentTime = 0;
    readySound.play();

    // Cambia stile del pulsante e input quando si avvia il gioco
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

    // Crea il giocatore e salva i dati
    const player = new Player(input.value.trim(), selectedLogo);
    localStorage.setItem("singlePlayer", JSON.stringify(player));

    // Passa alla schermata di gioco dopo 1 secondo
    setTimeout(() => {
        window.location.href = "singlePlayerGame.html";
    }, 1000);
}

// Aggiungi event listener per il suono di selezione sull'input
document.getElementById('playerInput').addEventListener('focus', () => {
    selectSound.currentTime = 0;
    selectSound.play();
});

// Aggiungi event listener per il suono di selezione sulle frecce
document.querySelectorAll('.buttonArrow').forEach(button => {
    button.addEventListener('click', () => {
        // Il suono viene già riprodotto nelle funzioni nextImage e prevImage
    });
});

// Aggiungi event listener per il tasto Enter sull'input
document.getElementById('playerInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startGame();
    }
});