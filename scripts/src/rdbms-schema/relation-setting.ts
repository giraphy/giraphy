import { RelationType } from './rdbms-schema-parser';

export type RelationSetting = Record<string, Record<string,
  {
    type: RelationType,
    from: {
      table: string,
      column: string
    },
    to: {
      table: string,
      column: string,
    }
  }
  >>
