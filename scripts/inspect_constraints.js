require('dotenv').config();
const { getPool } = require('../src/config/database');

async function main() {
    const pool = await getPool();
    const result = await pool.request().query(`
    SELECT name, definition
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID('dbo.InscripcionesCampeonato')
    ORDER BY name
  `);

    console.log(JSON.stringify(result.recordset, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
