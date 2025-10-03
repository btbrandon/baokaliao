import { createContext, useContext } from 'react';
import { userStore } from './user/store';
import { expensesStore } from './expense/store';
import { categoriesStore } from './category/store';

export const stores = {
  userStore,
  expensesStore,
  categoriesStore,
};

export const StoreContext = createContext(stores);

export const useStores = () => {
  return useContext(StoreContext);
};
