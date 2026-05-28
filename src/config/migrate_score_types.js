require('dotenv').config();
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

async function migrate() {
  const connection = await db.getConnection();
  try {
    console.log('Starting migration...');
    await connection.beginTransaction();

    // 1. Create score_types table
    console.log('Creating score_types table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`score_types\` (
        \`id\` CHAR(36) PRIMARY KEY,
        \`name\` VARCHAR(50) NOT NULL,
        \`code\` VARCHAR(20) UNIQUE NOT NULL,
        \`display_position\` INTEGER DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        \`deleted_at\` TIMESTAMP NULL
      )
    `);

    // 2. Insert default score types
    console.log('Inserting default score types...');
    const scoreTypes = [
      { id: 'st-thi', name: 'Thi', code: 'THI', pos: 0 },
      { id: 'st-dag', name: 'Đầu giờ', code: 'DAG', pos: 1 },
      { id: 'st-15ph', name: '15 phút', code: '15PH', pos: 2 },
      { id: 'st-45ph', name: '45 phút', code: '45PH', pos: 3 },
      { id: 'st-kk', name: 'Khảo kinh', code: 'KK', pos: 4 }
    ];

    for (const type of scoreTypes) {
      await connection.query(
        'INSERT IGNORE INTO score_types (id, name, code, display_position) VALUES (?, ?, ?, ?)',
        [type.id, type.name, type.code, type.pos]
      );
    }

    // 3. Update score_configs
    console.log('Updating score_configs table...');
    const [columns] = await connection.query('SHOW COLUMNS FROM score_configs LIKE "score_type_id"');
    if (columns.length === 0) {
      await connection.query('ALTER TABLE score_configs ADD COLUMN score_type_id CHAR(36) AFTER semester_id');
    }

    // Migrate data (always run to be safe)
    await connection.query("UPDATE score_configs SET score_type_id = 'st-thi' WHERE score_type_id IS NULL AND LOWER(score_type) = 'thi'");
    await connection.query("UPDATE score_configs SET score_type_id = 'st-dag' WHERE score_type_id IS NULL AND (LOWER(score_type) = 'đag' OR LOWER(score_type) = 'dag')");
    await connection.query("UPDATE score_configs SET score_type_id = 'st-15ph' WHERE score_type_id IS NULL AND LOWER(score_type) = '15ph'");
    await connection.query("UPDATE score_configs SET score_type_id = 'st-45ph' WHERE score_type_id IS NULL AND LOWER(score_type) = '45ph'");
    await connection.query("UPDATE score_configs SET score_type_id = 'st-kk' WHERE score_type_id IS NULL AND LOWER(score_type) = 'kk'");

    // Handle indexes
    const [indexes] = await connection.query('SHOW INDEX FROM score_configs WHERE Key_name = "uk_score_config_new"');
    if (indexes.length === 0) {
      await connection.query('ALTER TABLE score_configs ADD CONSTRAINT uk_score_config_new UNIQUE (class_id, semester_id, score_type_id)');
    }

    // Drop old index and column if they exist
    const [oldIndexes] = await connection.query('SHOW INDEX FROM score_configs WHERE Key_name = "uk_score_config"');
    if (oldIndexes.length > 0) {
      // To drop uk_score_config, we might need a separate index on class_id for the FK
      await connection.query('CREATE INDEX idx_score_configs_class_id ON score_configs(class_id)');
      await connection.query('ALTER TABLE score_configs DROP INDEX uk_score_config');
    }

    const [oldCols] = await connection.query('SHOW COLUMNS FROM score_configs LIKE "score_type"');
    if (oldCols.length > 0) {
      await connection.query('ALTER TABLE score_configs DROP COLUMN score_type');
    }

    // Add FK if not exists
    try {
      await connection.query('ALTER TABLE score_configs ADD CONSTRAINT fk_score_config_type FOREIGN KEY (score_type_id) REFERENCES score_types(id)');
    } catch (e) {
      // Might already exist
    }

    // 4. Update scores
    console.log('Updating scores table...');
    const [scoreCols] = await connection.query('SHOW COLUMNS FROM scores LIKE "score_type_id"');
    if (scoreCols.length === 0) {
      await connection.query('ALTER TABLE scores ADD COLUMN score_type_id CHAR(36) AFTER semester_id');
    }

    // Migrate data
    await connection.query("UPDATE scores SET score_type_id = 'st-thi' WHERE score_type_id IS NULL AND LOWER(score_type) = 'thi'");
    await connection.query("UPDATE scores SET score_type_id = 'st-dag' WHERE score_type_id IS NULL AND (LOWER(score_type) = 'đag' OR LOWER(score_type) = 'dag')");
    await connection.query("UPDATE scores SET score_type_id = 'st-15ph' WHERE score_type_id IS NULL AND LOWER(score_type) = '15ph'");
    await connection.query("UPDATE scores SET score_type_id = 'st-45ph' WHERE score_type_id IS NULL AND LOWER(score_type) = '45ph'");
    await connection.query("UPDATE scores SET score_type_id = 'st-kk' WHERE score_type_id IS NULL AND LOWER(score_type) = 'kk'");

    const [oldScoreCols] = await connection.query('SHOW COLUMNS FROM scores LIKE "score_type"');
    if (oldScoreCols.length > 0) {
      await connection.query('ALTER TABLE scores DROP COLUMN score_type');
    }

    try {
      await connection.query('ALTER TABLE scores ADD CONSTRAINT fk_scores_type FOREIGN KEY (score_type_id) REFERENCES score_types(id)');
    } catch (e) {
      // Might already exist
    }

    await connection.commit();
    console.log('Migration completed successfully!');
  } catch (error) {
    await connection.rollback();
    console.error('Migration failed:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
