// ==== Constants ====
const sessionTimes = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
const seatCount = 25;
const MAX_DAYS = 7;
const COOKIE_NAME = 'bookings';

// ==== State ====
let selectedDate = '';
let selectedSession = '';
let selectedSeats = [];

// ==== DOM Elements ====
const dateSelect = document.getElementById('date');
const sessionsDiv = document.getElementById('sessions');
const seatsDiv = document.getElementById('seats');
const bookBtn = document.getElementById('bookBtn');

// ==== Cookie Helpers ====
const getStoredBookings = () => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_NAME}=`));
  return cookie ? JSON.parse(decodeURIComponent(cookie.split('=')[1])) : {};
};

const saveBookings = (bookings) => {
  const encoded = encodeURIComponent(JSON.stringify(bookings));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}`;
};

const clearBookingsCookie = () => {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

// ==== Utils ====
const getSessionKey = () => `${selectedDate}_${selectedSession}`;

// ==== Date Handling ====
function generateDates() {
  const today = new Date();
  for (let i = 0; i < MAX_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const option = new Option(date.toDateString(), dateStr);
    dateSelect.appendChild(option);
  }
  selectedDate = dateSelect.value;
}

// ==== Session Handling ====
function renderSessions() {
  sessionsDiv.innerHTML = sessionTimes.map(time => {
    const active = time === selectedSession ? 'active' : '';
    return `<button class="session-btn ${active}" data-time="${time}">${time}</button>`;
  }).join('');
}

function handleSessionClick(e) {
  if (!e.target.classList.contains('session-btn')) return;

  selectedSession = e.target.dataset.time;
  selectedSeats = [];
  renderSessions(); // update active state
  renderSeats();
}

// ==== Seat Handling ====
function renderSeats() {
  seatsDiv.innerHTML = '';
  if (!selectedSession) return;

  const bookings = getStoredBookings();
  const booked = bookings[getSessionKey()] || [];

  for (let i = 1; i <= seatCount; i++) {
    const div = document.createElement('div');
    div.className = 'seat';
    div.textContent = i;
    div.dataset.seat = i;

    if (booked.includes(i)) {
      div.classList.add('booked');
    } else if (selectedSeats.includes(i)) {
      div.classList.add('selected');
    }

    seatsDiv.appendChild(div);
  }
}

function handleSeatClick(e) {
  if (!e.target.classList.contains('seat')) return;

  const seatNum = parseInt(e.target.dataset.seat);
  const bookedSeats = getStoredBookings()[getSessionKey()] || [];

  if (bookedSeats.includes(seatNum)) return;

  if (selectedSeats.includes(seatNum)) {
    selectedSeats = selectedSeats.filter(s => s !== seatNum);
  } else {
    selectedSeats.push(seatNum);
  }

  renderSeats();
}

// ==== Booking ====
function handleBooking() {
  if (!isBookingValid()) {
    alert('Please select a date, session, and at least one seat.');
    return;
  }

  const bookings = getStoredBookings();
  const sessionKey = getSessionKey();
  const currentSessionBookings = bookings[sessionKey] || [];

  const updatedBookings = [...currentSessionBookings, ...selectedSeats];
  bookings[sessionKey] = updatedBookings;

  saveBookings(bookings);
  resetSeatSelection();
  renderSeats();


  alert(`Successfully booked: ${updatedBookings.length} seats`);
}

function isBookingValid() {
  return selectedDate && selectedSession && selectedSeats.length > 0;
}

function resetSeatSelection() {
  selectedSeats = [];
}

// ==== Events ====
bookBtn.addEventListener('click', handleBooking);
dateSelect.addEventListener('change', () => {
  selectedDate = dateSelect.value;
  selectedSession = '';
  selectedSeats = [];
  renderSessions();
  seatsDiv.innerHTML = '';
});
sessionsDiv.addEventListener('click', handleSessionClick);
seatsDiv.addEventListener('click', handleSeatClick);

// ==== Init ====
generateDates();
renderSessions();
clearBookingsCookie();
