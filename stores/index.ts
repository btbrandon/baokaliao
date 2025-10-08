import { createContext, useContext } from 'react';
import { userStore } from './user/store';
import { expensesStore } from './expense/store';
import { categoriesStore } from './category/store';
import { budgetStore } from './budget/store';
import { foodReviewStore } from './food-review/store';
import { foodToTryStore } from './food-to-try/store';

export const stores = {
  userStore,
  expensesStore,
  categoriesStore,
  budgetStore,
  foodReviewStore,
  foodToTryStore,
};

export const StoreContext = createContext(stores);

export const useStores = () => {
  return useContext(StoreContext);
};
