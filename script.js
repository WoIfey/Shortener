import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";

// Database
import {
  getDatabase,
  ref,
  push,
  child,
  get,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-database.js";

// Auth
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5fg_FknJTOrhmKuknSJFsy4wi53lRuRQ",
  authDomain: "shortys-1f028.firebaseapp.com",
  databaseURL:
    "https://shortys-1f028-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shortys-1f028",
  storageBucket: "shortys-1f028.appspot.com",
  messagingSenderId: "205298935830",
  appId: "1:205298935830:web:e46462321aa005a9fced37",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Redirect link
// =========================================================
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get("id");

if (id) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `links/${id}/URL`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        location.assign(snapshot.val());
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

// Auth
// =========================================================

const loginModal = new bootstrap.Modal("#login-modal");
const registerModal = new bootstrap.Modal("#register-modal");
const loginButton = document.querySelector("#login");
const userName = document.querySelector("#name");
const logout = document.querySelector("#logout");

const auth = getAuth();
let userData;

// Stay logged in or logged out
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log(user);
    userData = user;
    loginButton.style.display = "none";
    loginModal.hide();
    logout.style.visibility = "visible";
    userName.style.visibility = "visible";
    userName.innerText = "Hello, " + user.email;

    const listRef = ref(db, "users/" + user.uid);
    onValue(listRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      const links = document.createElement("p");
      document.querySelector("#linksSection").appendChild(links);
      links.innerHTML = data;
    });
  } else {
    loginButton.style.display = "inherit";
    logout.style.visibility = "hidden";
    userName.style.visibility = "hidden";
  }
});

// Reset password
document.querySelector("#reset-button").addEventListener("click", function () {
  const email = document.querySelector("#email-input").value;
  const errorMessage = document.querySelector("#resetError");
  sendPasswordResetEmail(auth, email)
    .then(() => {
      errorMessage.innerText = "Sent! (Check your junk email)";
      errorMessage.style.display = "inherit";
      setInterval(() => {
        errorMessage.style.display = "none";
      }, 5000);
    })
    .catch((error) => {
      errorMessage.innerText = error;
      errorMessage.style.display = "inherit";
      setInterval(() => {
        errorMessage.style.display = "none";
      }, 5000);
    });
});

// Listen for click on login button
document.querySelector("#login-button").addEventListener("click", function () {
  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;
  const errorMessage = document.querySelector("#loginError");
  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    errorMessage.innerText = error;
    errorMessage.style.display = "inherit";
    setInterval(() => {
      errorMessage.style.display = "none";
    }, 5000);
  });
});

// Listen for click on register button
document
  .querySelector("#register-button")
  .addEventListener("click", function () {
    const email = document.querySelector("#register-email").value;
    const password = document.querySelector("#register-password").value;
    const errorMessage = document.querySelector("#registerError");
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        registerModal.hide();
      })
      .catch((error) => {
        errorMessage.innerText = error;
        errorMessage.style.display = "inherit";
        setInterval(() => {
          errorMessage.style.display = "none";
        }, 5000);
      });
  });

// Logout button
const logOut = document.querySelector("#logout");
logOut.addEventListener("click", (e) => {
  if (e.button == 0) {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
    });
  }
});

// Database
// =========================================================

// URL Shortener
function shortener() {
  const link = push(ref(db, "links/"), {
    UID: userData.uid,
    URL: input.value,
  });

  set(ref(db, "users/" + userData.uid + "/" + link.key), input.value);

  const uniqueID = document.querySelector("#uniqueID");
  const textID = document.querySelector("#textID");

  textID.style.visibility = "visible";
  uniqueID.href = document.URL + "?id=" + link.key;
  uniqueID.innerText = uniqueID.href;
  // Clear input
  input.value = "";
}

const button = document.querySelector("#send");
const input = document.querySelector("#inputURL");

// Creates a unique ID for database when pressing the send button
button.addEventListener("click", function (e) {
  e.preventDefault();

  if (input.value !== "") {
    shortener();
  }
});

// Creates a unique ID for database when pressing enter
input.addEventListener("keypress", function (e) {
  if (e.key == "Enter") {
    e.preventDefault();

    if (input.value !== "") {
      shortener();
    }
  }
});
