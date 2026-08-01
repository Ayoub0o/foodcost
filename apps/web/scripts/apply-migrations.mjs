import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, readdirSync } from "node:fs";
import pg from "pg";

const dir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(dir, "../.env.local") });

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error("SUPABASE_DB_PASSWORD missing");
  process.exit(1);
}

// Direct host is IPv6-only; use the Session pooler (IPv4) for this project.
const ref = "ibosgfcbbcqhhhtqasix";
const host = process.env.SUPABASE_DB_POOLER_HOST ?? "aws-1-us-west-2.pooler.supabase.com";
const connectionString = `postgresql://postgres.${ref}:${encodeURIComponent(password)}@${host}:5432/postgres`;

const migrationsDir = path.resolve(dir, "../../../supabase/migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected. Applying", files.length, "migrations…");

for (const file of files) {
  const sql = readFileSync(path.join(migrationsDir, file), "utf8");
  process.stdout.write(`→ ${file} … `);
  try {
    await client.query(sql);
    console.log("OK");
  } catch (err) {
    console.log("FAIL");
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

const { rows } = await client.query(
  `select tablename from pg_tables where schemaname = 'public' order by tablename`,
);
console.log("Tables:", rows.map((r) => r.tablename).join(", "));
await client.end();
console.log("Done.");
