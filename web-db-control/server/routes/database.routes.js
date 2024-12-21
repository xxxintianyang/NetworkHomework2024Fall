const express = require('express');
const DatabaseController = require('../controllers/database.controller.js');

module.exports = (pool) => {
  const router = express.Router();
  const controller = new DatabaseController(pool);

  router.get('/tables', (req, res) => controller.getTables(req, res));
  
  router.get('/tables/:tableName/structure', (req, res) => 
    controller.getTableStructure(req, res));
  
  router.get('/tables/:tableName/data', (req, res) => 
    controller.getTableData(req, res));
  
  router.post('/tables/:tableName/records', (req, res) => 
    controller.addRecord(req, res));
  
  router.put('/tables/:tableName/records/:id', (req, res) => 
    controller.updateRecord(req, res));
  
  router.delete('/tables/:tableName/records/:id', (req, res) => 
    controller.deleteRecord(req, res));
  
  router.post('/tables', (req, res) => controller.createTable(req, res));

  return router;
}; 