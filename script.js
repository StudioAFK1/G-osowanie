// Inicjalizacja Firebase
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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Zmienne globalne
let currentUser = null;
let isVotingActive = false;
let timer = null;

// Funkcja logowania
function login() {
    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    db.ref('users/' + login).once('value').then((snapshot) => {
        const user = snapshot.val();
        if (user && user.password === password) {
            currentUser = user;
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('voting-container').style.display = 'block';
            document.getElementById('user-name').textContent = currentUser.name;
            if (user.role === 'admin') {
                document.getElementById('admin-container').style.display = 'block';
            }
        } else {
            errorMessage.textContent = 'Błędny login lub hasło';
            errorMessage.style.color = 'red';
        }
    });
}

// Funkcja wylogowania
function logout() {
    currentUser = null;
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('voting-container').style.display = 'none';
    document.getElementById('admin-container').style.display = 'none';
    document.getElementById('error-message').textContent = '';
}

// Funkcja do głosowania
function vote(choice) {
    if (!isVotingActive) return;
    db.ref('votes/' + choice).transaction((currentVote) => {
        return (currentVote || 0) + 1;
    });
}

// Funkcja rozpoczęcia głosowania (admin)
function startVoting() {
    isVotingActive = true;
    document.getElementById('results').textContent = 'Głosowanie aktywne!';
    startTimer();
}

// Funkcja zakończenia głosowania (admin)
function endVoting() {
    isVotingActive = false;
    document.getElementById('results').textContent = 'Głosowanie zakończone!';
    clearInterval(timer);
    showResults();
}

// Funkcja wyświetlania wyników
function showResults() {
    db.ref('votes').once('value').then((snapshot) => {
        const votes = snapshot.val() || {};
        const za = votes.ZA || 0;
        const przeciw = votes.PRZECIW || 0;
        const wstrzymaj = votes.WSTRZYMAJ_SIE || 0;
        document.getElementById('results').innerHTML = `
            ZA: ${za}<br>
            PRZECIW: ${przeciw}<br>
            WSTRZYMAJ SIĘ: ${wstrzymaj}
        `;
    });
}

// Funkcja odliczania czasu
function startTimer() {
    let timeLeft = 30; // 30 sekund
    const countdownElement = document.getElementById('countdown');

    timer = setInterval(() => {
        timeLeft--;
        countdownElement.textContent = timeLeft + 's';
        
        if (timeLeft <= 5) {
            countdownElement.style.color = 'red';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            endVoting();
        }
    }, 1000);
}
