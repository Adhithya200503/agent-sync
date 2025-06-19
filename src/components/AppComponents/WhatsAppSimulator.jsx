import React, { useState, useEffect } from "react";
import {
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
} from "lucide-react";

export default function WhatsAppSimulator({ formData }) {
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  useEffect(() => {
    if (formData?.message) {
      setMessages([
        {
          id: 1,
          text: formData.message,
          sent: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [formData?.message]);

  const sendMessage = () => {
    if (currentMessage.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: currentMessage,
          sent: true,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setCurrentMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full max-w-xs h-[600px] flex flex-col bg-white  border rounded-xl shadow-md overflow-hidden">
        <Header phoneNumber={formData?.phone} />
        <ChatArea messages={messages} />
        <MessageInput
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          onSendMessage={sendMessage}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
}

function Header({ phoneNumber }) {
  return (
    <div className="flex items-center justify-between bg-green-600 text-white px-4 py-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-green-900">
          {phoneNumber?.slice(-2) || "WA"}
        </div>
        <div>
          <div className="font-semibold text-sm">
            {phoneNumber || "WhatsApp User"}
          </div>
          <div className="text-xs opacity-70">online</div>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Phone className="w-5 h-5" />
        <Video className="w-5 h-5" />
        <MoreVertical className="w-5 h-5" />
      </div>
    </div>
  );
}

function ChatArea({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 bg-slate-100 dark:bg-gray-900 space-y-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow ${
            msg.sent
              ? "ml-auto bg-green-100 dark:bg-green-500 text-right"
              : "mr-auto bg-white dark:text-white dark:bg-black  text-left"
          }`}
        >
          <p className="whitespace-pre-line">{msg.text}</p>
          <div className="text-[10px] text-gray-500 mt-1">{msg.time}</div>
        </div>
      ))}
    </div>
  );
}

function MessageInput({
  currentMessage,
  setCurrentMessage,
  onSendMessage,
  onKeyPress,
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-black border-t border-gray-300">
      <Smile className="text-gray-600 w-5 h-5 cursor-pointer" />
      <Paperclip className="text-gray-600 w-5 h-5 cursor-pointer" />
      <textarea
        value={currentMessage}
        onChange={(e) => setCurrentMessage(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Type a message"
        rows={1}
        className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
      />
      {currentMessage.trim() ? (
        <Send
          onClick={onSendMessage}
          className="text-green-600 w-5 h-5 cursor-pointer"
        />
      ) : (
        <Mic className="text-gray-600 w-5 h-5 cursor-pointer" />
      )}
    </div>
  );
}
