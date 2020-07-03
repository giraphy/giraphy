import { RelationType } from './rdbms-schema-parser';

export type RelationSetting = Record<string, Record<string,
  {
    type: RelationType,
    from: string,
    to: string
  }
  > | undefined>
