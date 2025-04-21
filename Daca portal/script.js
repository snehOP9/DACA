
let isLoggedIn = false;
let userRole = "guest";
let theme = "light";

const sidebarLinks = document.querySelectorAll(".sidebar a");
const contentSections = document.querySelectorAll(".content-section");
const loginPages = document.querySelectorAll(".login-page");
const userNameEl = document.getElementById("user-name");
const notificationEl = document.getElementById("notification");

sidebarLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    const sectionId = this.getAttribute("data-section");
    if (sectionId) {
      e.preventDefault();
      if (userRole === "guest" && sectionId !== "dashboard") {
        showNotification("Please log in to access this section.");
        showLogin("user");
      } else {
        showSection(sectionId);
      }
    }
  });
});

function showSection(sectionId) {
  sidebarLinks.forEach((l) => l.classList.remove("active"));
  contentSections.forEach((section) => section.classList.remove("active"));
  loginPages.forEach((page) => page.classList.remove("active"));

  document
    .querySelector(`a[data-section="${sectionId}"]`)
    .classList.add("active");
  document.getElementById(sectionId).classList.add("active");
}

function showLogin(type) {
  loginPages.forEach((page) => page.classList.remove("active"));
  document.getElementById(`${type}-login`).classList.add("active");
}

function login(type) {
  const username = document.getElementById(`${type}-username`).value;
  const password = document.getElementById(`${type}-password`).value;

  if (username && password) {
    isLoggedIn = true;
    userRole = type;
    userNameEl.textContent = username;
    showNotification(`${capitalize(type)} logged in successfully!`);
    showSection("dashboard");
  } else {
    showNotification("Please enter username and password.");
  }
}

function logout() {
  isLoggedIn = false;
  userRole = "guest";
  userNameEl.textContent = "Guest";
  showNotification("Logged out successfully!");
  showSection("dashboard");
}
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  theme = theme === "light" ? "dark" : "light";

  const icon = document.querySelector(".theme-toggle i");
  icon.classList.toggle("fa-moon");
  icon.classList.toggle("fa-sun");

  updateChartColors();
}

function showNotification(message) {
  notificationEl.textContent = message;
  notificationEl.classList.add("show");
  setTimeout(() => notificationEl.classList.remove("show"), 3000);
}

function filterEvents(category) {
  const events = document.querySelectorAll("#event-list li");
  events.forEach((event) => {
    event.style.display =
      category === "all" || event.dataset.category === category
        ? "block"
        : "none";
  });
}
function filterParticipation(role) {
  const rows = document.querySelectorAll("#participation-table tbody tr");
  rows.forEach((row) => {
    row.style.display =
      role === "all" || row.dataset.role === role ? "table-row" : "none";
  });
}
document
  .getElementById("participation-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (!isLoggedIn) {
      showNotification("Please log in to register.");
      showLogin("user");
      return;
    }
    const name = this.querySelector('input[type="text"]').value;
    const role = this.querySelectorAll("select")[0].value;
    const selectedEvent = this.querySelectorAll("select")[1].value;

    const tbody = document
      .getElementById("participation-table")
      .querySelector("tbody");
    const newRow = document.createElement("tr");
    newRow.dataset.role = role;

    let eventName = "Debate Competition";
    if (selectedEvent === "music") eventName = "Annual Music Festival";
    else if (selectedEvent === "art") eventName = "Art Exhibition";

    newRow.innerHTML = `
      <td>${name}</td>
      <td>${capitalize(role)}</td>
      <td>${eventName}</td>
      <td>Pending</td>
      <td><button onclick="updateStatus(this, 'Confirmed')">Confirm</button></td>
    `;
    tbody.appendChild(newRow);

    showNotification("Registered successfully!");
    this.reset();
  });

document.getElementById("event-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (userRole !== "admin") {
    showNotification("Only admins can add events.");
    return;
  }
  showNotification("Event added successfully!");
  this.reset();
});

document
  .getElementById("resource-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    if (userRole !== "admin") {
      showNotification("Only admins can allocate resources.");
      return;
    }
    showNotification("Resources allocated successfully!");
    this.reset();
  });
document.getElementById("venue-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!isLoggedIn) {
    showNotification("Please log in to book a venue.");
    showLogin("user");
    return;
  }
  showNotification("Venue booked successfully!");
  this.reset();
});

function updateStatus(button, status) {
  if (userRole !== "admin") {
    showNotification("Only admins can update status.");
    return;
  }
  const row = button.parentElement.parentElement;
  row.querySelector("td:nth-child(4)").textContent = status;
  button.textContent = status === "Confirmed" ? "Revert" : "Confirm";
  button.onclick = () =>
    updateStatus(button, status === "Confirmed" ? "Pending" : "Confirmed");
  showNotification(`Status updated to ${status}!`);
}

const bodyStyles = getComputedStyle(document.body);
const primaryColor = bodyStyles.getPropertyValue("--primary").trim();
const secondaryColor = bodyStyles.getPropertyValue("--secondary").trim();
const accentColor = bodyStyles.getPropertyValue("--accent").trim();
const textLightColor = bodyStyles.getPropertyValue("--text-light").trim();
const textDarkColor = bodyStyles.getPropertyValue("--text-dark").trim();
const eventCtx = document.getElementById("eventChart").getContext("2d");
const eventChart = new Chart(eventCtx, {
  type: "pie",
  data: {
    labels: ["Drama Fest 2024", "Dance Competition", "Music Festival"],
    datasets: [
      {
        data: [200, 150, 300],
        backgroundColor: [primaryColor, secondaryColor, "#4a7bc2"], 
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: textLightColor,
        },
      },
      title: {
        display: true,
        text: "Event Attendance Distribution",
        color: textLightColor,
      },
    },
  },
});

const attendanceCtx = document.getElementById("attendanceChart").getContext("2d");
const attendanceChart = new Chart(attendanceCtx, {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Attendance Growth",
        data: [120, 150, 180, 220, 300],
        borderColor: accentColor,
        backgroundColor: "rgba(243, 156, 18, 0.2)", // accent with alpha
        fill: true,
        tension: 0.1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: textLightColor,
        },
      },
      title: {
        display: true,
        text: "Attendance Growth Over Months",
        color: textLightColor,
      },
    },
    scales: {
      x: {
        ticks: {
          color: textLightColor,
        },
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
      y: {
        ticks: {
          color: textLightColor,
        },
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
      },
    },
  },
});
function updateChartColors() {
  eventChart.options.plugins.legend.labels.color =
    theme === "dark" ? textDarkColor : textLightColor;
  eventChart.options.plugins.title.color =
    theme === "dark" ? textDarkColor : textLightColor;
  attendanceChart.options.plugins.legend.labels.color =
    theme === "dark" ? textDarkColor : textLightColor;
  attendanceChart.options.plugins.title.color =
    theme === "dark" ? textDarkColor : textLightColor;

  attendanceChart.options.scales.x.ticks.color =
    theme === "dark" ? textDarkColor : textLightColor;
  attendanceChart.options.scales.y.ticks.color =
    theme === "dark" ? textDarkColor : textLightColor;

  attendanceChart.options.scales.x.grid.color =
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
  attendanceChart.options.scales.y.grid.color =
    theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)";
  eventChart.update();
  attendanceChart.update();
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
