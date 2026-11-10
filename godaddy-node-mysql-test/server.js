
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

// Test 1: Node.js server
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Node.js is working!",
    nodeVersion: process.version
  });
});

// Test 2: MySQL connection
app.get("/db-test", async (req, res) => {
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME"
  ];

  const missing = required.filter(
    key => !process.env[key]
  );

  if (missing.length) {
    return res.status(500).json({
      success: false,
      message: "Missing database configuration",
      missing
    });
  }

  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [rows] = await connection.query(`
      SELECT
        1 AS test,
        DATABASE() AS databaseName,
        VERSION() AS mysqlVersion
    `);

    res.json({
      success: true,
      message: "MySQL connected successfully!",
      database: rows[0].databaseName,
      mysqlVersion: rows[0].mysqlVersion
    });

  } catch (error) {
    console.error(error.code || error.message);

    res.status(500).json({
      success: false,
      message: "MySQL connection failed",
      errorCode: error.code || "UNKNOWN"
    });

  } finally {
    if (connection) {
      await connection.end().catch(() => {});
    }
  }
});

// Test 3: Express API
app.get("/api/sample", (req, res) => {
  res.json({
    success: true,
    message: "Express API is working!",
    data: ["Node.js", "Express", "MySQL"]
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
