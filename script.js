import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/9.12.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1EO_E-51bS-Bf2pC7ok42olJxWitW1gI",
  authDomain: "chat-4b99b.firebaseapp.com",
  projectId: "chat-4b99b",
  storageBucket: "chat-4b99b.appspot.com",
  messagingSenderId: "702805514853",
  appId: "1:702805514853:web:ee02a41d16e3978bed048c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
