interface SeedCategory {
    name: string;
}
  
interface SeedProduct {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    categoryName: string;
    isActive?: boolean;
}

const products = await import('../data/products.json').then(m => m.default);
  
export const seedCategories: SeedCategory[] = [
    { name: 'Sisig' },
    { name: 'Sizzlings' },
    { name: 'Silog' },
    { name: 'Drinks' },
    { name: 'Extras' },
];
  
export const seedProducts: SeedProduct[] = products;