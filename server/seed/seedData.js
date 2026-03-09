require("dotenv").config({ path: "../.env" });
const { MongoClient } = require("mongodb");

const URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "nlmongo_db";

const users = [
  { name: "Aria Patel", email: "aria@example.com", age: 29, city: "Mumbai", createdAt: new Date("2023-03-12"), isActive: true },
  { name: "Liam Chen", email: "liam@example.com", age: 34, city: "Shanghai", createdAt: new Date("2022-11-05"), isActive: true },
  { name: "Sofia Russo", email: "sofia@example.com", age: 22, city: "Milan", createdAt: new Date("2024-01-20"), isActive: false },
  { name: "Noah Kim", email: "noah@example.com", age: 41, city: "Seoul", createdAt: new Date("2021-07-18"), isActive: true },
  { name: "Zara Ahmed", email: "zara@example.com", age: 27, city: "Dubai", createdAt: new Date("2023-09-01"), isActive: true },
  { name: "Ethan Brooks", email: "ethan@example.com", age: 31, city: "New York", createdAt: new Date("2022-05-14"), isActive: false },
  { name: "Mei Lin", email: "mei@example.com", age: 26, city: "Tokyo", createdAt: new Date("2023-07-22"), isActive: true },
  { name: "Carlos Vega", email: "carlos@example.com", age: 38, city: "Madrid", createdAt: new Date("2021-12-01"), isActive: true },
];

const products = [
  { name: "MacBook Pro 14\"", price: 2499, category: "electronics", stock: 45, rating: 4.8, brand: "Apple" },
  { name: "Nike Air Max 2024", price: 120, category: "apparel", stock: 200, rating: 4.5, brand: "Nike" },
  { name: "Sony WH-1000XM5", price: 350, category: "electronics", stock: 78, rating: 4.7, brand: "Sony" },
  { name: "Breville Barista Express", price: 699, category: "appliances", stock: 32, rating: 4.6, brand: "Breville" },
  { name: "Garmin Forerunner 965", price: 599, category: "electronics", stock: 15, rating: 4.6, brand: "Garmin" },
  { name: "Levi's 501 Jeans", price: 89, category: "apparel", stock: 350, rating: 4.3, brand: "Levi's" },
  { name: "Dyson V15 Vacuum", price: 749, category: "appliances", stock: 22, rating: 4.7, brand: "Dyson" },
  { name: "iPad Air M2", price: 1099, category: "electronics", stock: 60, rating: 4.8, brand: "Apple" },
  { name: "Adidas Ultraboost", price: 180, category: "apparel", stock: 120, rating: 4.4, brand: "Adidas" },
  { name: "Nespresso Vertuo", price: 199, category: "appliances", stock: 85, rating: 4.5, brand: "Nespresso" },
];

const buildOrders = (userIds, productList) => [
  { userId: userIds[0], product: "MacBook Pro 14\"", amount: 2499, status: "delivered", category: "electronics", orderDate: new Date("2024-02-10") },
  { userId: userIds[1], product: "Nike Air Max 2024", amount: 120, status: "shipped", category: "apparel", orderDate: new Date("2024-03-01") },
  { userId: userIds[0], product: "Sony WH-1000XM5", amount: 350, status: "delivered", category: "electronics", orderDate: new Date("2024-01-15") },
  { userId: userIds[2], product: "Breville Barista Express", amount: 699, status: "pending", category: "appliances", orderDate: new Date("2024-03-05") },
  { userId: userIds[3], product: "Garmin Forerunner 965", amount: 599, status: "delivered", category: "electronics", orderDate: new Date("2023-12-20") },
  { userId: userIds[4], product: "Levi's 501 Jeans", amount: 89, status: "shipped", category: "apparel", orderDate: new Date("2024-02-28") },
  { userId: userIds[5], product: "Dyson V15 Vacuum", amount: 749, status: "delivered", category: "appliances", orderDate: new Date("2024-01-30") },
  { userId: userIds[6], product: "iPad Air M2", amount: 1099, status: "pending", category: "electronics", orderDate: new Date("2024-03-10") },
  { userId: userIds[7], product: "Adidas Ultraboost", amount: 180, status: "cancelled", category: "apparel", orderDate: new Date("2024-02-05") },
  { userId: userIds[1], product: "Nespresso Vertuo", amount: 199, status: "delivered", category: "appliances", orderDate: new Date("2024-01-08") },
  { userId: userIds[3], product: "Sony WH-1000XM5", amount: 350, status: "shipped", category: "electronics", orderDate: new Date("2024-03-12") },
  { userId: userIds[0], product: "Dyson V15 Vacuum", amount: 749, status: "delivered", category: "appliances", orderDate: new Date("2023-11-25") },
];

async function seed() {
  const client = new MongoClient(URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log(`\n🌱 Seeding database: ${DB_NAME}\n`);

    // Drop existing collections
    for (const col of ["users", "products", "orders"]) {
      await db.collection(col).drop().catch(() => {});
    }

    // Insert users
    const insertedUsers = await db.collection("users").insertMany(users);
    const userIds = Object.values(insertedUsers.insertedIds);
    console.log(`✅ Inserted ${userIds.length} users`);

    // Insert products
    const insertedProducts = await db.collection("products").insertMany(products);
    console.log(`✅ Inserted ${Object.keys(insertedProducts.insertedIds).length} products`);

    // Insert orders
    const orders = buildOrders(userIds, products);
    const insertedOrders = await db.collection("orders").insertMany(orders);
    console.log(`✅ Inserted ${Object.keys(insertedOrders.insertedIds).length} orders`);

    console.log("\n🎉 Database seeded successfully!\n");
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await client.close();
  }
}

seed();
