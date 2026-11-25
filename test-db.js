const db = require("./config/database");

async function testConnection() {
    try {
        const connection = await db.getConnection();

        console.log("Successfully connected to MySQL!");

        const [tables] = await connection.query("SHOW TABLES");

        console.log("\nCarePlus24 database tables:");

        tables.forEach((table) => {
            console.log(Object.values(table)[0]);
        });

        connection.release();

        console.log("\nDatabase test completed successfully!");

        process.exit(0);

    } catch (error) {
        console.error("Database test failed:");
        console.error(error.message);

        process.exit(1);
    }
}

testConnection();