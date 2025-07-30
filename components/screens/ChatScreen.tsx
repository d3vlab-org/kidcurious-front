import React from 'react';
import { ChatWindow } from '../ChatWindow';
import { ArrowLeft, Home } from 'lucide-react';

interface ChatScreenProps {
  onBack?: () => void;
  onHome?: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, onHome }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Navigation Header */}
      <div className="bg-white shadow-sm border-b-2 border-blue-200 p-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <h1 className="text-lg font-bold text-blue-800">Chat</h1>
        
        <button
          onClick={onHome}
          className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Home</span>
        </button>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow className="h-full" />
      </div>
    </div>
  );
};

export default ChatScreen;