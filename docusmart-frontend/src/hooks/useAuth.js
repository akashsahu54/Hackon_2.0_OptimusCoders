/** Auth hook — login, register, logout, token management */
import { create } from 'zustand';
import client from '../api/client';

export const useAuth = create((set) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('access_token') || null,

    login: async (email, password) => {
        const { data } = await client.post('/auth/login', { email, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ token: data.access_token, user: data.user });
        return data;
    },

    register: async (email, password, fullName) => {
        const { data } = await client.post('/auth/register', {
            email, password, full_name: fullName,
        });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        set({ token: data.access_token, user: data.user });
        return data;
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        set({ token: null, user: null });
    },
}));
