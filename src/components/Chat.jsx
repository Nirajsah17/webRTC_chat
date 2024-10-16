import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Peer from 'peerjs';
import { Send, Image, LogOut, User, Menu, X } from 'lucide-react';

const Chat = () => {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [connectedPeer, setConnectedPeer] = useState(null);
  const [fileUploadProgress, setFileUploadProgress] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const newPeer = new Peer(username);
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      conn.on('data', (data) => {
        handleIncomingMessage(data);
      });
      setConnectedPeer(conn.peer);
    });

    return () => {
      newPeer.destroy();
    };
  }, [username, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIncomingMessage = (data) => {
    if (data.type === 'text' || data.type === 'image' || data.type === 'video') {
      setMessages((prevMessages) => [...prevMessages, data]);
    }
  };

  const connectToPeer = (targetPeerId) => {
    if (peer && targetPeerId) {
      const conn = peer.connect(targetPeerId);
      conn.on('open', () => {
        setConnectedPeer(targetPeerId);
        conn.on('data', (data) => {
          handleIncomingMessage(data);
        });
      });
    }
  };

  const sendMessage = (content, type) => {
    if (peer && connectedPeer) {
      const message = { sender: username, content, type };
      peer.connections[connectedPeer].forEach((conn) => {
        conn.send(message);
      });
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessage(inputMessage, 'text');
      setInputMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target?.result;
        const fileType = file.type.startsWith('image/') ? 'image' : 'video';
        sendMessage(fileContent, fileType);
      };
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFileUploadProgress(progress);
        }
      };
      reader.onloadend = () => {
        setFileUploadProgress(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:hidden"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">web Chat</h1>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full">
            <div
              className={`${
                isSidebarOpen ? 'block' : 'hidden'
              } md:block md:w-1/4 bg-white shadow-lg rounded-lg overflow-hidden mr-4 absolute md:relative z-10 w-full md:w-auto`}
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Your Info</h2>
                <div className="flex items-center mb-2">
                  <User className="mr-2 h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{username}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500">Your Peer ID:</span>
                  <span className="ml-2 text-sm font-mono bg-gray-100 px-2 py-1 rounded">{peerId}</span>
                </div>
              </div>
              <div className="p-4 border-t">
                <h2 className="text-lg font-semibold mb-4">Connect to Peer</h2>
                <input
                  type="text"
                  placeholder="Enter Peer ID"
                  className="w-full px-3 py-2 border rounded-md"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      connectToPeer(e.target.value);
                      setIsSidebarOpen(false);
                    }
                  }}
                />
              </div>
              {connectedPeer && (
                <div className="p-4 border-t">
                  <h2 className="text-lg font-semibold mb-2">Connected to:</h2>
                  <span className="text-green-600 font-semibold">{connectedPeer}</span>
                </div>
              )}
            </div>
            <div className="flex-grow bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div className="flex-grow overflow-y-auto p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.sender === username ? 'text-right' : 'text-left'
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === username
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1">{message.sender}</p>
                      {message.type === 'text' && <p>{message.content}</p>}
                      {message.type === 'image' && (
                        <img src={message.content} alt="Shared image" className="max-w-full h-auto rounded" />
                      )}
                      {message.type === 'video' && (
                        <video src={message.content} controls className="max-w-full h-auto rounded" />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t">
                {fileUploadProgress !== null && (
                  <div className="mb-2">
                    <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${fileUploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type a message..."
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <Image className="h-5 w-5" />
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
