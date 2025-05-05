import mongoose from 'mongoose';
import Category from 'src/models/category.model.ts';
import Product from 'src/models/product.model.ts';
import { seedCategories, seedProducts } from './seedData.ts';

const seedDatabase = async () => {
  try {
    console.log('Upserting Categories...');
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    for (const cat of seedCategories) {
      const existing = await Category.findOne({ name: cat.name });
      let categoryDoc;
      if (!existing) {
        categoryDoc = await Category.create({ name: cat.name });
        console.log(`Inserted new category: ${cat.name}`);
      } else {
        categoryDoc = existing;
      }
      categoryMap.set(cat.name, categoryDoc._id);
    }

    console.log('Upserting/Updating Products...');
    for (const prod of seedProducts) {
      const categoryId = categoryMap.get(prod.categoryName);
      if (!categoryId) {
        console.warn(`Warning: Category name "${prod.categoryName}" for product "${prod.name}" not found. Skipping product.`);
        continue;
      }
     
      let existing = await Product.findOne({ name: prod.name, category: categoryId });
      
      if (!existing) {
        existing = await Product.findOne({ description: prod.description, category: categoryId });
      }
      if (!existing) {
        await Product.create({
          name: prod.name,
          description: prod.description,
          price: prod.price,
          imageUrl: prod.imageUrl,
          isActive: prod.isActive !== undefined ? prod.isActive : true,
          category: categoryId,
        });
        console.log(`Inserted new product: ${prod.name}`);
      } else {
        
        existing.name = prod.name;
        existing.description = prod.description;
        existing.price = prod.price;
        existing.imageUrl = prod.imageUrl;
        existing.isActive = prod.isActive !== undefined ? prod.isActive : true;
        existing.category = categoryId;
        await existing.save();
        console.log(`Updated product: ${prod.name}`);
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
};

export default seedDatabase;