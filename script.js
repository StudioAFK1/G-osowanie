// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDgP-MDJZ7Ma7QegDetUU_A2kzuvKahiMA",
    authDomain: "studioglos-9d977.firebaseapp.com",
    databaseURL: "https://studioglos-9d977-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "studioglos-9d977",
    storageBucket: "studioglos-9d977.firebasestorage.app",
    messagingSenderId: "621038569234",
    appId: "1:621038569234:web:55685f1419d15751de55cb",
    measurementId: "G-J5CTKWVL7R"
};

// Inicjalizacja Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let loggedInUser = null;

// Funkcja logowania
function login() {
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    // Sprawdzamy, czy użytkownik istnieje w bazie danych
    firebase.database().ref('users/' + login).once('value').then(snapshot => {
        const user = snapshot.val();
        if (user && user.password === password) {
            loggedInUser = user;
            sessionStorage.setItem("loggedInUser", JSON.stringify(user));
            showScreen();
        } else {
            document.getElementById("error-msg").innerText = "Błędny login lub hasło!";
        }
    });
}

// Funkcja wyświetlania ekranu po zalogowaniu
function showScreen() {
    if (loggedInUser.role === "admin") {
        document.getElementById("admin-screen").style.display = "block";
    } else {
        document.getElementById("main-screen").style.display = "block";
        document.getElementById("user-name").textContent = loggedInUser.name;
    }
    document.getElementById("login-screen").style.display = "none";
}

// Funkcja wylogowywania
function logout() {
    loggedInUser = null;
    sessionStorage.removeItem("loggedInUser");
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("admin-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
}

// Funkcja głosowania
function vote(choice) {
    const userId = loggedInUser.name;
    const voteRef = database.ref('votes/' + userId);
    voteRef.set({
        vote: choice
    });

    alert("Twój głos został oddany: " + choice);
}

// Funkcja rozpoczęcia głosowania
function startVoting() {
    const votingStatusRef = database.ref('votingStatus');
    votingStatusRef.set({
        active: true
    });
    alert("Głosowanie rozpoczęte!");
}

// Funkcja zakończenia głosowania
function endVoting() {
    const votingStatusRef = database.ref('votingStatus');
    votingStatusRef.set({
        active: false
    });
    alert("Głosowanie zakończone!");
}

// Funkcja wyświetlania wyników
function showResults() {
    const votesRef = database.ref('votes');
    votesRef.once('value', snapshot => {
        const votes = snapshot.val();
        const results = { ZA: 0, PRZECIW: 0, WSTRZYMAJ_SIE: 0 };

        for (const user in votes) {
            if (votes[user].vote === "ZA") {
                results.ZA++;
            } else if (votes[user].vote === "PRZECIW") {
                results.PRZECIW++;
            } else if (votes[user].vote === "WSTRZYMAJ SIE") {
                results.WSTRZYMAJ_SIE++;
            }
        }
        alert(`Wyniki głosowania:\nZA: ${results.ZA}\nPRZECIW: ${results.PRZECIW}\nWSTRZYMAJ SIĘ: ${results.WSTRZYMAJ_SIE}`);
    });
}
