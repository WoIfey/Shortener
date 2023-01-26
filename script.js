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
  deleteUser,
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
const id = urlParams.get("i");

function hide() {
  document.querySelector("body").style.display = "inherit";
  document.querySelector("body").style.height = "100vh";
  document.querySelector("main").style.display = "none";
  document.querySelector("body").style.background = "white";
}

if (id) {
  const dbRef = ref(getDatabase());
  get(child(dbRef, `links/${id}/URL`)).then((snapshot) => {
    if (snapshot.exists()) {
      hide();
      document.querySelector(".spinner-border").style.display = "inherit";
      location.assign(snapshot.val());
    } else {
      hide();
      document.querySelector(".alert").style.display = "inherit";
    }
  });
}

// Auth
// =========================================================

const loginModal = new bootstrap.Modal("#login-modal");
const registerModal = new bootstrap.Modal("#register-modal");
const loginBtn = document.querySelector("#login");
const profileBtn = document.querySelector("#profile");
const err = document.querySelector("#err");
const button = document.querySelector("#send");
const input = document.querySelector("#inputURL");
const linksName = document.querySelector("#linksName");
const deleteName = document.querySelector(".deleteName");

// Get user
const auth = getAuth();
let userData;

// User isnt signed up
function notSignUp() {
  loginBtn.style.visibility = "visible";
  err.innerText = "❌ You are not signed in!";
  err.style.visibility = "visible";
}
// User is signed in
function SignedIn() {
  err.innerText = "✅ You are signed in!";
  err.style.color = "#05a630";
  err.style.visibility = "visible";
  setTimeout(() => {
    err.style.visibility = "hidden";
    err.style.color = "#bd2a5b";
  }, 3000);
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

// Check if it is a URL
function notURL() {
  err.innerText = "❌ Requested URL is not valid!";
  err.style.color = "#bd2a5b";
  err.style.visibility = "visible";
  setTimeout(() => {
    err.style.visibility = "hidden";
  }, 5000);
}

// Say that it got shortened
function shortened() {
  err.innerText = "✅ Link Shortened!";
  err.style.color = "#05a630";
  err.style.visibility = "visible";
  setTimeout(() => {
    err.style.visibility = "hidden";
    err.style.color = "#bd2a5b";
  }, 5000);
}

const uniqueID = document.querySelector("#uniqueID");
const copyBtn = document.querySelector("#copybutton");
const textID = document.querySelector("#textID");

// URL Shortener
function shortener() {
  const link = push(ref(db, "links/"), {
    CLICKS: 0,
    UID: userData.uid,
    URL: input.value,
  });

  set(ref(db, "users/" + userData.uid + "/" + link.key), input.value);

  textID.style.display = "inherit";
  copyBtn.style.visibility = "visible";
  uniqueID.href = "?i=" + link.key;
  uniqueID.innerText = uniqueID.href;
  // Clear input
  input.value = "";
}

/* Copy to clipboard */
function copied() {
  err.innerText = "✅ Link Copied!";
  err.style.color = "#05a630";
  err.style.visibility = "visible";
  setTimeout(() => {
    err.style.visibility = "hidden";
    err.style.color = "#bd2a5b";
  }, 3000);
}

copyBtn.addEventListener("click", () => {
  const text = uniqueID.textContent;

  // Create a temporary textarea element to copy
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();

  // Copy the text to the clipboard
  try {
    document.execCommand("copy");
    copied();
  } catch (err) {
    alert("Couldn't copy URL.");
  }

  // Remove the temporary textarea element
  document.body.removeChild(textArea);
});

// Check if user is logged in or logged out and stay logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    userData = user;
    if (id) {
      document.querySelector("body").style.display = "none";
    } else {
      document.querySelector("body").style.display = "inherit";
    }

    loginBtn.style.display = "none";
    loginModal.hide();
    profileBtn.style.visibility = "visible";
    linksName.innerText = "Signed in as " + user.email;
    deleteName.innerText = "Permanently delete " + user.email;
    SignedIn();

    // Creates a unique ID for database when pressing the send button
    button.addEventListener("click", function (e) {
      e.preventDefault();

      if (!input.value) return;
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

        if (!input.value) return;
        if (isValidHttpUrl(input.value) == true) {
          shortener();
          shortened();
        } else {
          notURL();
        }
      }
    });

    // Your links
    const listRef = ref(db, "users/" + user.uid);
    onValue(listRef, (snapshot) => {
      const items = snapshot.val();

      // Clear all links
      document.querySelector("#links").replaceChildren();

      const newDIV = document.createElement("div");
      newDIV.classList = "linksDIV";
      /*       document.querySelector("#links").appendChild(newDIV); */
      // Add in a new link into the link section
      for (let item in items) {
        const linkElement = document.createElement("a");
        const redirectLink = document.createElement("p");
        /*         const clipboard = document.createElement("i"); */

        /*         clipboard.classList = "ph-copy"; */
        document.querySelector("#links").appendChild(linkElement);
        /*         document.querySelector(".linksDIV").appendChild(clipboard); */
        document.querySelector("#links").appendChild(redirectLink);

        redirectLink.innerText = items[item];
        redirectLink.classList = "LINKS";

        linkElement.classList = "URLS";
        linkElement.href = "?i=" + item;
        linkElement.setAttribute("target", "_blank");
        linkElement.innerText = linkElement.href;
      }
    });
  } else if (id == null) {
    document.querySelector("body").style.display = "inherit";
    notSignUp();
  } else {
    console.log("Something wrong happened");
  }
});

