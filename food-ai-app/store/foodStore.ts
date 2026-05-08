import { create } from "zustand";

type Food = {
  _id: string;
  recognition: {
    name: string;
    confidence: number;
    annotatedImage?: string;
  };
  nutrition: {
    caloriesKcal: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
  createdAt: string;
};

type FoodState = {
  foods: Food[];

  setFoods: (foods: Food[]) => void;

  addFood: (food: Food) => void;

  clearFoods: () => void;
};

export const useFoodStore = create<FoodState>((set) => ({
  foods: [],

  setFoods: (foods) => set({ foods }),

  addFood: (food) =>
    set((state) => ({
      foods: [food, ...state.foods],
    })),

  clearFoods: () => set({ foods: [] }),
}));