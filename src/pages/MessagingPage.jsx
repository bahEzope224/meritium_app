import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Mic } from 'lucide-react';

const MessagingPage = ({ user }) => {
  const [conversations] = useState([
    {
      id: 1,
      name: user.role === 'company' ? 'Profil Talent #1' : 'Entreprise Recruteur',
      lastMessage: 'Bonjour, votre profil correspond parfaitement à nos besoins...'
    }
  ]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'other',
      text: 'Bonjour, votre profil de compétences correspond parfaitement au poste que nous proposons. Seriez-vous disponible pour échanger sur les détails ?'
    },
    {
      id: 2,
      sender: 'me',
      text: 'Bonjour, merci pour votre intérêt. Oui, je suis intéressé(e) pour en savoir plus sur cette opportunité.'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: Date.now(),
        sender: 'me',
        text: newMessage.trim()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
        <div className="flex h-full flex-col sm:flex-row">
          {/* Conversations List */}
          <div className="w-full sm:w-1/3 border-b sm:border-b-0 sm:border-r border-gray-200 overflow-y-auto">
            <div className="p-4 bg-indigo-600 text-white font-semibold sticky top-0">
              💬 Conversations actives
            </div>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedConv?.id === conv.id
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-gray-800 mb-1">{conv.name}</div>
                <div className="text-sm text-gray-500 truncate">{conv.lastMessage}</div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                <div className="p-4 bg-gray-50 border-b font-semibold text-gray-800 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  {selectedConv.name}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl shadow ${
                          msg.sender === 'me'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm sm:text-base leading-relaxed break-words">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Envoyer"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                    <button
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      aria-label="Message vocal"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    🔒 Cette conversation reste anonyme jusqu'à validation mutuelle
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">Sélectionnez une conversation</p>
                  <p className="text-sm mt-2">Choisissez une conversation dans la liste</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
