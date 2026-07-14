const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://postgres.qcqwxcdmzyucxyupnjie:RSjzeeTZEMUEXgfU@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
  ssl: {
    rejectUnauthorized: false, // For testing only
  },
});

async function test() {
  try {
    await client.connect();
    console.log("✅ Connected to Supabase!");
    const result = await client.query("SELECT 1 as test");
    console.log("✅ Query successful:", result.rows);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await client.end();
  }
}

test();
