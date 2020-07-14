import { RelationType } from './relation-definition';

export type RelationSetting = Record<string, Record<string,
  {
    type: RelationType,
    from: string,
    to: string
  }
  > | undefined>

