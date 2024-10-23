// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  onSnapshot,
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1EO_E-51bS-Bf2pC7ok42olJxWitW1gI",
  authDomain: "chat-4b99b.firebaseapp.com",
  projectId: "chat-4b99b",
  storageBucket: "chat-4b99b.appspot.com",
  messagingSenderId: "702805514853",
  appId: "1:702805514853:web:ee02a41d16e3978bed048c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getFirestore(app); // Initialize Firestore

// Lucide icons initialization
lucide.createIcons();

// GSAP Animations
const tl = gsap.timeline();
tl.from("h1", {
  y: -50,
  opacity: 0,
  duration: 0.5,
  ease: "power2.out",
});

// Function to add a new message
function addMessage(text) {
  const messageDiv = `
  <div class="message">
    <p class="message-content">${data.message}</p>
    <p class="name">${data.name}</p>
    <p class="time">${time}</p>
  </div>
`;

  document.getElementById("msgs").appendChild(messageDiv);
  lucide.createIcons(); // Reinitialize icons

  // Animate new message
  gsap.from(messageDiv, {
    x: -20,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
  });

  // Scroll to bottom
  messageDiv.scrollIntoView({ behavior: "smooth" });
}

// Handle form submission
document.querySelector("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("message-input");
  if (input.value.trim()) {
    // Show typing indicator
    const typingIndicator = document.querySelector(".typing-indicator");
    gsap.to(typingIndicator, {
      opacity: 1,
      duration: 0.3,
    });

    // Animate typing dots
    gsap.to(".typing-dot", {
      y: -4,
      stagger: 0.2,
      repeat: 2,
      yoyo: true,
      duration: 0.3,
      onComplete: () => {
        // Hide typing indicator and send message
        gsap.to(typingIndicator, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            addMessage(input.value);
            input.value = ""; // Clear input after sending
          },
        });
      },
    });
  }
});

// Animate buttons on hover
document.querySelectorAll(".action-button").forEach((button) => {
  button.addEventListener("mouseenter", () => {
    gsap.to(button.querySelector("[data-lucide]"), {
      scale: 1.2,
      duration: 0.3,
    });
  });

  button.addEventListener("mouseleave", () => {
    gsap.to(button.querySelector("[data-lucide]"), {
      scale: 1,
      duration: 0.3,
    });
  });
});

// Send message to Firestore
document.getElementById("send-btn").onclick = async function (e) {
  e.preventDefault();
  const input = document.getElementById("message-input");
  if (input.value === "") {
    alert("Type anything");
    return;
  }

  const userName = localStorage.getItem("name");
  if (!userName) {
    alert("User not authenticated!");
    return;
  }

  try {
    // Add new message to Firestore
    await addDoc(collection(db, "message"), {
      message: input.value,
      time: new Date(),
      name: userName,
    });
    input.value = ""; // Clear input field
  } catch (error) {
    console.error("Error adding document: ", error);
  }

  // Fetch messages after adding
  messageGet();
};

// Fetch and display messages
const messageGet = async function () {
  const userName = localStorage.getItem("name");
  if (!userName) {
    window.location.href = "./"; // Redirect if not authenticated
    return;
  }

  const currentHour = new Date().getHours();
  let greeting =
    currentHour >= 5 && currentHour < 12
      ? "Good morning,"
      : currentHour >= 12 && currentHour < 18
      ? "Good afternoon,"
      : "Good evening,";

  document.getElementById("greeting").textContent = `${greeting}`;
  document.getElementById("userNameSpan").textContent = userName;

  let currentDate = null;
  const messagesElement = document.getElementById("msgs");
  let messagesHTML = "";

  // Real-time Firestore updates
  onSnapshot(query(collection(db, "message"), orderBy("time")), (snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      const messageDate = new Date(data.time.toMillis());

      // Add date separator if date changes
      if (
        !currentDate ||
        currentDate.toDateString() !== messageDate.toDateString()
      ) {
        currentDate = messageDate;
        const messageDateString = messageDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        messagesHTML += `<p class="date">${messageDateString}</p>`;
      }

      const hours = messageDate.getHours();
      const minutes = String(messageDate.getMinutes()).padStart(2, "0");
      const amPm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert to 12-hour format
      const time = `${formattedHours}:${minutes} ${amPm}`;
      const messageDiv = `
          <div class="message">
            <p class="name">${data.name}</p>
            <p class="message-content">${data.message}</p>
            <p class="time">${time}</p>
          </div>
        `;
      messagesHTML += messageDiv;
    });

    messagesElement.innerHTML = messagesHTML;
  });
};

window.onload = messageGet; // Load messages when page loads
