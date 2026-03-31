import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MessagesSidebar from "../components/MessagesSidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyChat from "../components/EmptyChat";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(() => {
    try {
      const saved = localStorage.getItem("selectedChat");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (location.state?.chatUser) {
      setSelectedChat(location.state.chatUser);
      localStorage.setItem("selectedChat", JSON.stringify(location.state.chatUser));
      navigate("/messages", { replace: true, state: {} });
    }
  }, []);

  const handleSelectChat = (user) => {
    setSelectedChat(user);
    localStorage.setItem("selectedChat", JSON.stringify(user));
  };

  const handleBack = () => {
    setSelectedChat(null);
    localStorage.removeItem("selectedChat");
  };

  const handleDeleteChat = () => {
    setSelectedChat(null);
    localStorage.removeItem("selectedChat");
  };

  return (
    <div className="messages-page-wrapper flex overflow-hidden bg-theme-primary h-[calc(100dvh-56px)] md:h-screen">
      <div
        className={`flex-shrink-0 flex flex-col w-full md:w-[360px] lg:w-[400px] border-r border-theme bg-theme-sidebar ${selectedChat ? "hidden md:flex" : "flex"}`}
      >
        <MessagesSidebar
          onSelectChat={handleSelectChat}
          selectedUserId={selectedChat?._id}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      <div className={`flex-1 min-w-0 flex flex-col ${selectedChat ? "flex" : "hidden md:flex"}`}>
        {selectedChat ? (
          <ChatWindow key={selectedChat._id} chat={selectedChat} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyChat />
          </div>
        )}
      </div>
    </div>
  );
}
