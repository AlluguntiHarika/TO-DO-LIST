// auth.js - frontend authentication (signup/login + index protection + logout)
// Place this in project root and include in index.html AFTER other scripts:
// <script defer src="auth.js"></script>

const USE_BACKEND = true; // <--- set to true when backend is ready
const API_BASE = "http://localhost:4000"; // backend base URL (change for production)

// ---------- localStorage helpers (demo) ----------
const usersKey = "users";
function getUsers() {
  return JSON.parse(localStorage.getItem(usersKey)) || [];
}
function saveUsers(users) {
  localStorage.setItem(usersKey, JSON.stringify(users));
}

// ---------- utils ----------
function showError(msg) { alert(msg); }
function showSuccess(msg) { alert(msg); }

// ---------- Signup handler ----------
document.getElementById("signupForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  if (password !== confirmPassword) {
    showError("Passwords do not match!");
    return;
  }

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");
      showSuccess("Signup successful! Please login.");
      window.location.href = "login.html";
    } catch (err) {
      showError(err.message);
    }
  } else {
    // localStorage demo
    let users = getUsers();
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase())) {
      showError("Username or email already exists!");
      return;
    }
    users.push({ username, email, password });
    saveUsers(users);
    showSuccess("Signup successful! Please login.");
    window.location.href = "login.html";
  }
});

// ---------- Login handler ----------
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (USE_BACKEND) {
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      // data: { token, user: { username, email } }
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));
      showSuccess("Login successful!");
      window.location.href = "index.html";
    } catch (err) {
      showError(err.message);
    }
  } else {
    // localStorage demo
    let users = getUsers();
    let user = users.find(
      u => (u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()) 
           && u.password === password
    );
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      showSuccess("Login successful!");
      window.location.href = "index.html";
    } else {
      showError("Invalid username or password!");
    }
  }
});

// ---------- Protect index.html and show username + logout ----------
async function checkSessionAndPrepareUI() {
  if (!window.location.pathname.endsWith("index.html")) return;

  let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (USE_BACKEND) {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return;
    }
    // verify token by calling /api/me
    try {
      const res = await fetch(`${API_BASE}/api/me`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
        return;
      }
      const user = await res.json(); // user object
      loggedInUser = { username: user.username, email: user.email };
      localStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      window.location.href = "login.html";
      return;
    }
  }

  // at this point loggedInUser exists
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  // Set username in UI
  const usernameEl = document.getElementById("username");
  if (usernameEl) usernameEl.textContent = loggedInUser.username || loggedInUser.email || "User";

  // Add logout button dynamically
  const accountContainer = document.getElementById("account_container");
  if (accountContainer) {
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.style.cssText = `
      margin-left: 10px;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      background: #000;
      color: #fff;
      cursor: pointer;
    `;
    logoutBtn.onclick = () => {
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    };
    accountContainer.appendChild(logoutBtn);
  }
}

checkSessionAndPrepareUI();
