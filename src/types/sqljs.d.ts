declare module "sql.js" {
  export interface QueryExecResult {
    columns: string[];
    values: (string | number | null | Uint8Array)[][];
  }
  export interface Database {
    exec(sql: string): QueryExecResult[];
    run(sql: string): Database;
    close(): void;
  }
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | null) => Database;
  }
  export default function initSqlJs(config?: { locateFile?: (file: string) => string }): Promise<SqlJsStatic>;
}
