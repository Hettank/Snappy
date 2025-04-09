import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { persist } from 'zustand/middleware';
import { io } from 'socket.io-client';

const BASE_URL =
  import.meta.env.MODE === 'development' ? 'http://localhost:4000' : '/';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isCheckingAuth: true,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      socket: null,

      onlineUsers: [],

      checkAuth: async () => {
        set({ isCheckingAuth: true });
        try {
          const res = await axiosInstance.get('auth/check-auth');
          if (res.data) {
            set({ authUser: res.data });
          } else {
            set({ authUser: null });
          }
        } catch (error) {
          set({ authUser: null });
          console.log('Auth check error:', error);
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      signup: async data => {
        set({ isSigningUp: true });
        try {
          const res = await axiosInstance.post(`auth/signup`, data);
          set({ authUser: res.data.data });
          toast.success('Account Created Successfully');
          get().connecteSocket();
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Signup failed. Please try again.';
          toast.error(errorMessage);
          console.log('Signup error:', error);
          return false;
        } finally {
          set({ isSigningUp: false });
        }
      },

      login: async data => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post(`auth/login`, data);
          set({ authUser: res.data.data });
          toast.success('Login Successful');
          get().connecteSocket();
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message ||
            'Login failed. Please check your credentials.';
          toast.error(errorMessage);
          console.log('Login error:', error);
          return false;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      logout: async () => {
        try {
          await axiosInstance.post(`auth/logout`);
          set({ authUser: null });
          toast.success('Logged Out Successfully');
          get().disconnectSocket();
          return true;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || 'Logout failed.';
          toast.error(errorMessage);
          console.log('Logout error:', error);
          return false;
        }
      },

      updateProfile: async data => {
        set({ isUpdatingProfile: true });
        try {
          const response = await axiosInstance.put(`auth/update-profile`, data);
          set({ authUser: response.data });
          toast.success('Profile updated successfully');
        } catch (error) {
          console.log('Error in updating profile', error);
          toast.error(error.response.data.message);
        } finally {
          set({ isUpdatingProfile: false });
        }
      },

      connecteSocket: () => {
        const { authUser } = get();

        if (!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
        set({ socket: socket });

        socket.on('getOnlineUsers', userIds => {
          set({ onlineUsers: userIds });
        });
      },

      disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
      },
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
      partialize: state => ({
        authUser: state.authUser,
      }),
    }
  )
);
