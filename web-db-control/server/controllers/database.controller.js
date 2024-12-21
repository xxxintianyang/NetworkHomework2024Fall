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
      const [columns] = await this.pool.query(`DESCRIBE ${tableName}`);
      res.json(columns);
    } catch (error) {
      res.status(500).json({ message: error.message });
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

      // 移除不应该插入的字段
      delete data.id;
      delete data.created_at;
      delete data.updated_at;
      
      const [result] = await this.pool.query(
        `INSERT INTO ${tableName} SET ?`, 
        data
      );
      
      res.json({ 
        message: '添加成功',
        id: result.insertId, 
        ...data 
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

      // 移除不应该更新的字段
      delete data.id;
      delete data.created_at;
      delete data.updated_at;
      
      const [result] = await this.pool.query(
        `UPDATE ${tableName} SET ? WHERE id = ?`, 
        [data, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: '记录不存在' });
      }
      
      res.json({ id, ...data });
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
}

module.exports = DatabaseController; 