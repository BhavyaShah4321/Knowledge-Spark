// services/chatService.js
import axios from 'axios';
import dayjs from 'dayjs';

class ChatService {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.wsBaseURL = 'ws://localhost:8000/ws';
    }

    getAuthHeader() {
        const userData = JSON.parse(localStorage.getItem("auth_token"));
        if (userData?.access_token) {
            return {
                Authorization: `Bearer ${userData.access_token}`
            };
        }
        return {};
    }

    getUserData() {
        const userData = JSON.parse(localStorage.getItem("auth_token") || "{}");
        return {
            userId: userData.user?.id,
            accessToken: userData.access_token
        };
    }

    async getChatsForUser() {
        const { userId } = this.getUserData();
        try {
            const response = await axios.post(
                `${this.baseURL}/chat/chatid-according-user/`,
                { user_id: userId },
                { headers: this.getAuthHeader() }
            );
            return response.data.results;
        } catch (error) {
            throw new Error('Failed to fetch chats');
        }
    }

    async getChatMessages(uuid) {
        try {
            const response = await axios.get(
                `${this.baseURL}/chat-message/chat-message-according-chat/?uuid=${uuid}`,
                { headers: this.getAuthHeader() }
            );
            return response.data?.data || [];
        } catch (error) {
            throw new Error('Failed to fetch messages');
        }
    }

    async deleteChat(chatId) {
        try {
            await axios.delete(
                `${this.baseURL}/chat-message/${chatId}/`,
                { headers: this.getAuthHeader() }
            );
        } catch (error) {
            throw new Error('Failed to delete chat');
        }
    }

    async sendMessage(chatId, message) {
        const { userId } = this.getUserData();
        try {
            await axios.post(
                `${this.baseURL}/chat-message/`,
                {
                    chatid: chatId,
                    sender: userId,
                    message: message,
                },
                { headers: this.getAuthHeader() }
            );
        } catch (error) {
            throw new Error('Failed to send message');
        }
    }

    async createOrGetChat(otherUserId) {
        const { userId } = this.getUserData();
        try {
            // Check for existing chat
            const existingChatResponse = await axios.post(
                `${this.baseURL}/chat/chatid-according-user/`,
                { user_id: otherUserId },
                { headers: this.getAuthHeader() }
            );

            if (existingChatResponse.data.data?.length > 0) {
                return existingChatResponse.data.data[0];
            }

            // Create new chat if none exists
            const createChatResponse = await axios.post(
                `${this.baseURL}/chat/`,
                {
                    user_1: userId,
                    user_2: otherUserId
                },
                { headers: this.getAuthHeader() }
            );

            return createChatResponse.data.data;
        } catch (error) {
            throw new Error('Failed to create or get chat');
        }
    }

    async initiateVideoCall(selectedChatUuid) {
        const { userId } = this.getUserData();
        try {
            const chats = await this.getChatsForUser();
            const selectedChat = chats.find(chat => chat.uuid === selectedChatUuid);

            if (!selectedChat) {
                throw new Error("Chat not found");
            }

            const oppositeUserId = selectedChat.user_1 === userId ? selectedChat.user_2 : selectedChat.user_1;

            const response = await axios.post(
                `${this.baseURL}/video-call/`,
                {
                    teacher: userId,
                    student: oppositeUserId,
                    start: dayjs().format('DD/MM/YYYY HH:mm'),
                },
                { headers: this.getAuthHeader() }
            );

            return response.data;
        } catch (error) {
            throw new Error('Failed to initiate video call');
        }
    }

    createWebSocketConnection(uuid) {
        return new WebSocket(`${this.wsBaseURL}/chat/${uuid}/`);
    }
}

export const chatService = new ChatService();