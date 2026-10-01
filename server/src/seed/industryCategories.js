import IndustryCategory from '../models/IndustryCategory.js';

export const seedIndustryCategories = async () => {
  try {
    const count = await IndustryCategory.countDocuments();
    if (count === 0) {
      await IndustryCategory.insertMany([
        { name: 'Software Engineering', displayOrder: 1, description: 'Software and web development careers' },
        { name: 'Data & Analytics', displayOrder: 2, description: 'Data analysis and analytics careers' },
        { name: 'Artificial Intelligence', displayOrder: 3, description: 'AI/ML related careers' },
        { name: 'Infrastructure', displayOrder: 4, description: 'Cloud and IT infrastructure careers' },
        { name: 'Design & Product', displayOrder: 5, description: 'UX/UI design and product management careers' },
      ]);
      console.log('✅ Industry Categories seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding Industry Categories:', error);
  }
};
