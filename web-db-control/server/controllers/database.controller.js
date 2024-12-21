class DatabaseController {
  constructor(pool) {
    this.pool = pool;
  }

  async getTableData(req, res) {
    try {
      const { tableName } = req.params;
      const { searchQuery } = req.query;
      
      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }

      let query = `SELECT * FROM ${tableName}`;
      let params = [];

      if (searchQuery) {
        // 获取表的所有列名
        const [columns] = await this.pool.query(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        `, [process.env.DB_DATABASE || 'web_db_control', tableName]);

        // 构建搜索条件
        const searchConditions = columns
          .map(col => `${col.COLUMN_NAME} LIKE ?`)
          .join(' OR ');

        if (searchConditions) {
          query += ` WHERE ${searchConditions}`;
          // 为每个列添加搜索参数
          params = columns.map(() => `%${searchQuery}%`);
        }
      }

      // 添加排序
      query += ' ORDER BY id DESC';

      console.log('执行查询:', query, params); // 调试日志

      const [rows] = await this.pool.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('获取表数据失败:', error);
      res.status(500).json({ 
        message: '获取表数据失败',
        error: error.message 
      });
    }
  }

  async getTables(req, res) {
    try {
      const [rows] = await this.pool.query('SHOW TABLES');
      const tables = rows.map(row => Object.values(row)[0]);
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getTableStructure(req, res) {
    try {
      const { tableName } = req.params;
      
      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }

      const [columns] = await this.pool.query(`DESCRIBE ${tableName}`);
      res.json(columns);
    } catch (error) {
      console.error('获取表结构失败:', error);
      res.status(500).json({ 
        message: '获取表结构失败',
        error: error.message 
      });
    }
  }

  async addRecord(req, res) {
    try {
      const { tableName } = req.params;
      const data = req.body;
      
      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({ message: '数据不能为空' });
      }

      // 获取表结构
      const [columns] = await this.pool.query(`DESCRIBE ${tableName}`);
      
      // 过滤掉不存在的字段和自动生成的字段
      const validColumns = columns.map(col => col.Field);
      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (validColumns.includes(key) && 
            !['id', 'created_at', 'updated_at'].includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      // 构建 INSERT 语句
      const fields = Object.keys(filteredData);
      const values = Object.values(filteredData);
      const placeholders = fields.map(() => '?').join(', ');
      
      const sql = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
      console.log('执行 SQL:', sql, values); // 调试日志

      const [result] = await this.pool.query(sql, values);
      
      res.json({ 
        message: '添加成功',
        id: result.insertId, 
        ...filteredData 
      });
    } catch (error) {
      console.error('添加记录失败:', error);
      res.status(500).json({ 
        message: '添加记录失败',
        error: error.message 
      });
    }
  }

  async updateRecord(req, res) {
    try {
      const { tableName, id } = req.params;
      const data = req.body;
      
      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }
      
      if (!id) {
        return res.status(400).json({ message: 'ID不能为空' });
      }

      // 获取表结构
      const [columns] = await this.pool.query(`DESCRIBE ${tableName}`);
      
      // 过滤掉不存在的字段和自动生成的字段
      const validColumns = columns.map(col => col.Field);
      const filteredData = Object.keys(data).reduce((acc, key) => {
        if (validColumns.includes(key) && 
            !['id', 'created_at', 'updated_at'].includes(key)) {
          acc[key] = data[key];
        }
        return acc;
      }, {});

      const [result] = await this.pool.query(
        `UPDATE ${tableName} SET ? WHERE id = ?`, 
        [filteredData, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '记录不存在' });
      }
      
      res.json({ 
        message: '更新成功',
        id, 
        ...filteredData 
      });
    } catch (error) {
      console.error('更新记录失败:', error);
      res.status(500).json({ 
        message: '更新记录失败',
        error: error.message 
      });
    }
  }

  async deleteRecord(req, res) {
    try {
      const { tableName, id } = req.params;
      
      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }
      
      if (!id) {
        return res.status(400).json({ message: 'ID不能为空' });
      }

      const [result] = await this.pool.query(
        `DELETE FROM ${tableName} WHERE id = ?`, 
        [id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '记录不存在' });
      }

      res.json({ message: '记录删除成功' });
    } catch (error) {
      console.error('删除记录失败:', error);
      res.status(500).json({ 
        message: '删除记录失败',
        error: error.message 
      });
    }
  }

  async createTable(req, res) {
    try {
      const { tableName, columns } = req.body;

      if (!tableName) {
        return res.status(400).json({ message: '表名不能为空' });
      }

      if (!columns || !columns.length) {
        return res.status(400).json({ message: '至少需要一个列' });
      }

      // 构建创建表的 SQL
      let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
      
      const columnDefinitions = columns.map(column => {
        let def = `${column.name} ${column.type}`;
        
        // 添加长度/精度
        if (column.length) {
          def += `(${column.length})`;
        }
        
        // 是否可为空
        if (!column.nullable) {
          def += ' NOT NULL';
        }
        
        // 是否自增
        if (column.autoIncrement) {
          def += ' AUTO_INCREMENT';
        }
        
        // 是否为主键
        if (column.isPrimary) {
          def += ' PRIMARY KEY';
        }
        
        return def;
      });

      sql += columnDefinitions.join(', ');
      sql += ') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

      console.log('Creating table with SQL:', sql);

      await this.pool.query(sql);
      
      res.json({ 
        message: '表创建成功',
        tableName 
      });
    } catch (error) {
      console.error('创建表失败:', error);
      res.status(500).json({ 
        message: '创建表失败',
        error: error.message 
      });
    }
  }
}

module.exports = DatabaseController; 