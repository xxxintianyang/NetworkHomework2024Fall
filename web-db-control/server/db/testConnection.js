const mysql = require('mysql2/promise');
const dbConfig = require('../config/db.config.js');

async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('数据库连接成功！');
    
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('数据库表列表：', rows);
    
    await connection.end();
  } catch (error) {
    console.error('数据库连接失败：', error);
  }
}

testConnection(); 