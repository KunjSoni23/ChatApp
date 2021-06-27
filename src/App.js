import React, { useRef, useState } from "react";
import "./App.css";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { FiSend } from "react-icons/fi";
import { FaSignOutAlt } from "react-icons/fa";
import { Button } from "react-bootstrap";

import tinymce from "tinymce/tinymce";

firebase.initializeApp({
  //your config
  apiKey: "AIzaSyBMaBf-G55S-2MdSBet0FmYNRwQO5w32B8",
  authDomain: "chatapp-373da.firebaseapp.com",
  projectId: "chatapp-373da",
  storageBucket: "chatapp-373da.appspot.com",
  messagingSenderId: "825871631639",
  appId: "1:825871631639:web:5b7dd6a35c7f7fa1ece352",
  measurementId: "G-RVVJ32LWZK",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h2>⚛️🔥💬</h2>
        <SignOut />
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <Button
        onClick={signInWithGoogle}
        className="sign-in-button"
        variant="primary"
        size="xxl"
      >
        Sign In With Google
      </Button>{" "}
      <p className="startup-message">
        Do not violate the community guidelines or you will be banned for life!
      </p>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>
        {/* <Icon circular name="sign-out" /> */}
        <FaSignOutAlt />
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection("messages");
  const query = messagesRef.orderBy("createdAt").limit(25);

  const [messages] = useCollectionData(query, { idField: "id" });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  tinymce.init({
    selector: "#mytextarea",
    plugins: "emoticons",
    toolbar: "emoticons",
    toolbar_location: "bottom",
    menubar: false,
  });
  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <textarea
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type Your Message"
        />

        <button type="submit" disabled={!formValue}>
          <FiSend />
        </button>
      </form>

      <script
        src="https://cdn.tiny.cloud/1/2kjgann8fhr9wgtmavgfpqzueqigun0ps4zwak6j513s8fse/tinymce/5/tinymce.min.js"
        referrerpolicy="origin"
      ></script>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL || "https://api.adorable.io/avatars/23/abott@adorable.png"
          }
          alt=""
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
