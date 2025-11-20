/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Externalize packages that cause issues in the browser
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Handle React Native and native module issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        path: false,
        os: false,
        "react-native-sqlite-storage": false,
        "@react-native-async-storage/async-storage": false,
        "@sap/hana-client/extension/Stream": false,
        mysql: false,
        mysql2: false,
        oracledb: false,
        pg: false,
        "pg-native": false,
        "pg-query-stream": false,
        redis: false,
        ioredis: false,
        "better-sqlite3": false,
        sqlite3: false,
        "sql.js": false,
        mssql: false,
        "typeorm-aurora-data-api-driver": false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
