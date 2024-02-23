import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Home.module.css";
import { decrypt, encrypt } from "./clientEncryption";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const initializeChat = () => {
      const welcomeMessage = {
        role: "assistant",
        content: "Hi, How can I help you today?",
      };
      setMessages([welcomeMessage]);
    };
    if (!messages?.length) {
      initializeChat();
    }
  }, [messages?.length, setMessages]);
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", { email, password });
      if (res.data.token) {
        setIsLoggedIn(true);
        localStorage.setItem("token", res.data.token);
        setErrorMessage("");
      } else {
        setErrorMessage("Failed to log in");
      }
    } catch (err) {
      setErrorMessage("Login error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("token");
  };

  const serverToClientTest = () => {
    const encryptedFromServer = encrypt({ test: "test1" });
    console.log("Encrypted by Server:", encryptedFromServer);

    const decryptedByClient = decrypt(encryptedFromServer);
    console.log("Decrypted by Client:", decryptedByClient);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Not authenticated");
      return;
    }

    const newMessage = {
      role: "user",
      content: prompt,
    };

    setLoading(true);
    axios
      .post(
        "/api/integrate-ai",
        { messages: encrypt([...messages, newMessage]) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((result) => {
        const res = decrypt(result.data.res);
        setMessages([...messages, newMessage, res.choices[0].message]);
        setResponse(res.choices[0].message.content);
        setPrompt("");
      })
      .catch((err) => {
        console.log(err);
        setErrorMessage("Error fetching AI response");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className={styles.container}>
      {!isLoggedIn ? (
        <form onSubmit={handleLogin}>
          <input
            className={styles.formInput}
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={styles.formInput}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>
      ) : (
        <>
          <button className={styles.button} onClick={handleLogout}>
            Logout
          </button>

          <form onSubmit={handleSubmit} className={styles.chat}>
            {messages.map((e, i) => {
              return (
                <>
                  <p key={i} className={styles.errorMessage}>
                    {e.role}
                  </p>
                  <> {e.content}</>
                </>
              );
            })}
            <textarea
              className={styles.formInput}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt for the AI"
            ></textarea>
            <button className={styles.button} disabled={loading} type="submit">
              {loading ? "Submitting..." : "Submit to AI"}
            </button>
          </form>
          <div className={styles.responseContainer}>
            <h3>AI Response:</h3>
            <p>{response}</p>
          </div>
        </>
      )}

      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
    </div>
  );
}