// Notice text
const info = ref(db, "info");
onValue(info, (snapshot) => {
  const data = snapshot.val();
  document.querySelector("#infoTxt").innerText = data;
});

// Reset password
document.querySelector("#reset-button").addEventListener("click", function () {
  const email = document.querySelector("#email-input").value;
  const errorMessage = document.querySelector(".footer-reset");
  sendPasswordResetEmail(auth, email)
    .then(() => {
      errorMessage.innerText = "✅ Sent!";
      errorMessage.style.display = "inherit";
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    })
    .catch((error) => {
      if (error.message === `Firebase: Error (auth/missing-email).`) {
        errorMessage.innerText = "❌ Enter Email!";
        errorMessage.style.display = "inherit";
      } else if (error.message === `Firebase: Error (auth/invalid-email).`) {
        errorMessage.innerText = "⚠️ Invalid Email!";
        errorMessage.style.display = "inherit";
      } else if (error.message === `Firebase: Error (auth/user-not-found).`) {
        errorMessage.innerText = "❌ User does not exist!";
        errorMessage.style.display = "inherit";
      } else if (
        error.message ===
        `Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).`
      ) {
        errorMessage.innerText = "❌ Too many attempts!";
      } else if (error.message === `Firebase: Error (auth/user-disabled).`) {
        errorMessage.innerText = "❌ Disabled account.";
      } else {
        errorMessage.innerText = "⚠️ Something went wrong!";
        errorMessage.style.display = "inherit";
      }
    });
});

// Listen for click on login button
document.querySelector("#login-button").addEventListener("click", function () {
  const email = document.querySelector("#login-email").value;
  const password = document.querySelector("#login-password").value;
  const errorMessage = document.querySelector(".footer-login");
  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    if (error.message === `Firebase: Error (auth/invalid-email).`) {
      errorMessage.innerText = "⚠️ Invalid Email!";
      errorMessage.style.display = "inherit";
    } else if (error.message === `Firebase: Error (auth/wrong-password).`) {
      errorMessage.innerText = "❌ Wrong Password!";
      errorMessage.style.display = "inherit";
    } else if (error.message === `Firebase: Error (auth/internal-error).`) {
      errorMessage.innerText = "⚠️ Enter your password!";
      errorMessage.style.display = "inherit";
    } else if (error.message === `Firebase: Error (auth/user-not-found).`) {
      errorMessage.innerText = "❌ User does not exist!";
      errorMessage.style.display = "inherit";
    } else if (
      error.message ===
      `Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).`
    ) {
      errorMessage.innerText = "❌ Too many attempts!";
    } else if (error.message === `Firebase: Error (auth/user-disabled).`) {
      errorMessage.innerText = "❌ Disabled account.";
    } else {
      errorMessage.innerText = "⚠️ Something went wrong!";
      errorMessage.style.display = "inherit";
    }
  });
});

