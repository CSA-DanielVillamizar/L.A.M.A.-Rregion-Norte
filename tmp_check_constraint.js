require('dotenv').config();
const { getPool } = require('./src/config/database');

(async () => {
  const pool = await getPool();
  const query = `
    SELECT c.name AS column_name, cc.definition
    FROM sys.check_constraints cc
    JOIN sys.columns c
      ON cc.parent_object_id = c.object_id
     AND cc.parent_column_id = c.column_id
    WHERE OBJECT_NAME(cc.parent_object_id) = 'InscripcionesCampeonato'
      AND c.name IN ('tipo_participante', 'capitulo')
    ORDER BY c.name;
  `;

  const result = await pool.request().query(query);
  console.log(JSON.stringify(result.recordset, null, 2));
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
