import { makeAutoObservable } from 'mobx';
import { User } from '@supabase/supabase-js';

export class UserStore {
  user: User | null = null;
  loading: boolean = true;

  constructor() {
    makeAutoObservable(this);
  }

  setUser(user: User | null) {
    this.user = user;
    this.loading = false;
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  get isAuthenticated() {
    return !!this.user;
  }

  get userEmail() {
    return this.user?.email || '';
  }

  clearUser() {
    this.user = null;
  }
}

export const userStore = new UserStore();
