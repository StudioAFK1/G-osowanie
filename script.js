// Inicjalizacja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgP-MDJZ7Ma7QegDetUU_A2kzuvKahiMA",
    authDomain: "studioglos-9d977.firebaseapp.com",
    databaseURL: "https://studioglos-9d977-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "studioglos-9d977",
    storageBucket: "studioglos-9d977.firebasestorage.app",
    messagingSenderId: "621038569234",
    appId: "1:621038569234:web:55685f1419d15751de55cb"
};

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let loggedInUser = JSON.parse(sessionStorage.getItem("loggedInUser")) || null;
let votes = { za: 0, przeciw: 0, wstrzymuje: 0 };
let votingActive = false;
let timer = 0;
let timerRunning = false;

// Logowanie użytkownika
function login() {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    if (login === "admin" && password === "admin") {
        loggedInUser = { name: "Prowadzący", role: "admin" };
        sessionStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        showScreen();
    } else {
        // Użytkownicy
        const users = {
            "kowalski123": { password: "1111", name: "Jan Kowalski" },
            "nowak456": { password: "2222", name: "Anna Nowak" },
            "zielinski789": { password: "3333", name: "Piotr Zieliński" }
        };

        const user = users[login];
        if (user && user.password === password) {
            loggedInUser = user;
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            showScreen();
        } else {
            document.getElementById("error-msg").innerText = "Błędny login lub hasło!";
        }
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

    database.ref('votes').once('value').then(function(snapshot) {
        let currentVotes = snapshot.val();
        currentVotes[choice]++;
        database.ref('votes').set(currentVotes);
    });

    document.getElementById("vote-status").innerText = `Oddano głos: ${choice.toUpperCase()}`;
}

// Rozpoczęcie głosowania
function startVoting() {
    votingActive = true;
    votes = { za: 0, przeciw: 0, wstrzymuje: 0 };
    database.ref('votes').set(votes);
    database.ref('votingActive').set(votingActive);
    updateVoteStatus();
}

// Zakończenie głosowania
function endVoting() {
    votingActive = false;
    database.ref('votingActive').set(votingActive);
    updateVoteStatus();
    document.getElementById("results").style.display = "block";
}

// Pokaż wyniki
function showResults() {
    database.ref('votes').on('value', function(snapshot) {
        const data = snapshot.val();
        if (votingActive) {
            document.getElementById("results").innerText = "Głosowanie nie zostało zakończone!";
        } else {
            document.getElementById("results").innerText =
                `ZA: ${data.za}, PRZECIW: ${data.przeciw}, WSTRZYMUJĘ: ${data.wstrzymuje}`;
        }
    });
}

// Wylogowanie
function logout() {
    sessionStorage.removeItem("loggedInUser");
    location.reload();
}

// Aktualizowanie statusu głosowania
function updateVoteStatus() {
    database.ref('votingActive').on('value', function(snapshot) {
        votingActive = snapshot.val();
        if (votingActive) {
            document.getElementById("vote-status").innerText = "Głosowanie aktywne!";
        } else {
            document.getElementById("vote-status").innerText = "Głosowanie zakończone!";
        }
    });
}
