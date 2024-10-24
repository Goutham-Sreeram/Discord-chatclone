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
