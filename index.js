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
  apiKey: "AIzaSyAWmqkD80ezafCkyMJpLinvxq8E4OA0KsM",
  authDomain: "chat-app-d7dc2.firebaseapp.com",
  projectId: "chat-app-d7dc2",
  storageBucket: "chat-app-d7dc2.appspot.com",
  messagingSenderId: "853514079785",
  appId: "1:853514079785:web:37bb38659b3865de415638",
  measurementId: "G-4WF44FQYFP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

      const isUser = data.name === userName; // Check if the message is from the user
      const messageClass = isUser ? "sender" : "receiver"; // Determine class

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
          <div class="message ${messageClass}">
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

// Function to add a new message
function addMessage(text, isUser = true) {
  const messageClass = isUser ? "sender" : "receiver";

  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", messageClass);

  const messageContent = `
    <p class="message-content">${text}</p>
    <p class="name">${isUser ? "You" : "Other User"}</p>
    <p class="time">${new Date().toLocaleTimeString()}</p>
  `;

  messageDiv.innerHTML = messageContent;
  document.getElementById("msgs").appendChild(messageDiv);

  // Animate new message
  gsap.from(messageDiv, {
    x: isUser ? 20 : -20,
    opacity: 0,
    duration: 0.5,
    ease: "power2.out",
  });

  // Scroll to bottom
  messageDiv.scrollIntoView({ behavior: "smooth" });
}

// Send message on form submission
document.querySelector(".send-option").addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();
  if (messageText === "") return;

  const userName = localStorage.getItem("name");

  // Add message to Firestore
  await addDoc(collection(db, "message"), {
    name: userName,
    message: messageText,
    time: new Date(),
  });

  // Add to local display
  addMessage(messageText, true);
  messageInput.value = ""; // Clear input
});

// Initialize the message display
messageGet();
