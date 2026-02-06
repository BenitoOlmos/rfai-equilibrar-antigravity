import axios from 'axios';
import { UsuarioConectado, Inscripcion, Perfil } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token si existiera en futuro
apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores 401 (Sesión Expirada)
apiInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.warn('Sesión expirada o no autorizada. Redirigiendo a login...');
            localStorage.removeItem('user_session'); // Clear session
            // Forzar recarga o redirección, dependiendo del routing.
            // En este contexto simple, podríamos usar window.location
            if (!window.location.pathname.includes('/login')) { // Avoid loops
                // window.location.href = '/'; // Simple redirect to home/login
                // O mejor, disparar un evento que App.tsx escuche, pero window.location es robusto para "Veto Estético" (no tocamos componentes)
                window.location.reload();
            }
        }
        return Promise.reject(error);
    }
);


export const api = {
    auth: {
        login: async (email: string, password?: string): Promise<UsuarioConectado> => {
            const { data } = await apiInstance.post<UsuarioConectado>('/auth/login', { email, password: password || '123' });
            return data;
        },
        logout: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user_session');
        }
    },
    users: {
        getAll: async (): Promise<UsuarioConectado[]> => {
            const { data } = await apiInstance.get<UsuarioConectado[]>('/users');
            return data;
        },
        getById: async (id: string): Promise<UsuarioConectado> => {
            const { data } = await apiInstance.get<UsuarioConectado>(`/users/${id}`);
            return data;
        },
        create: async (payload: any): Promise<UsuarioConectado> => {
            const { data } = await apiInstance.post<UsuarioConectado>('/users', payload);
            return data;
        }
    },
    profiles: {
        update: async (userId: string, payload: Partial<Perfil>): Promise<Perfil> => {
            const { data } = await apiInstance.put<Perfil>(`/profiles/${userId}`, payload);
            return data;
        }
    },
    inscriptions: {
        create: async (payload: any): Promise<Inscripcion> => {
            const { data } = await apiInstance.post<Inscripcion>('/inscriptions', payload);
            return data;
        }
    },
    progress: {
        update: async (clientId: string, weekNumber: number, payload: any): Promise<any> => {
            const { data } = await apiInstance.put(`/progress/${clientId}/week/${weekNumber}`, payload);
            return data;
        }
    }
};
