const foodNutrition = {
  apple: {
    caloriesKcal: 52,
    proteinG: 0.3,
    carbsG: 14,
    fatG: 0.2,
    waterG: 86,
    sugarG: 10,
    vitamins: [{ name: "Vitamin C", amount: 4.6, unit: "mg" }],
    minerals: [{ name: "Potassium", amount: 107, unit: "mg" }]
  },

  banana: {
    caloriesKcal: 89,
    proteinG: 1.1,
    carbsG: 23,
    fatG: 0.3,
    waterG: 74,
    sugarG: 12,
    vitamins: [{ name: "Vitamin B6", amount: 0.4, unit: "mg" }],
    minerals: [{ name: "Potassium", amount: 358, unit: "mg" }]
  },

  orange: {
    caloriesKcal: 47,
    proteinG: 0.9,
    carbsG: 12,
    fatG: 0.1,
    waterG: 87,
    sugarG: 9,
    vitamins: [{ name: "Vitamin C", amount: 53, unit: "mg" }]
  },

  grapes: {
    caloriesKcal: 69,
    proteinG: 0.7,
    carbsG: 18,
    fatG: 0.2,
    waterG: 81,
    sugarG: 15
  },

  watermelon: {
    caloriesKcal: 30,
    proteinG: 0.6,
    carbsG: 8,
    fatG: 0.2,
    waterG: 92,
    sugarG: 6
  },

  mango: {
    caloriesKcal: 60,
    proteinG: 0.8,
    carbsG: 15,
    fatG: 0.4,
    waterG: 83,
    sugarG: 13
  },

  cucumber: {
    caloriesKcal: 15,
    proteinG: 0.7,
    carbsG: 3.6,
    fatG: 0.1,
    waterG: 95,
    vitamins: [{ name: "Vitamin K", amount: 16, unit: "mcg" }]
  },

  tomato: {
    caloriesKcal: 18,
    proteinG: 0.9,
    carbsG: 3.9,
    fatG: 0.2,
    waterG: 94,
    vitamins: [{ name: "Vitamin C", amount: 13, unit: "mg" }]
  },

  onion: {
    caloriesKcal: 40,
    proteinG: 1.1,
    carbsG: 9,
    fatG: 0.1,
    waterG: 89
  },

  potato: {
    caloriesKcal: 77,
    proteinG: 2,
    carbsG: 17,
    fatG: 0.1,
    waterG: 79,
    vitamins: [{ name: "Vitamin C", amount: 19, unit: "mg" }]
  },

  rice: {
    bhat: {
      caloriesKcal: 130,
      proteinG: 2.4,
      carbsG: 28,
      fatG: 0.3,
      waterG: 68
    },
    fried_rice: {
      caloriesKcal: 180,
      proteinG: 4,
      carbsG: 30,
      fatG: 6,
      waterG: 60
    }
  },

  daal: {
    caloriesKcal: 116,
    proteinG: 9,
    carbsG: 20,
    fatG: 0.4,
    waterG: 70,
    minerals: [{ name: "Iron", amount: 3.3, unit: "mg" }]
  },

  dahi: {
    caloriesKcal: 61,
    proteinG: 3.5,
    carbsG: 4.7,
    fatG: 3.3,
    waterG: 85,
    vitamins: [{ name: "Calcium", amount: 110, unit: "mg" }]
  },

  milk: {
    chiya: {
      caloriesKcal: 40,
      proteinG: 1.5,
      carbsG: 5,
      fatG: 1.5,
      waterG: 88
    }
  },

  momo: {
    caloriesKcal: 250,
    proteinG: 10,
    carbsG: 30,
    fatG: 10,
    waterG: 40
  },

  burger: {
    caloriesKcal: 295,
    proteinG: 12,
    carbsG: 33,
    fatG: 12,
    waterG: 35
  },

  samosa: {
    caloriesKcal: 262,
    proteinG: 6,
    carbsG: 24,
    fatG: 15,
    waterG: 35
  },

  roti: {
    caloriesKcal: 120,
    proteinG: 3.5,
    carbsG: 22,
    fatG: 2,
    waterG: 35
  },

  sel_roti: {
    caloriesKcal: 180,
    proteinG: 3,
    carbsG: 30,
    fatG: 6,
    waterG: 25
  },

  dhido: {
    caloriesKcal: 110,
    proteinG: 2,
    carbsG: 24,
    fatG: 1,
    waterG: 40
  },

  masu: {
    caloriesKcal: 250,
    proteinG: 26,
    carbsG: 0,
    fatG: 17,
    waterG: 55
  },

  salad: {
    caloriesKcal: 60,
    proteinG: 2,
    carbsG: 10,
    fatG: 2,
    waterG: 85
  },

  soup: {
    thukpa: {
      caloriesKcal: 180,
      proteinG: 8,
      carbsG: 25,
      fatG: 6,
      waterG: 70
    }
  },

  chatpate: {
    caloriesKcal: 220,
    proteinG: 4,
    carbsG: 35,
    fatG: 8,
    waterG: 50
  },

  // fallback examples for others
  default: {
    caloriesKcal: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    waterG: 0
  }
};

module.exports = foodNutrition;