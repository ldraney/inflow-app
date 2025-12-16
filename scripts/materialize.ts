import { execSync } from "child_process";

console.log("Creating materialized views...");

try {
  execSync("npx inflow-materialize", { stdio: "inherit" });
  console.log("Views created successfully!");
} catch (error) {
  console.error("Failed to create views:", error);
  process.exit(1);
}
