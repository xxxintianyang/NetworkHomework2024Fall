const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dbConfig = require('./config/db.config.js');

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('数据库连接成功！');
    connection.release();
  })
  .catch(error => {
    console.error('数据库连接失败：', error);
    process.exit(1);
  });

const databaseRoutes = require('./routes/database.routes.js');
app.use('/api', databaseRoutes(pool));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : '服务器内部错误'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 