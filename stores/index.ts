import { createContext, useContext } from 'react';
import { userStore } from './user/store';
import { expensesStore } from './expense/store';
import { categoriesStore } from './category/store';
import { budgetStore } from './budget/store';

export const stores = {
  userStore,
  expensesStore,
  categoriesStore,
  budgetStore,
};

export const StoreContext = createContext(stores);

export const useStores = () => {
  return useContext(StoreContext);
};
