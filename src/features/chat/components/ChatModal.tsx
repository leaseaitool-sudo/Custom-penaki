
import React, { useState, useEffect, useRef } from 'react';
import { Lease, ChatMessage, Role, User } from '@/shared/types';
import { XCircleIcon } from '@/shared/ui/Icons/XCircleIcon';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { ExclamationCircleIcon } from '@/shared/ui/Icons/ExclamationCircleIcon';
import { EscalationModal } from '@/features/leases/components/EscalationModal';

interface ChatModalProps {
  lease: Lease;
  currentUser: User;
  onClose: () => void;
  onSendMessage: (leaseId: string, message: string) => void;
  onEscalate: (leaseId: string, notes: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ lease, currentUser, onClose, onSendMessage, onEscalate }) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = lease.chatHistory || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(lease.id, newMessage);
    setNewMessage('');
  };

  const handleEscalationSubmit = (leaseId: string, notes: string) => {
      onEscalate(leaseId, notes);
      setShowEscalation(false);
      // Auto-send a message confirming escalation
      onSendMessage(leaseId, `[SYSTEM: ESCALATION REQUESTED] ${notes}`);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-indigo-600 p-4 flex justify-between items-center text-white shadow-md z-10">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight">Team Penaki</h3>
                    <p className="text-xs text-blue-100 font-medium truncate max-w-[200px] opacity-90">{lease.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setShowEscalation(true)} 
                    className="p-2 hover:bg-white/20 rounded-full transition-colors text-white relative group"
                    title="Escalate this Lease"
                >
                    <ExclamationCircleIcon className="w-6 h-6" />
                    <span className="absolute top-full right-0 mt-1 w-24 p-1 bg-black/80 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">Escalate Issue</span>
                </button>
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
                    <XCircleIcon className="w-6 h-6" />
                </button>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
                    <p>Start a conversation with our team.</p>
                    <p className="text-xs mt-1">Ask questions or clarify lease details.</p>
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = msg.senderRole === Role.USER; // Assuming this component is for the Client
                const isSystem = msg.isSystemMessage;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm text-sm ${
                            isSystem ? 'bg-amber-50 border border-amber-200 text-amber-800 w-full text-center italic my-2' :
                            isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}>
                            {!isMe && !isSystem && (
                                <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wide">
                                    {msg.senderName}
                                </p>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-focus transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100 shadow-md"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
      </div>

      {showEscalation && (
          <EscalationModal 
            lease={lease} 
            onClose={() => setShowEscalation(false)} 
            onSubmit={handleEscalationSubmit} 
          />
      )}
    </div>
  );
};
