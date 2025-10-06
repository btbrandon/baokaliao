import { createContext, useContext } from 'react';
import { userStore } from './user/store';
import { expensesStore } from './expense/store';
import { categoriesStore } from './category/store';
import { budgetStore } from './budget/store';
import { foodReviewStore } from './food-review/store';

export const stores = {
  userStore,
  expensesStore,
  categoriesStore,
  budgetStore,
  foodReviewStore,
};

export const StoreContext = createContext(stores);

export const useStores = () => {
  return useContext(StoreContext);
};
