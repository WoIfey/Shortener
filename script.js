// Database

// Auth

// Redirect link
// =========================================================
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get("l");

function hide() {
  document.querySelector("body").style.display = "inherit";
  document.querySelector("body").style.height = "100vh";
  document.querySelector("main").style.display = "none";
  document.querySelector("body").style.background = "white";
}

if (id) {
    const links = JSON.parse(localStorage.getItem('links') || '{}');
    if (links[id]) {
      hide();
      document.querySelector(".spinner-border").style.display = "inherit";
      location.assign(links[id].URL);
    } else {
      hide();
      document.querySelector(".alert").style.display = "inherit";
    }
}

// Auth
// =========================================================

const loginBtn = document.querySelector("#login");
const profileBtn = document.querySelector("#profile");
const err = document.querySelector("#err");
const button = document.querySelector("#send");
const input = document.querySelector("#inputURL");
const linksName = document.querySelector("#linksName");
const deleteName = document.querySelector(".deleteName");

// Get user

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

// Random ID generator
function generateId(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// URL Shortener
function shortener() {
  const links = JSON.parse(localStorage.getItem('links') || '{}');
  const key = generateId();

  links[key] = {
    URL: input.value
  };

  localStorage.setItem('links', JSON.stringify(links));

  textID.style.display = "inherit";
  copyBtn.style.visibility = "visible";
  uniqueID.href = "?l=" + key;
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

copyBtn.addEventListener("click", async () => {
  const text = uniqueID.textContent;

  // Create a temporary textarea element to copy
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();

  // Copy the text to the clipboard
  try {
    await navigator.clipboard.writeText(text);
    copied();
  } catch (err) {
    alert("Couldn't copy URL.");
  }

  // Remove the temporary textarea element
  document.body.removeChild(textArea);
});

// Check if user is logged in or logged out and stay logged in
function App() {
    if (id) {
      document.querySelector("body").style.display = "none";
    } else {
      document.querySelector("body").style.display = "inherit";
    }

    // Creates a unique ID for database when pressing the send button
    button.addEventListener("click", function (e) {
      e.preventDefault();
      if (!input.value) return;
      if (isValidHttpUrl(input.value)) {
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
        if (isValidHttpUrl(input.value)) {
          shortener();
          shortened();
        } else {
          notURL();
        }
      }
    });

    // Your links
}

// Notice text
document.querySelector("#signupBtn").style.display = "none";

document.addEventListener('DOMContentLoaded', () => {
  const links = JSON.parse(localStorage.getItem('links') || '{}');
  if (!links.seen) {
    const archiveModal = new bootstrap.Modal(document.getElementById('archiveModal'));
    archiveModal.show();
    
    document.querySelector('#archiveModal .btn-primary').addEventListener('click', () => {
      links.seen = true;
      localStorage.setItem('links', JSON.stringify(links));
    });
  }
});

App();