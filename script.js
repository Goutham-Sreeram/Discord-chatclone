import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAWmqkD80ezafCkyMJpLinvxq8E4OA0KsM",
  authDomain: "chat-app-d7dc2.firebaseapp.com",
  projectId: "chat-app-d7dc2",
  storageBucket: "chat-app-d7dc2.appspot.com",
  messagingSenderId: "853514079785",
  appId: "1:853514079785:web:37bb38659b3865de415638",
  measurementId: "G-4WF44FQYFP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// GSAP animations for the landing page
window.onload = function () {
  // Animate the heading
  gsap.from("h1", {
    duration: 1,
    opacity: 0,
    y: -50,
    ease: "bounce.out",
  });

  // Animate the button
  gsap.from("#startButton", {
    duration: 1,
    opacity: 0,
    y: 50,
    delay: 0.5,
    ease: "power3.out",
  });
};
// ... (previous Firebase initialization code remains the same)

let activeChannels = new Set(["general"]); // Track currently open channels
let isSplitView = false;

// Function to toggle split view
function toggleSplitView() {
  const container = document.getElementById("channels-container");
  isSplitView = !isSplitView;
  container.className = isSplitView ? "split-view" : "single-view";

  // Update toggle button icon
  const toggleButton = document.getElementById("toggle-split-view");
  toggleButton
    .querySelector("i")
    .setAttribute("data-lucide", isSplitView ? "layout" : "layout-grid");
  lucide.createIcons();

  // Refresh all open channels
  refreshChannelViews();
}

// Function to create channel section
function createChannelSection(channelName) {
  const template = document.getElementById("channel-template");
  const section = template.content
    .cloneNode(true)
    .querySelector(".channel-section");

  section.setAttribute("data-channel", channelName);
  section.querySelector(".channel-name").textContent = channelName;
  section.querySelector(
    ".message-input"
  ).placeholder = `Message #${channelName}`;

  // Add event listeners
  section
    .querySelector(".close-channel")
    .addEventListener("click", () => closeChannel(channelName));
  section
    .querySelector(".toggle-maximize")
    .addEventListener("click", () => toggleMaximize(section));
  section
    .querySelector(".send-option")
    .addEventListener("submit", (e) => handleMessageSubmit(e, channelName));

  // Add drag and drop functionality
  section.setAttribute("draggable", "true");
  section.addEventListener("dragstart", handleDragStart);
  section.addEventListener("dragend", handleDragEnd);
  section.addEventListener("dragover", handleDragOver);
  section.addEventListener("drop", handleDrop);

  return section;
}

// Function to refresh channel views
function refreshChannelViews() {
  const container = document.getElementById("channels-container");
  container.innerHTML = "";

  activeChannels.forEach((channelName) => {
    const section = createChannelSection(channelName);
    container.appendChild(section);
    initializeChannelMessages(channelName, section.querySelector(".msgs"));
  });
}

// Function to open channel
function openChannel(channelName) {
  if (!activeChannels.has(channelName)) {
    if (!isSplitView) {
      activeChannels.clear(); // In single view, close other channels
    }
    activeChannels.add(channelName);
    refreshChannelViews();
  }

  // Update channel list UI
  document.querySelectorAll(".channel-item").forEach((item) => {
    item.classList.toggle(
      "active",
      activeChannels.has(item.textContent.trim())
    );
  });
}

// Function to close channel
function closeChannel(channelName) {
  const section = document.querySelector(
    `.channel-section[data-channel="${channelName}"]`
  );
  section.classList.add("closing");

  section.addEventListener(
    "animationend",
    () => {
      activeChannels.delete(channelName);
      refreshChannelViews();

      // If no channels are open, open general
      if (activeChannels.size === 0) {
        openChannel("general");
      }
    },
    { once: true }
  );
}

// Function to toggle maximize
function toggleMaximize(section) {
  section.classList.toggle("maximized");
  const icon = section.querySelector(".toggle-maximize i");
  icon.setAttribute(
    "data-lucide",
    section.classList.contains("maximized") ? "minimize-2" : "maximize-2"
  );
  lucide.createIcons();
}

// Initialize channel messages with real-time updates
function initializeChannelMessages(channelName, messagesElement) {
  const channelMessagesRef = collection(
    db,
    "channels",
    channelName,
    "messages"
  );
  const q = query(channelMessagesRef, orderBy("time"));

  return onSnapshot(q, (snapshot) => {
    let messagesHTML = "";
    let currentDate = null;

    snapshot.forEach((doc) => {
      const data = doc.data();
      const messageDate = new Date(data.time.toMillis());
      const isUser = data.name === localStorage.getItem("name");

      // ... (previous message rendering code remains the same)
    });

    messagesElement.innerHTML = messagesHTML;
    messagesElement.scrollTop = messagesElement.scrollHeight;
  });
}

// Drag and drop handlers
function handleDragStart(e) {
  e.target.classList.add("dragging");
  e.dataTransfer.setData("text/plain", e.target.getAttribute("data-channel"));
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging");
  document.querySelectorAll(".channel-section").forEach((section) => {
    section.classList.remove("drag-over");
  });
}

function handleDragOver(e) {
  e.preventDefault();
  if (!e.target.closest(".channel-section").classList.contains("dragging")) {
    e.target.closest(".channel-section").classList.add("drag-over");
  }
}

function handleDrop(e) {
  e.preventDefault();
  const draggedChannel = e.dataTransfer.getData("text/plain");
  const dropTarget = e.target.closest(".channel-section");

  if (draggedChannel && dropTarget) {
    const container = document.getElementById("channels-container");
    const sections = Array.from(container.children);
    const draggedSection = document.querySelector(
      `.channel-section[data-channel="${draggedChannel}"]`
    );
    const dropTargetIndex = sections.indexOf(dropTarget);

    container.insertBefore(draggedSection, dropTarget);
  }

  dropTarget.classList.remove("drag-over");
}

// Event Listeners
document
  .getElementById("toggle-split-view")
  .addEventListener("click", toggleSplitView);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initializeChannels();
  // Set up initial view
  openChannel("general");
});
// Add any additional JS functionalities below

document.getElementById("startButton").onclick = async function () {
  // Get the user's name from the input field
  // const name = document.getElementById("nameInput").value;

  // if (name === "") {
  //   alert("Please enter a name");
  //   return;
  // }

  // Initialize the Google Sign-In provider
  const provider = new GoogleAuthProvider();

  try {
    // Sign in with Google
    const result = await signInWithPopup(auth, provider);

    // Check if the user is authenticated
    if (result.user) {
      // Store the user's name in localStorage
      localStorage.setItem("name", result.user.displayName);

      // Redirect to the chat page
      window.location.href = "./chat.html";
    } else {
      alert("Authentication failed. Please try again.");
    }
  } catch (error) {
    // Handle authentication errors here
    console.error(error);
  }
};
