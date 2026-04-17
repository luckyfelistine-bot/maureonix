const fetch = require('node-fetch');

class FoodHub {
  async recipe(query) {
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      const d = await r.json();
      const m = d.meals?.[0];
      if (!m) return null;
      const ing = [];
      for (let i=1;i<=20;i++) if (m[`strIngredient${i}`]) ing.push(`• ${m[`strIngredient${i}`]} - ${m[`strMeasure${i}`]}`);
      return { name: m.strMeal, category: m.strCategory, area: m.strArea, instructions: m.strInstructions, ingredients: ing, thumb: m.strMealThumb };
    } catch { return null; }
  }

  async cocktail(name) {
    try {
      const r = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
      const d = await r.json();
      const c = d.drinks?.[0];
      if (!c) return null;
      const ing = [];
      for (let i=1;i<=15;i++) if (c[`strIngredient${i}`]) ing.push(c[`strIngredient${i}`]);
      return { name: c.strDrink, glass: c.strGlass, instructions: c.strInstructions, ingredients: ing, thumb: c.strDrinkThumb };
    } catch { return null; }
  }

  substitute(ingredient) {
    const sub = {
      'butter': 'Applesauce, mashed banana, or coconut oil',
      'egg': 'Flax egg (1 tbsp flax + 3 tbsp water) or applesauce',
      'milk': 'Almond milk, oat milk, or soy milk',
      'sugar': 'Honey, maple syrup, or stevia',
      'flour': 'Almond flour, oat flour, or coconut flour',
      'oil': 'Greek yogurt, applesauce, or mashed avocado'
    };
    return sub[ingredient.toLowerCase()] || 'Try searching online for specific substitution ratios';
  }

  mealPrep(type = 'balanced') {
    const plans = {
      balanced: ['Grilled chicken + quinoa + broccoli','Salmon + sweet potato + asparagus','Turkey meatballs + pasta + salad'],
      keto: ['Steak + buttered spinach + avocado','Salmon + cauliflower rice','Bacon & eggs + avocado'],
      vegan: ['Chickpea curry + rice','Tofu stir-fry + noodles','Lentil soup + crusty bread'],
      bulking: ['Chicken breast + rice + beans + veggies','Beef mince + pasta + cheese','Protein shake + oats + peanut butter']
    };
    return plans[type] || plans.balanced;
  }
}

module.exports = new FoodHub();