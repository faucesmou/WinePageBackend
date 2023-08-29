import  * as db from  '../database/models/Index.js';

const dbConnectionTest = async () => {
  try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export default dbConnectionTest;