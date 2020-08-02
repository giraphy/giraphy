import * as SqlString from 'sqlstring';

export const escapeSqlString = (str: string): string => SqlString.escape(str);
