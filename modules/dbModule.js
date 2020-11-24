const mysql = require('promise-mysql');
const db = require("../config/database");

let mysqlPool;
let mysqlConfig = {
  host: db.host,
  user: db.user,
  port: db.port,
  password: db.password,
  database: process.env.NODE_ENV === 'production'? 'alarm-prod' : 'alarm-dev',
};

async function getMysqlPool() {
    if (!mysqlPool) {
      mysqlPool = await mysql.createPool(mysqlConfig);
      return mysqlPool;     
    }
    return mysqlPool;
  }
  
  async function query(...args) {
    const queryText = args[0];
    const data = args[1];
  
    await getMysqlPool();
  
    const connection = await mysqlPool.getConnection();
    const result = (await connection.query(queryText, data)) || null;

    connection.release();
  
    return result;
  }
  
  async function transaction(...args) {
    await getMysqlPool();
    const connection = await mysqlPool.getConnection();
    try {
      await connection.beginTransaction();

      await args[0](connection);
      await connection.commit();
      connection.release();
      return "success";

    } catch (error) {
      console.log(error);
      await connection.rollback();
      connection.release();
      return "fail";
    } 
    //finally {
    //   connection.release();
    // }
  }

  async function startTransaction(...args) {
    await getMysqlPool();
    const connection = await mysqlPool.getConnection();
    let status = "fail";
    try {
      await connection.beginTransaction();
      await args[0](connection);
      status = "success";
    } catch (error) {
      console.log(error);
    } 
    return {connection, status};
  }
  
  module.exports = { query, transaction, startTransaction, getMysqlPool, mysqlConfig, mysqlPool };