import axios from 'axios';

const API_URL = 'http://172.20.10.2:3000/api';//这个地方是服务器的IP地址和端口，需要根据实际情况修改，这很重要

// 创建 axios 实例
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// 添加响应拦截器
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.data) {
      console.error('API错误:', error.response.data);
    } else {
      console.error('API错误:', error.message);
    }
    return Promise.reject(error);
  }
);

export const api = {
  async getTables() {
    const response = await instance.get('/tables');
    return response.data;
  },

  async getTableData(tableName, searchQuery = '') {
    if (!tableName) throw new Error('表名不能为空');
    const response = await instance.get(
      `/tables/${tableName}/data`,
      { params: { searchQuery } }
    );
    return response.data;
  },

  async addRecord(tableName, data) {
    if (!tableName) throw new Error('表名不能为空');
    if (!data) throw new Error('数据不能为空');
    
    const response = await instance.post(
      `/tables/${tableName}/records`,
      data
    );
    return response.data;
  },

  async updateRecord(tableName, id, data) {
    if (!tableName) throw new Error('表名不能为空');
    if (!id) throw new Error('记录ID不能为空');
    if (!data) throw new Error('数据不能为空');
    
    const response = await instance.put(
      `/tables/${tableName}/records/${id}`,
      data
    );
    return response.data;
  },

  async deleteRecord(tableName, id) {
    if (!tableName) throw new Error('表名不能为空');
    if (!id) throw new Error('记录ID不能为空');
    
    const response = await instance.delete(
      `/tables/${tableName}/records/${id}`
    );
    return response.data;
  },

  async createTable(tableData) {
    const response = await instance.post('/tables', tableData);
    return response.data;
  },

  async getTableStructure(tableName) {
    const response = await instance.get(`/tables/${tableName}/structure`);
    return response.data;
  }
}; 