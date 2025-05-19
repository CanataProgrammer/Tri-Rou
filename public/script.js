const API_URL = "https://tri-rou.onrender.com/";
let token = localStorage.getItem("token");
let wheels = {
  wheel1: ["A1", "A2", "A3"],
  wheel2: ["B1", "B2", "B3"],
  wheel3: ["C1", "C2", "C3"]
};
const API_BASE = 'https://tri-rou.onrender.com'; // ←バックエンドのRender URL
const res = await fetch(`${API_BASE}/api/data`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
// ロード処理
window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    showApp();
    loadRouletteData();
  }
  initEditors();
  updateWheels();
});

function initEditors() {
  const editorArea = document.getElementById("editors");
  editorArea.innerHTML = "";
  for (let key of Object.keys(wheels)) {
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${key}</h4>
      <ul id="${key}-list">${wheels[key].map(item => `<li>${item}</li>`).join("")}</ul>
      <input id="${key}-input" placeholder="追加項目"/>
      <button onclick="addItem('${key}')">追加</button>
    `;
    editorArea.appendChild(div);
  }
}

function updateWheels() {
  ["wheel1", "wheel2", "wheel3"].forEach(id => {
    const select = document.getElementById(id);
    select.innerHTML = wheels[id].map(item => `<option>${item}</option>`).join("");
  });
}

function addItem(wheelId) {
  const input = document.getElementById(`${wheelId}-input`);
  const value = input.value.trim();
  if (value) {
    wheels[wheelId].push(value);
    input.value = "";
    initEditors();
    updateWheels();
    saveRouletteData();
  }
}

function spinAll() {
  const r1 = wheels.wheel1[Math.floor(Math.random() * wheels.wheel1.length)];
  const r2 = wheels.wheel2[Math.floor(Math.random() * wheels.wheel2.length)];
  const r3 = wheels.wheel3[Math.floor(Math.random() * wheels.wheel3.length)];
  document.getElementById("result").textContent = `${r1} - ${r2} - ${r3}`;
}

async function register() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const res = await fetch(`${API_URL}/api/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  alert(data.message);
}

async function login() {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const res = await fetch(`${API_URL}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.ok) {
    const data = await res.json();
    token = data.token;
    localStorage.setItem("token", token);
    showApp();
    await loadRouletteData();
    // トークンのテスト用
    const token = localStorage.getItem('token');
    const resa = await fetch('/api/data', {
      headers: {
        'Authorization': `Bearer ${token}`
    }
});
  } else {
    alert("ログイン失敗");
  }
}

function logout() {
  localStorage.removeItem("token");
  token = null;
  location.reload();
}

function showApp() {
  document.getElementById("login-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
}

async function loadRouletteData() {
  try {
    const res = await fetch(`${API_URL}/api/data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (result.data) {
      wheels = result.data;
      initEditors();
      updateWheels();
    }
  } catch {
    alert("データの読み込みに失敗しました");
  }
}

async function saveRouletteData() {
  try {
    await fetch(`${API_URL}/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: wheels }),
    });
  } catch {
    alert("保存に失敗しました");
  }
}
