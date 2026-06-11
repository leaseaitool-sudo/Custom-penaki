
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Lease, ChatMessage, Role, User, SupportChat } from '@/shared/types';
import { ScrollAnimatedSection } from '@/shared/ui/Animations/ScrollAnimatedSection';
import { UserCircleIcon } from '@/shared/ui/Icons/UserCircleIcon';
import { ArrowRightIcon } from '@/shared/ui/Icons/ArrowRightIcon';
import { MagnifyingGlassIcon } from '@/shared/ui/Icons/MagnifyingGlassIcon';
import { DocumentTextIcon } from '@/shared/ui/Icons/DocumentTextIcon';
import { EyeIcon } from '@/shared/ui/Icons/EyeIcon';
import { ClockIcon } from '@/shared/ui/Icons/ClockIcon';
import { ChatBubbleLeftRightIcon } from '@/shared/ui/Icons/ChatBubbleLeftRightIcon';
import { UsersIcon } from '@/shared/ui/Icons/UsersIcon';
import { PlusCircleIcon } from '@/shared/ui/Icons/PlusCircleIcon';

interface ChatManagerProps {
  leases: Lease[];
  supportChats: SupportChat[];
  currentUser: User;
  onSendMessage: (chatId: string, message: string) => void;
  onViewLease: (lease: Lease) => void;
  // Admin Only Props
  onAssignReviewer?: (chatId: string, reviewerEmail: string) => void;
  reviewers?: User[];
}

// Unified Type for List Items
type Conversation = {
    id: string;
    type: 'lease' | 'support';
    title: string;
    subTitle: string;
    timestamp: Date;
    lastMessage: string;
    leaseRef?: Lease;
    supportRef?: SupportChat;
};

