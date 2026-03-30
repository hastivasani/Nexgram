import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MessagesSidebar from "../components/MessagesSidebar";
import ChatWindow from "../components/ChatWindow";
import EmptyChat from "../components/EmptyChat";
import { getConversationList } from "../services/api";

export default function Messages() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);

  // On mount: if location.state has chatUser, validate it exists in conversations
  useEffect(() => {
    if (!location.state?.chatUser) return;
    const chatUser = location.state.chatUser;
    // Validate this conversation still exists
    getConversationList().then(res => {
      const exists = res.data.some(c => c.user._id === chatUser._id);
      if (exists) setSelectedChat(chatUser);
      else {
        // Clear stale location state
        navigate("/messages", { replace: true, state: {} });
      }
    }).catch(() => {
      setSelectedChat(chatUser); // fallback: just set it
    });
  }, []);

  const handleSelectChat = (user) => setSelectedChat(user);
  const handleBack       = ()     => setSelectedChat(null);

  const handleDeleteChat = () => {
    setSelectedChat(null);
    // Clear location state so refresh doesn't restore it
    navigate("/messages", { replace: true, state: {} });
  };

  return (
    <div className="messages-page-wrapper flex overflow-hidden bg-theme-primary">

      <div
        className={`
          flex-shrink-0 flex flex-col
          w-full md:w-[360px] lg:w-[400px]
          border-r border-theme bg-theme-sidebar
          ${selectedChat ? "hidden md:flex" : "flex"}
        `}
      >
        <MessagesSidebar
          onSelectChat={handleSelectChat}
          selectedUserId={selectedChat?._id}
          onDeleteChat={handleDeleteChat}
        />
      </div>

      <div
        className={`
          flex-1 min-w-0 flex flex-col
          ${selectedChat ? "flex" : "hidden md:flex"}
        `}
      >
        {selectedChat ? (
          <ChatWindow
            key={selectedChat._id}
            chat={selectedChat}
            onBack={handleBack}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <EmptyChat />
          </div>
        )}
      </div>

    </div>
  );
}
