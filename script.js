const searchForm = document.querySelector("#search-form");
const pickupDate = document.querySelector("#pickup-date");
const returnDate = document.querySelector("#return-date");
const searchSummary = document.querySelector("#search-summary");
const carCards = [...document.querySelectorAll(".car-card")];
const emptyState = document.querySelector("#empty-state");
const bookingDialog = document.querySelector("#booking-dialog");
const reservationForm = document.querySelector("#reservation-form");
const successMessage = document.querySelector("#dialog-success");
const dayInMs = 24 * 60 * 60 * 1000;

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRentalDays() {
  const pickup = new Date(`${pickupDate.value}T12:00:00`);
  const dropoff = new Date(`${returnDate.value}T12:00:00`);
  if (!pickupDate.value || !returnDate.value || dropoff <= pickup) return 1;
  return Math.ceil((dropoff - pickup) / dayInMs);
}

const today = new Date();
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const dayAfter = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);
pickupDate.min = toLocalDateString(today);
pickupDate.value = toLocalDateString(tomorrow);
returnDate.min = toLocalDateString(tomorrow);
returnDate.value = toLocalDateString(dayAfter);

pickupDate.addEventListener("change", () => {
  returnDate.min = pickupDate.value || toLocalDateString(today);
  if (returnDate.value <= pickupDate.value) {
    const pickup = new Date(`${pickupDate.value}T12:00:00`);
    pickup.setDate(pickup.getDate() + 1);
    returnDate.value = toLocalDateString(pickup);
  }
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!searchForm.reportValidity()) return;

  const location = document.querySelector("#pickup-location").value;
  const pickup = new Date(`${pickupDate.value}T12:00:00`);
  const dropoff = new Date(`${returnDate.value}T12:00:00`);
  if (dropoff <= pickup) {
    returnDate.setCustomValidity("Choose a return date after your pick-up date.");
    returnDate.reportValidity();
    returnDate.setCustomValidity("");
    return;
  }

  document.querySelector('[data-filter="all"]').click();
  searchSummary.textContent = `Showing all 6 cars for ${getRentalDays()} ${getRentalDays() === 1 ? "day" : "days"} · Pick-up at ${location}. Choose a car to send a demo request.`;
  document.querySelector("#fleet").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((filter) => {
      filter.classList.toggle("is-active", filter === button);
      filter.setAttribute("aria-pressed", String(filter === button));
    });

    const category = button.dataset.filter;
    let visibleCount = 0;
    carCards.forEach((card) => {
      const visible = category === "all" || card.dataset.category === category;
      card.hidden = !visible;
      if (visible) visibleCount += 1;
    });
    emptyState.hidden = visibleCount > 0;
  });
});

document.querySelectorAll(".favorite-button").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(saved));
    button.textContent = saved ? "♥" : "♡";
    button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${button.getAttribute("aria-label").replace(/^(Save|Remove) /, "")}`);
  });
});

document.querySelectorAll(".reserve-button").forEach((button) => {
  button.addEventListener("click", () => {
    const car = button.dataset.car;
    const rate = Number(button.dataset.rate);
    const days = getRentalDays();
    document.querySelector("#selected-car").textContent = car;
    document.querySelector("#rental-estimate").textContent = `${days} ${days === 1 ? "day" : "days"} · $${rate * days} estimated rental total · taxes and extras not included`;
    successMessage.hidden = true;
    reservationForm.reset();
    bookingDialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => bookingDialog.close());
bookingDialog.addEventListener("click", (event) => {
  if (event.target === bookingDialog) bookingDialog.close();
});

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!reservationForm.reportValidity()) return;

  const name = new FormData(reservationForm).get("customerName").trim();
  successMessage.textContent = `Thanks, ${name}! This is a demo site, so your request wasn't sent and no car was booked. Call (555) 014-0142 to reach our demo rental team.`;
  successMessage.hidden = false;
});

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") !== "true";
  menuToggle.setAttribute("aria-expanded", String(expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
  primaryNav.classList.toggle("is-open", expanded);
});
primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    primaryNav.classList.remove("is-open");
  });
});
