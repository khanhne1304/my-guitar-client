// src/services/chatService.js
import { apiClient } from './apiClient';

export const chatService = {
	async ask({ message, budgetMin, budgetMax }) {
		if (!message) throw new Error('message is required');
		return apiClient.post('/chat', {
			message,
			budgetMin,
			budgetMax,
		});
	},
	async reindex() {
		// admin-protected endpoint
		return apiClient.post('/chat/reindex', {});
	},
};


