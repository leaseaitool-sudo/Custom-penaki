import { SupportChat, ChatMessage, Role } from '@/shared/types';

let mockChats: SupportChat[] = [];
let mockMessages: ChatMessage[] = [];

export const loadSupportChats = async (): Promise<SupportChat[]> => mockChats;

export const createSupportChat = async (clientId: string, clientEmail: string, clientName: string): Promise<boolean> => {
    const newId = `support_${clientEmail}`;
    if (!mockChats.find(c => c.id === newId)) {
        mockChats.push({
            id: newId,
            clientEmail,
            clientName,
            allowedReviewers: [],
            lastUpdated: new Date(),
            messages: []
        });
        await sendChatMessage(newId, 'support', Role.ADMIN, 'Team Penaki', 'Welcome to Penaki Support. How can we help you today?', true);
    }
    return true;
};

export const assignReviewerToSupportChat = async (chatId: string, reviewerEmail: string): Promise<boolean> => {
    const chat = mockChats.find(c => c.id === chatId);
    if (chat && !chat.allowedReviewers?.includes(reviewerEmail)) {
        chat.allowedReviewers = chat.allowedReviewers || [];
        chat.allowedReviewers.push(reviewerEmail);
    }
    return true;
};

export const fetchLeaseChatHistory = async (leaseId: string): Promise<ChatMessage[]> => {
    return mockMessages.filter(m => m.referenceId === leaseId && m.type === 'lease');
};

export const sendChatMessage = async (
    referenceId: string,
    type: 'lease' | 'support',
    senderRole: Role,
    senderName: string,
    content: string,
    isSystemMessage = false
): Promise<ChatMessage | null> => {
    const msg: ChatMessage = {
        id: `msg_${Date.now()}`,
        referenceId,
        type,
        senderRole,
        senderName,
        content,
        isSystemMessage,
        timestamp: new Date()
    };
    mockMessages.push(msg);
    if (type === 'support') {
        const chat = mockChats.find(c => c.id === referenceId);
        if (chat) {
            chat.messages = chat.messages || [];
            chat.messages.push(msg);
            chat.lastUpdated = new Date();
        }
    }
    return msg;
};
