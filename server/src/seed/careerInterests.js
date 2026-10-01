import CareerInterest from '../models/CareerInterest.js';

export const seedCareerInterests = async () => {
  try {
    const count = await CareerInterest.countDocuments();
    if (count === 0) {
      await CareerInterest.insertMany([
        { name: 'Software Development & Web Technologies', order: 1 },
        { name: 'Data Science, AI & Machine Learning', order: 2 },
        { name: 'Cloud Computing, DevOps & Infrastructure', order: 3 },
        { name: 'Government & Public Sector Tech Exams (MP Online / SSC)', order: 4 },
        { name: 'Cybersecurity & Network Defense', order: 5 },
      ]);
      console.log('✅ Career Interests seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding Career Interests:', error);
  }
};
