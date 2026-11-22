import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getUserState,
  login,
  register,
  toggleCollection as apiToggleCollection,
  topUpPoints,
  unlockComic,
  type UserState,
} from '../api/comicsApi';

export interface Transaction {
  id: string;
  type: 'topup' | 'purchase';
  title: string;
  amount: number;
  date: string;
}

interface UserStore extends Omit<UserState, 'id' | 'email'> {
  userId: number | null;
  email: string | null;
  loginUser: (email: string, password: string) => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addPoints: (amount: number, description?: string) => Promise<void>;
  deductPoints: (amount: number) => boolean;
  isInCollection: (comicId: number) => boolean;
  toggleCollection: (comicId: number) => Promise<boolean>;
  isUnlocked: (comicId: number) => boolean;
  unlockBook: (comicId: number, cost: number, bookTitle?: string) => Promise<boolean>;
}

const applyUserState = (state: UserState) => ({
  userId: state.id,
  email: state.email,
  points: state.points,
  collection: state.collection,
  unlockedBooks: state.unlockedBooks,
  transactions: state.transactions,
});

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      userId: null,
      email: null,
      points: 0,
      collection: [],
      unlockedBooks: [],
      transactions: [],

      loginUser: async (email, password) => {
        const state = await login(email, password);
        set(applyUserState(state));
      },

      registerUser: async (email, password) => {
        const state = await register(email, password);
        set(applyUserState(state));
      },

      logout: () => set({
        userId: null,
        email: null,
        points: 0,
        collection: [],
        unlockedBooks: [],
        transactions: [],
      }),

      refreshUser: async () => {
        const userId = get().userId;
        if (!userId) return;
        set(applyUserState(await getUserState(userId)));
      },

      addPoints: async (amount, description = 'เติมแต้มสะสม') => {
        const userId = get().userId;
        if (!userId) throw new Error('กรุณาเข้าสู่ระบบก่อน');
        set(applyUserState(await topUpPoints(userId, amount, description)));
      },

      deductPoints: (amount) => get().points >= amount,

      isInCollection: (comicId) => get().collection.includes(comicId),

      toggleCollection: async (comicId) => {
        const userId = get().userId;
        if (!userId) throw new Error('กรุณาเข้าสู่ระบบก่อน');
        const saved = get().collection.includes(comicId);
        set(applyUserState(await apiToggleCollection(userId, comicId, saved)));
        return !saved;
      },

      isUnlocked: (comicId) => get().unlockedBooks.includes(comicId),

      unlockBook: async (comicId, _cost, _bookTitle) => {
        const userId = get().userId;
        if (!userId) throw new Error('กรุณาเข้าสู่ระบบก่อน');
        if (get().unlockedBooks.includes(comicId)) return true;

        try {
          set(applyUserState(await unlockComic(userId, comicId)));
          return true;
        } catch (error) {
          throw error;
        }
      },
    }),
    { name: 'manga-user-storage' },
  ),
);
