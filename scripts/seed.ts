import { execSync } from "child_process";

console.log("Seeding database from Inflow API...");

try {
  execSync("npx inflow-get", { stdio: "inherit" });
  console.log("Database seeded successfully!");
} catch (error) {
  console.error("Failed to seed database:", error);
  process.exit(1);
}
