// src/services/authService.js
import { apiClient } from './apiClient';

export async function register({ name, email, password }) {
  return apiClient.post('/auth/register', { name, email, password });
}

export async function login({ email, password }) {
  return apiClient.post('/auth/login', { email, password });
}
