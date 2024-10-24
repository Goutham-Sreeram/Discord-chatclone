// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  onSnapshot,
  getFirestore,
  addDoc,
  collection,
  query,
  orderBy,
  getDocs,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

// Firebase configuration (your existing config)
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

let currentChannel = "general"; // Default channel

// Function to create a new channel
async function createChannel(channelName) {
  const channelRef = doc(db, "channels", channelName);
  await setDoc(channelRef, {
    name: channelName,
    createdAt: new Date(),
  });

  // Add the channel to the sidebar
  addChannelToSidebar(channelName);
}

// Function to add channel to sidebar
function addChannelToSidebar(channelName) {
  const channelItem = document.createElement("div");
  channelItem.className = "channel-item";
  channelItem.innerHTML = `
    <i data-lucide="hash"></i>
    ${channelName}
  `;

  channelItem.addEventListener("click", () => switchChannel(channelName));
  document.querySelector(".channels-list").appendChild(channelItem);
  lucide.createIcons(); // Refresh icons
}

// Function to switch channels
async function switchChannel(channelName) {
  currentChannel = channelName;
  document.querySelectorAll(".channel-item").forEach((item) => {
    item.classList.remove("active");
    if (item.textContent.trim() === channelName) {
      item.classList.add("active");
    }
  });

  // Update header and input placeholder
  document.querySelector("h1 span.channel-name").textContent = channelName;
  document.getElementById(
    "message-input"
  ).placeholder = `Message #${channelName}`;

  // Clear current messages and load new channel messages
  document.getElementById("msgs").innerHTML = "";
  await messageGet();
}

// Modified messageGet function to handle channels
const messageGet = async function () {
  const userName = localStorage.getItem("name");
  if (!userName) {
    window.location.href = "./";
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

  // Real-time Firestore updates for current channel
  const channelMessagesRef = collection(
    db,
    "channels",
    currentChannel,
    "messages"
  );
  const q = query(channelMessagesRef, orderBy("time"));

  onSnapshot(q, (snapshot) => {
    messagesHTML = "";
    currentDate = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const messageDate = new Date(data.time.toMillis());

      const isUser = data.name === userName;
      const messageClass = isUser ? "sender" : "receiver";

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
      const formattedHours = hours % 12 || 12;
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
    messagesElement.scrollTop = messagesElement.scrollHeight;
  });
};

// Modified send message function to handle channels
document.querySelector(".send-option").addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById("message-input");
  const messageText = messageInput.value.trim();
  if (messageText === "") return;

  const userName = localStorage.getItem("name");

  // Add message to the current channel's messages collection
  await addDoc(collection(db, "channels", currentChannel, "messages"), {
    name: userName,
    message: messageText,
    time: new Date(),
  });

  messageInput.value = "";
});

// Initialize channels
async function initializeChannels() {
  // Get existing channels
  const channelsSnapshot = await getDocs(collection(db, "channels"));
  const channelsList = document.querySelector(".channels-list");
  channelsList.innerHTML = ""; // Clear existing channels

  channelsSnapshot.forEach((doc) => {
    addChannelToSidebar(doc.id);
  });

  // Set initial channel
  if (channelsSnapshot.empty) {
    await createChannel("general");
  }
  switchChannel(currentChannel);
}

// Add new channel button listener
document.getElementById("add-channel-btn").addEventListener("click", () => {
  const channelName = prompt("Enter new channel name:")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  if (channelName) {
    createChannel(channelName);
  }
});

// Initialize the application
initializeChannels();
