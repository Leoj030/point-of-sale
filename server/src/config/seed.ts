// src/seed/seed.ts (or scripts/seed.ts)

import mongoose from 'mongoose';
import Category from 'src/models/categoryModel.ts'; // Adjust path as needed
import Product from 'src/models/productModel.ts';   // Adjust path as needed
import { seedCategories, seedProducts } from './seedData.ts'; // Adjust path as needed
// If not using a separate file, define seedCategories/seedProducts arrays here

const seedDatabase = async () => {
  try {
    // --- Upsert Categories ---
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
        // Optionally update fields here if you want to sync changes
        // await Category.updateOne({ _id: existing._id }, { $set: { ...cat } });
      }
      categoryMap.set(cat.name, categoryDoc._id);
    }

    // --- Upsert or Update Products (with rename support) ---
    console.log('Upserting/Updating Products...');
    for (const prod of seedProducts) {
      const categoryId = categoryMap.get(prod.categoryName);
      if (!categoryId) {
        console.warn(`Warning: Category name "${prod.categoryName}" for product "${prod.name}" not found. Skipping product.`);
        continue;
      }
      // Try to find by name+category
      let existing = await Product.findOne({ name: prod.name, category: categoryId });
      // If not found, try to find by description+category (for renames)
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
        // Update all fields to match the seed (including name)
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