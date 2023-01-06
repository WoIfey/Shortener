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
const loginBtn = document.querySelector("#login");
const profileBtn = document.querySelector("#profile");
const noURL = document.querySelector("#noURL");
const button = document.querySelector("#send");
const input = document.querySelector("#inputURL");
const linksName = document.querySelector("#linksName");

const auth = getAuth();
let userData;

function notSignUp() {
  noURL.innerText = "❌ You are not signed in!";
  noURL.style.display = "inherit";
}

// URL Shortener
function shortener() {
  const link = push(ref(db, "links/"), {
    UID: userData.uid,
    URL: input.value,
  });

  set(ref(db, "users/" + userData.uid + "/" + link.key), input.value);

  const uniqueID = document.querySelector("#uniqueID");
  const textID = document.querySelector("#textID");

  textID.style.display = "inherit";
  uniqueID.href = document.URL + "?id=" + link.key;
  uniqueID.innerText = uniqueID.href;
  // Clear input
  input.value = "";
}

// Check if user is logged in or logged out and stay logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    userData = user;
    noURL.style.display = "none";
    loginBtn.style.display = "none";
    loginModal.hide();
    profileBtn.style.visibility = "visible";
    linksName.innerText = "Signed in as " + user.email;

    const listRef = ref(db, "users/" + user.uid);
    onValue(listRef, (snapshot) => {
      const items = snapshot.val();

      // Clear all links
      document.querySelector("#links").replaceChildren();

      // Check if it is a URL
      function notURL() {
        noURL.innerText = "❌ Requested URL is not valid!";
        noURL.style.color = "#bd2a5b";
        noURL.style.display = "inherit";
        setTimeout(() => {
          noURL.style.display = "none";
        }, 5000);
      }
      // Say that it got shortened
      function shortened() {
        noURL.innerText = "✅ Link Shortened!";
        noURL.style.color = "green";
        noURL.style.display = "inherit";
        setTimeout(() => {
          noURL.style.display = "none";
        }, 5000);
      }

      // https checker (URL checker)
      function isValidHttpUrl(string) {
        try {
          const newUrl = new URL(string);
          return newUrl.protocol === "http:" || newUrl.protocol === "https:";
        } catch (err) {
          return false;
        }
      }

      // Creates a unique ID for database when pressing the send button
      button.addEventListener("click", function (e) {
        e.preventDefault();

        if (isValidHttpUrl(input.value) == true) {
          shortener();
          shortened();
        } else {
          notURL();
        }
      });

      // Creates a unique ID for database when pressing enter
      input.addEventListener("keypress", function (e) {
        if (e.key == "Enter") {
          e.preventDefault();

          if (isValidHttpUrl(input.value) == true) {
            shortener();
            shortened();
          } else {
            notURL();
          }
        }
      });

      // Add in a new link into the link section
      for (let item in items) {
        const linkElement = document.createElement("a");
        const redirectLink = document.createElement("p");
        const newDIV = document.createElement("div");
        const clipboard = document.createElement("i");
        newDIV.classList = "linksDIV";

        clipboard.classList = "ph-copy";
        document.querySelector("#links").appendChild(newDIV);
        document.querySelector(".linksDIV").appendChild(redirectLink);
        document.querySelector(".linksDIV").appendChild(linkElement);
        document.querySelector(".linksDIV").appendChild(clipboard);

        redirectLink.innerText = items[item];
        redirectLink.classList = "LINKS";

        linkElement.classList = "URLS";
        linkElement.href = document.URL + "?id=" + item;
        linkElement.setAttribute("target", "_blank");
        linkElement.innerText = linkElement.href;
      }
    });
  } else {
    notSignUp();
  }
});

// Reset password
document.querySelector("#reset-button").addEventListener("click", function () {
  const email = document.querySelector("#email-input").value;
  const errorMessage = document.querySelector("#resetError");
  sendPasswordResetEmail(auth, email)
    .then(() => {
      errorMessage.innerText = "✅ Sent!";
      errorMessage.style.display = "inherit";
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    })
    .catch((error) => {
      errorMessage.innerText = error;
      errorMessage.style.display = "inherit";
      setTimeout(() => {
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
    setTimeout(() => {
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
        setTimeout(() => {
          errorMessage.style.display = "none";
        }, 5000);
      });
  });

// Logout button
const logOut = document.querySelector("#signOutBtn");
logOut.addEventListener("click", (e) => {
  if (e.button == 0) {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
      window.location.reload();
    });
  }
});
