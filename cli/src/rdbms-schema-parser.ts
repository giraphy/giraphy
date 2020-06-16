export type RdbmsSchema = {
  table: string,
  primaryKey: string,
  columns: {
    name: string,
    type: string,
    notNulL: boolean
  }[],
}

const tableRegex = /^CREATE TABLE `(.+)` \(/;
const primaryKeyRegex = /PRIMARY KEY \(`(.+)`\)/;
const columnsRegex = /\([^\(\)]*(\([^\(\)]*[^\(\)]*\)[^\(\)]*)*[^\(\)]*\)/;




export const parseRdbmsDdlToSchema = (ddl: string): RdbmsSchema => {
  const lines = ddl.split("\n")

  if (!lines[0]) throw Error("ddl is invalid");



  const table = ddl.match(tableRegex)![1];
  const primayKey = ddl.match(primaryKeyRegex)![1];
  const columnLines = ddl.match(columnsRegex)![1]










};
