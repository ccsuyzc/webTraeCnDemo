// 动态加载 sql.js
const initSqlJs = (await import('sql.js')).default;

let SQL;

export const initDB = async (initSql) => {
  try {
    if (!SQL) {
      // 初始化配置
      SQL = await initSqlJs({
        // Vite serves public dir at root, so wasm should be at /sql-wasm.wasm
        locateFile: filename => `/${filename}`
      });
    }

    const db = new SQL.Database()
    if (initSql) {
      try {
        db.run(initSql)
      } catch (e) {
        console.error('初始化 SQL 失败:', e)
        throw new Error(`数据库初始化错误: ${e.message}`)
      }
    }
    return db
  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw new Error(`数据库连接失败: ${error.message}`)
  }
}

export const runSQL = (db, sql) => {
  if (!db || typeof db.exec !== 'function') {
    throw new Error('数据库未正确初始化')
  }
  
  try {
    return db.exec(sql)
  } catch (e) {
    const error = new Error(e.message)
    error.name = 'SQLExecutionError'
    throw error
  }
}