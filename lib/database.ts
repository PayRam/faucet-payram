import "reflect-metadata";
import { DataSource } from "typeorm";
import { FaucetClaim } from "./entities/FaucetClaim";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "faucet_db",
  synchronize: true, // Set to false in production
  logging: false,
  entities: [FaucetClaim],
  migrations: [],
  subscribers: [],
});

let initialized = false;

export const initializeDatabase = async () => {
  if (!initialized && !AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    initialized = true;
    console.log("Database initialized successfully");
  }
  return AppDataSource;
};