export const ChatManager: React.FC<ChatManagerProps> = ({ 
    leases, 
    supportChats, 
    currentUser, 
    onSendMessage, 
    onViewLease,
    onAssignReviewer,
    reviewers
}) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine and Filter Conversations
  const conversations = useMemo(() => {
      const all: Conversation[] = [];

      // 1. Process Support Chats
      supportChats.forEach(chat => {
          const hasAccess = 
            currentUser.role === Role.ADMIN || 
            currentUser.role === Role.SUPER_ADMIN || 
            currentUser.email === chat.clientEmail ||
            (currentUser.role === Role.REVIEWER && chat.allowedReviewers.includes(currentUser.email));

          if (!hasAccess) return;

          const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
          
          all.push({
              id: chat.id,
              type: 'support',
              title: currentUser.email === chat.clientEmail ? 'Team Penaki' : chat.clientName, // Client sees "Team Penaki", Admin sees Client Name
              subTitle: currentUser.email === chat.clientEmail ? 'Support & General Inquiries' : 'Client Support Chat',
              timestamp: lastMsg?.timestamp || chat.lastUpdated,
              lastMessage: lastMsg?.content || 'No messages yet.',
              supportRef: chat
          });
      });

      // 2. Process Lease Chats
      leases.forEach(lease => {
          const hasChats = lease.chatHistory && lease.chatHistory.length > 0;
          
          // Access Control Logic for Admin/Reviewer/User
          const isAdmin = currentUser.role === Role.ADMIN || currentUser.role === Role.SUPER_ADMIN;
          const isOwner = currentUser.email === lease.user?.email;
          const isActiveR1 = lease.reviewer?.email === currentUser.email && (lease.workflowStage === 'R1_ASSIGNED' || lease.workflowStage === 'R1_IN_PROGRESS');
          const isR2 = lease.reviewerR2?.email === currentUser.email;
          
          const hasAccess = isAdmin || isOwner || isActiveR1 || isR2;

          if (!hasAccess) return;
          if (!hasChats && !isAdmin) return; // Non-admins only see leases with existing history

          const lastMsg = hasChats ? lease.chatHistory![lease.chatHistory!.length - 1] : null;
          
          all.push({
              id: lease.id,
              type: 'lease',
              title: lease.user?.username || 'Unknown Client',
              subTitle: lease.name,
              timestamp: lastMsg?.timestamp || lease.uploadDate,
              lastMessage: lastMsg?.content || 'No messages yet.',
              leaseRef: lease
          });
      });

      return all
        .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.subTitle.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  }, [leases, supportChats, currentUser, searchTerm]);

  const selectedConversation = useMemo(() => conversations.find(c => c.id === selectedChatId) || (conversations.length > 0 ? conversations[0] : null), [conversations, selectedChatId]);

  useEffect(() => {
      if (selectedConversation) {
          if (selectedChatId !== selectedConversation.id) setSelectedChatId(selectedConversation.id);
          scrollToBottom();
      }
  }, [selectedConversation, selectedConversation?.lastMessage]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    onSendMessage(selectedConversation.id, newMessage);
    setNewMessage('');
  };

  const messages = useMemo(() => {
      if (!selectedConversation) return [];
      if (selectedConversation.type === 'lease') return selectedConversation.leaseRef?.chatHistory || [];
      return selectedConversation.supportRef?.messages || [];
  }, [selectedConversation]);

  if (conversations.length === 0) {
      return (
          <ScrollAnimatedSection className="flex flex-col items-center justify-center h-[60vh] bg-surface border border-dashed border-border rounded-3xl m-4">
              <div className="p-6 bg-slate-50 rounded-full mb-4">
                  <ChatBubbleLeftRightIcon className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-text-main">No Active Conversations</h3>
              <p className="text-slate-500 mt-2">Start a chat from a lease or wait for client messages.</p>
          </ScrollAnimatedSection>
      );
  }

  return (
    <ScrollAnimatedSection className="h-[calc(100vh-140px)] max-w-[95rem] mx-auto p-4 flex gap-6">
      {/* Sidebar List */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-slate-50">
              <h2 className="font-bold text-lg text-text-main mb-3 flex items-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary" />
                  Messages
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-auto">{conversations.length}</span>
              </h2>
              <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search chats..." 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
              {conversations.map(chat => {
                  const isActive = selectedConversation?.id === chat.id;
                  const isSupport = chat.type === 'support';
                  
                  return (
                      <div 
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${isActive ? 'bg-sky-50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
                      >
                          <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2 overflow-hidden">
                                  {isSupport && <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" title="General Support Chat"></div>}
                                  <span className={`font-bold text-sm truncate ${isActive ? 'text-primary' : 'text-text-main'}`}>{chat.title}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 flex-shrink-0">{chat.timestamp.toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium truncate mb-1">{chat.subTitle}</p>
                          <p className="text-xs text-slate-400 truncate pr-2">
                              {chat.lastMessage}
                          </p>
                      </div>
                  );
              })}
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden relative">
          {selectedConversation ? (
              <>
                <div className="p-4 border-b border-border bg-slate-50 flex justify-between items-center shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${selectedConversation.type === 'support' ? 'bg-purple-100 text-purple-600 border-purple-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'}`}>
                            {selectedConversation.title.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-bold text-text-main flex items-center gap-2">
                                {selectedConversation.title}
                                {selectedConversation.type === 'support' && <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">SUPPORT</span>}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                {selectedConversation.type === 'lease' ? <DocumentTextIcon className="w-3 h-3" /> : <UsersIcon className="w-3 h-3" />}
                                <span className="truncate max-w-[200px]">{selectedConversation.subTitle}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* Admin Action: Assign Reviewer to Support Chat */}
                        {currentUser.role === Role.ADMIN && selectedConversation.type === 'support' && onAssignReviewer && (
                            <div className="relative">
                                <button 
                                    onClick={() => setShowAssignModal(!showAssignModal)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-purple-200 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-50 transition-all"
                                >
                                    <PlusCircleIcon className="w-4 h-4" /> Add Reviewer
                                </button>
                                {showAssignModal && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-border z-50 p-2 animate-fade-in">
                                        <p className="text-xs font-bold text-slate-500 px-2 py-1 mb-1">Select Reviewer</p>
                                        {reviewers?.map(r => (
                                            <button
                                                key={r.email}
                                                onClick={() => {
                                                    onAssignReviewer(selectedConversation.id, r.email);
                                                    setShowAssignModal(false);
                                                }}
                                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-slate-100 rounded text-text-main"
                                            >
                                                {r.username}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* View Lease Button */}
                        {selectedConversation.type === 'lease' && selectedConversation.leaseRef && (
                            <button 
                                onClick={() => onViewLease(selectedConversation.leaseRef!)}
                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:text-primary hover:border-primary hover:shadow-sm transition-all"
                            >
                                <EyeIcon className="w-4 h-4" />
                                View Lease
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {messages.map(msg => {
                        const isMe = msg.senderRole === currentUser.role || (currentUser.role === Role.ADMIN && msg.senderRole === Role.REVIEWER && msg.senderName === 'Team Penaki'); 
                        
                        const alignRight = currentUser.role === Role.USER 
                            ? msg.senderRole === Role.USER 
                            : (msg.senderRole === Role.ADMIN || msg.senderRole === Role.REVIEWER);

                        return (
                            <div key={msg.id} className={`flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] relative group`}>
                                    {!alignRight && !msg.isSystemMessage && (
                                        <p className="text-[10px] font-bold text-slate-400 mb-1 ml-1">{msg.senderName}</p>
                                    )}
                                    {alignRight && !msg.isSystemMessage && (
                                        <p className="text-[10px] font-bold text-slate-300 mb-1 mr-1 text-right">{msg.senderName} (You)</p>
                                    )}
                                    
                                    <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                        msg.isSystemMessage ? 'bg-amber-50 border border-amber-200 text-amber-800 text-center w-full italic' :
                                        alignRight ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className={`text-[10px] text-slate-400 mt-1 block ${alignRight ? 'text-right mr-1' : 'ml-1'}`}>
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-border">
                    <form onSubmit={handleSend} className="flex gap-3">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner"
                            placeholder="Type your reply..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-focus shadow-lg shadow-primary/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <ClockIcon className="w-10 h-10" />
                  </div>
                  <p>Select a conversation to start chatting.</p>
              </div>
          )}
      </div>
    </ScrollAnimatedSection>
  );
};
