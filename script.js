const users = {
    "Peza": { password: "123pawel", name: "Paweł Pezowicz", role: "user" },
    "Kuba": { password: "42112312", name: "Jakub Pezowicz", role: "user" },
    "Bartek": { password: "432412321", name: "Bartek Pezowicz", role: "user" },
    "Patryk": { password: "472412321", name: "Patryk Pezowicz", role: "user" },
    "admin": { password: "admin", name: "Prowadzący", role: "admin" }
};

let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || null;
let votes = JSON.parse(localStorage.getItem("votes")) || { za: 0, przeciw: 0, wstrzymuje: 0 };
let votingActive = JSON.parse(localStorage.getItem("votingActive")) || false;
let timer = JSON.parse(localStorage.getItem("timer")) || 0;
let timerRunning = JSON.parse(localStorage.getItem("timerRunning")) || false;

// Logowanie użytkownika
function login() {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;
    const user = users[login];

    if (user && user.password === password) {
        loggedInUser = user;
        sessionStorage.setItem("loggedInUser", JSON.stringify(user));
        showScreen();
    } else {
        document.getElementById("error-msg").innerText = "Błędny login lub hasło!";
    }
}

// Pokaż odpowiedni ekran po zalogowaniu
function showScreen() {
    if (loggedInUser) {
        document.getElementById("login-screen").classList.add("hidden");

        if (loggedInUser.role === "admin") {
            document.getElementById("admin-screen").classList.remove("hidden");
        } else {
            document.getElementById("vote-screen").classList.remove("hidden");
            document.getElementById("username").innerText = loggedInUser.name;
        }
    }
}

// Głosowanie
function vote(choice) {
    if (!votingActive) {
        document.getElementById("vote-status").innerText = "Głosowanie nie jest aktywne!";
        return;
    }

    votes[choice]++;
    localStorage.setItem("votes", JSON.stringify(votes));
    document.getElementById("vote-status").innerText = `Oddano głos: ${choice.toUpperCase()}`;
}

// Rozpoczęcie głosowania
function startVoting() {
    votingActive = true;
    votes = { za: 0, przeciw: 0, wstrzymuje: 0 };
    localStorage.setItem("votingActive", JSON.stringify(votingActive));
    localStorage.setItem("votes", JSON.stringify(votes));
    updateVoteStatus();
    document.getElementById("results").style.display = "none"; // Ukryj wyniki
}

// Zakończenie głosowania
function endVoting() {
    votingActive = false;
    localStorage.setItem("votingActive", JSON.stringify(votingActive));
    updateVoteStatus();
    document.getElementById("results").style.display = "block"; // Pokaż wyniki
}

// Wyświetlenie wyników głosowania
function showResults() {
    if (votingActive) {
        document.getElementById("results").innerText = "Głosowanie nie zostało zakończone!";
    } else {
        document.getElementById("results").innerText =
            `ZA: ${votes.za}, PRZECIW: ${votes.przeciw}, WSTRZYMUJĘ: ${votes.wstrzymuje}`;
    }
}

// Status głosowania
function updateVoteStatus() {
    document.getElementById("vote-status").innerText = votingActive ? "Głosowanie jest aktywne!" : "Głosowanie nie jest aktywne!";
}

// Ustawienie czasu głosowania
function startTimer() {
    let inputTime = parseInt(document.getElementById("timer-input").value);
    if (isNaN(inputTime) || inputTime <= 0) {
        alert("Wprowadź poprawny czas!");
        return;
    }

    timer = inputTime;
    timerRunning = true;
    localStorage.setItem("timer", JSON.stringify(timer));
    localStorage.setItem("timerRunning", JSON.stringify(timerRunning));

    updateTimerDisplay();

    let timerInterval = setInterval(() => {
        if (timer > 0) {
            timer--;
            localStorage.setItem("timer", JSON.stringify(timer));
            updateTimerDisplay();
        }

        if (timer === 5) {
            document.getElementById("timer-display").classList.add("red-blink");
        }

        if (timer <= 0) {
            clearInterval(timerInterval);
            document.getElementById("timer-display").classList.remove("red-blink");
            document.getElementById("timer-display").innerText = "Czas minął!";
            timerRunning = false;
            localStorage.setItem("timerRunning", JSON.stringify(timerRunning));
        }
    }, 1000);
}

// Aktualizowanie wyświetlania czasu
function updateTimerDisplay() {
    document.getElementById("timer-display").innerText = timer > 0 ? `Pozostały czas: ${timer} sek.` : "Czas minął!";
}

// Funkcja wylogowania
function logout() {
    sessionStorage.removeItem("loggedInUser");
    localStorage.removeItem("votes");
    localStorage.removeItem("votingActive");
    localStorage.removeItem("timer");
    localStorage.removeItem("timerRunning");

    loggedInUser = null;
    votes = { za: 0, przeciw: 0, wstrzymuje: 0 };
    votingActive = false;
    timer = 0;
    timerRunning = false;

    // Przekierowanie do ekranu logowania
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("vote-screen").classList.add("hidden");
    document.getElementById("admin-screen").classList.add("hidden");
}

// Aktualizowanie statusu głosowania i wyniki co 1 sekundę
setInterval(() => {
    votes = JSON.parse(localStorage.getItem("votes")) || { za: 0, przeciw: 0, wstrzymuje: 0 };
    votingActive = JSON.parse(localStorage.getItem("votingActive")) || false;
    timer = JSON.parse(localStorage.getItem("timer")) || 0;
    timerRunning = JSON.parse(localStorage.getItem("timerRunning")) || false;

    updateVoteStatus();
    updateTimerDisplay();
    showResults(); // Teraz pokaż wyniki tylko jeśli głosowanie zakończone
}, 1000);

window.onload = showScreen;
