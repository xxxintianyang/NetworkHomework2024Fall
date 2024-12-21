class DatabaseController {
  constructor(pool) {
    this.pool = pool;
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

  async getTableData(req, res) {
    try {
      const { tableName } = req.params;
      const { searchQuery } = req.query;
      
      let query = `SELECT * FROM ${tableName}`;
      if (searchQuery) {
        const [columns] = await this.pool.query(`DESCRIBE ${tableName}`);
        const searchConditions = columns
          .map(col => `${col.Field} LIKE ?`)
          .join(' OR ');
        query += ` WHERE ${searchConditions}`;
      }
      
      const [rows] = await this.pool.query(query, 
        searchQuery ? columns.map(() => `%${searchQuery}%`) : []);
      res.json(rows);
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
      await this.pool.query(
        `DELETE FROM ${tableName} WHERE id = ?`, 
        [id]
      );
      res.json({ message: '记录删除成功' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = DatabaseController; 