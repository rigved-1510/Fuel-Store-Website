import 'dotenv/config';
import pool from './src/config/db.js';
import { products } from '../app/src/data/products.js';

async function seed() {
  console.log('Starting products database seeding...');

  try {
    // 1. Get existing categories and sizes
    const [dbCategories] = await pool.execute('SELECT id, name FROM categories');
    const [dbSizes] = await pool.execute('SELECT id, name FROM sizes');

    const categoryMap = {};
    dbCategories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    const sizeMap = {};
    dbSizes.forEach(size => {
      sizeMap[size.name.toUpperCase()] = size.id;
    });

    console.log('Categories in DB:', categoryMap);
    console.log('Sizes in DB:', sizeMap);

    // Ensure size "5" exists (for footballs)
    if (!sizeMap['5']) {
      const [insertSize] = await pool.execute('INSERT INTO sizes (name) VALUES (?)', ['5']);
      sizeMap['5'] = insertSize.insertId;
      console.log('Added size "5" to database.');
    }

    // 2. Clear existing products to prevent duplicates (since slug is unique)
    console.log('Clearing existing products, product_images, and product_sizes...');
    await pool.execute('DELETE FROM product_images');
    await pool.execute('DELETE FROM product_sizes');
    // Using simple DELETE because TRUNCATE fails due to foreign keys
    await pool.execute('DELETE FROM products');
    // Reset auto-increment
    await pool.execute('ALTER TABLE products AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE product_images AUTO_INCREMENT = 1');
    await pool.execute('ALTER TABLE product_sizes AUTO_INCREMENT = 1');

    // 3. Insert each product from frontend mock database
    for (const p of products) {
      // Map category
      let categoryName = 'jersey'; // Default
      if (p.category === 'accessories') {
        categoryName = 'accessories';
      } else if (p.category === 'clothing') {
        categoryName = 'clothing';
      }

      const categoryId = categoryMap[categoryName];
      if (!categoryId) {
        console.warn(`Category "${categoryName}" not found in database for product "${p.name}". Skipping.`);
        continue;
      }

      // Map league for Jersey category, set to null otherwise
      const league = categoryName === 'jersey' ? p.category : null;

      // Determine featured flag
      const featured = p.badge === 'limited' || p.badge === 'new' || p.id.includes('home-2425');

      // Description & Season
      const description = p.description || `${p.name} - official edition.`;
      const season = p.name.includes('24/25') ? '2024/25' : p.name.includes('23/24') ? '2023/24' : '2024';

      // Insert product
      const [prodResult] = await pool.execute(
        `INSERT INTO products (name, slug, club, league, season, category_id, description, price, discount_percent, featured, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.name,
          p.id, // Using frontend product ID as the slug
          p.club || 'Unknown Club',
          league,
          season,
          categoryId,
          description,
          p.price * 10, // Pricing matches Rs/multiplier representation
          p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0,
          featured ? 1 : 0,
          1 // active
        ]
      );

      const productId = prodResult.insertId;
      console.log(`Seeded product: ${p.name} (ID: ${productId}, Slug: ${p.id})`);

      // 4. Insert Images
      const allImages = p.images && p.images.length > 0 ? p.images : [p.image];
      for (let i = 0; i < allImages.length; i++) {
        await pool.execute(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [productId, allImages[i], i + 1]
        );
      }

      // 5. Insert Sizes with stock
      if (p.sizes && p.sizes.length > 0) {
        for (const sizeName of p.sizes) {
          const uSize = sizeName.toUpperCase();
          let sizeId = sizeMap[uSize];

          if (!sizeId) {
            // Dynamically add size if missing
            const [newSize] = await pool.execute('INSERT INTO sizes (name) VALUES (?)', [uSize]);
            sizeId = newSize.insertId;
            sizeMap[uSize] = sizeId;
            console.log(`Added missing size "${uSize}" to database.`);
          }

          // Random stock between 10 and 50 for realistic testing
          const stock = Math.floor(Math.random() * 41) + 10;

          await pool.execute(
            'INSERT INTO product_sizes (product_id, size_id, stock) VALUES (?, ?, ?)',
            [productId, sizeId, stock]
          );
        }
      }
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
