import SkillCategory from '../models/SkillCategory.js';
import Skill from '../models/Skill.js';

export const seedSkillCategories = async () => {
  try {
    const existingCount = await SkillCategory.countDocuments();
    if (existingCount === 0) {
      const initialCategories = [
        { name: 'Programming', description: 'Programming languages and paradigms', displayOrder: 1 },
        { name: 'Frontend', description: 'Web and mobile client-side technologies', displayOrder: 2 },
        { name: 'Backend', description: 'Server-side logic, APIs, and frameworks', displayOrder: 3 },
        { name: 'Database', description: 'SQL, NoSQL, and data storage systems', displayOrder: 4 },
        { name: 'DevOps', description: 'CI/CD, cloud, and infrastructure', displayOrder: 5 },
        { name: 'Data Analysis', description: 'Data science, BI, and machine learning', displayOrder: 6 },
        { name: 'Security', description: 'Cybersecurity, network defense, and compliance', displayOrder: 7 },
      ];

      await SkillCategory.insertMany(initialCategories);
      console.log('Skill Categories seeded successfully');
    }

    // Data Migration: Link existing skills to the newly seeded categories
    const categories = await SkillCategory.find();
    for (const cat of categories) {
      await Skill.updateMany(
        { category: cat.name, categoryId: { $exists: false } },
        { $set: { categoryId: cat._id } }
      );
    }
    console.log('Skill Categories migration completed successfully');
  } catch (error) {
    console.error('Failed to seed skill categories:', error);
  }
};