// Listen for click on register button
document
  .querySelector("#register-button")
  .addEventListener("click", function () {
    const email = document.querySelector("#register-email").value;
    const password = document.querySelector("#register-password").value;
    const errorMessage = document.querySelector(".footer-register");
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        registerModal.hide();
      })
      .catch((error) => {
        if (error.message === `Firebase: Error (auth/invalid-email).`) {
          errorMessage.innerText = "⚠️ Invalid Email!";
          errorMessage.style.display = "inherit";
        } else if (error.message === `Firebase: Error (auth/wrong-password).`) {
          errorMessage.innerText = "❌ Wrong Password!";
          errorMessage.style.display = "inherit";
        } else if (error.message === `Firebase: Error (auth/internal-error).`) {
          errorMessage.innerText = "⚠️ Enter your password!";
          errorMessage.style.display = "inherit";
        } else if (error.message === `Firebase: Error (auth/user-not-found).`) {
          errorMessage.innerText = "❌ User does not exist!";
          errorMessage.style.display = "inherit";
        } else if (
          error.message === `Firebase: Error (auth/email-already-in-use).`
        ) {
          errorMessage.innerText = "❌ Email is already in use.";
          errorMessage.style.display = "inherit";
        } else if (
          error.message ===
          `Firebase: Password should be at least 6 characters (auth/weak-password).`
        ) {
          errorMessage.innerText = "❌ Password is too short!";
          errorMessage.style.display = "inherit";
        } else if (
          error.message ===
          `Firebase: Password cannot be longer than 4096 characters (auth/password-does-not-meet-requirements).`
        ) {
          errorMessage.innerText = "❌ Password is too long!";
          errorMessage.style.display = "inherit";
        } else if (
          error.message ===
          `Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).`
        ) {
          errorMessage.innerText = "❌ Too many attempts!";
        } else if (error.message === `Firebase: Error (auth/user-disabled).`) {
          errorMessage.innerText = "❌ Disabled account.";
        } else {
          errorMessage.innerText = "⚠️ Something went wrong!";
          errorMessage.style.display = "inherit";
        }
      });
  });

// Delete account section
const deleteAcc = document.querySelector("#deleteAcc");
const deleteFooter = document.querySelector("#deleteFooter");
deleteAcc.addEventListener("click", (e) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const password = document.querySelector("#confirmation").value;
  const email = user.email;
  if (e.button == 0) {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        deleteUser(user).then(() => {
          deleteFooter.innerText = "✅ Account Deleted";
          deleteFooter.style.color = "greenyellow";
          setInterval(() => {
            window.location.reload();
          }, 2000);
        });
      })
      .catch((error) => {
        if (error.message === `Firebase: Error (auth/wrong-password).`) {
          deleteFooter.innerText = "❌ Wrong password!";
        } else if (error.message === `Firebase: Error (auth/internal-error).`) {
          deleteFooter.innerText = "⚠️ Confirm password!";
        } else if (
          error.message ===
          `Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).`
        ) {
          deleteFooter.innerText = "❌ Too many attempts!";
        } else if (error.message === `Firebase: Error (auth/user-disabled).`) {
          deleteFooter.innerText = "❌ Disabled account.";
        } else {
          deleteFooter.innerText = "⚠️ Something went wrong!";
        }
      });
  }
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
