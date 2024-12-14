import React, { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const ChatApp = () => {
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState("Chat 1");

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://your-signalr-endpoint")
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR connected!");
        setConnection(connection);
      })
      .catch((err) => console.error("Connection failed:", err));

    connection.on("ReceiveMessage", (message) => {
      setReceivedMessages((prevMessages) => [...prevMessages, message]);
    });

    connection.onclose(() => setConnection(null));

    return () => {
      if (connection) {
        connection.stop().catch((err) => console.error("Error stopping connection:", err));
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (connection && connection.state === signalR.HubConnectionState.Connected) {
      connection
        .invoke("SendMessage", message)
        .then(() => setMessage(""))
        .catch((err) => console.error("Error sending message:", err));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMessage((prevMessage) => prevMessage + ` [Image: ${file.name}]`);
    }
  };

  const handleChatClick = (chatName) => {
    setCurrentChat(chatName);
    setReceivedMessages([]);
  };

  const chats = [
    { name: "Marwa", image: "https://via.placeholder.com/50", lastMessage: "Last seen at 10:30 AM" },
    { name: "Abdullah Ali Ezzat", image: "https://via.placeholder.com/50", lastMessage: "Last message at 10:00 AM" },
  ];

  return (
    <div className="container-fluid chat-app" style={{ height: "100vh" }}>
      <div className="row" style={{ height: "100%" }}>
        {/* Sidebar */}
        <div className="bg-light border-right d-flex flex-column" style={{ width: "40%", height: "100%" }}>
          <div className="py-3 px-4 border-bottom">
            <h4>Chats</h4>
          </div>
          <div className="px-3">
            {chats.map((chat, index) => (
              <div
                key={index}
                className="d-flex align-items-center p-2 border-bottom chat-item"
                onClick={() => handleChatClick(chat.name)}
                style={{ cursor: "pointer" }}
              >
                <img src={chat.image} alt="User" className="rounded-circle me-3" width="50" height="50" />
                <div>
                  <h6 className="mb-0">{chat.name}</h6>
                  <small className="text-muted">{chat.lastMessage}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="d-flex flex-column" style={{ width: "60%", height: "100%" }}>
          <div className="d-flex justify-content-between align-items-center border-bottom py-2 px-3 bg-light">
            <h5 className="mb-0">{currentChat}</h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => alert("Video call started")}
            >
              <i className="fa fa-video-camera me-1" aria-hidden="true"></i> Video Call
            </button>
          </div>

          <div className="messages p-3 flex-grow-1" style={{ overflowY: "auto" }}>
            {receivedMessages.map((msg, index) => (
              <div key={index} className="mb-2">
                <div className="alert alert-secondary p-2 mb-0">{msg}</div>
              </div>
            ))}
          </div>

          <div className="p-3 border-top bg-light">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
              />
              <div className="input-group-append">
                <label htmlFor="image-upload" className="btn btn-outline-secondary mb-0">
                  <i className="fa fa-paperclip" aria-hidden="true"></i>
                </label>
                <input
                  type="file"
                  id="image-upload"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              </div>
              <button className="btn btn-primary ms-2" onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
