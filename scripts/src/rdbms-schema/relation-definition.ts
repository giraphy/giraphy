import { ColumnDefinition, parseToArgsPart, parseToWherePart } from './column-definition';

export type RelationType = 'hasOne' | 'hasMany';

export type RelationDefinition = {
  name: string,
  type: RelationType,
  from: string,
  to: string
}

const parseRelationTypeToGraphQLType = (relationType: RelationType, targetType: string): string => {
  switch (relationType) {
    case 'hasMany':
      return `new GraphQLList(${targetType})`;
    case 'hasOne':
      return targetType;
  }
};

const toFirstCharacterUpperCase = (character: string): string => character.charAt(0).toUpperCase() + character.slice(1);

export const parseToRelationPart = (relationDefinitions: RelationDefinition[], columnDefinitions: ColumnDefinition[]): string => {
  return relationDefinitions.map(relationDefinition => {
    const from = splitTableAndColumn(relationDefinition.from);
    const to = splitTableAndColumn(relationDefinition.to);

    return `    ${relationDefinition.name}: {\n` +
      `      type: ${parseRelationTypeToGraphQLType(relationDefinition.type, toFirstCharacterUpperCase(to.table))},\n` +
      `      sqlJoin: (${from.table}Table, ${to.table}Table) =>\n` +
      `        \`\$\{${from.table}Table\}.${from.column} = \$\{${to.table}Table\}.${to.column}\`,\n` +
      `      args: {\n` +
      parseToArgsPart(columnDefinitions.filter(c => c.table_name === to.table)) +
      `      },\n` +
      `      where: (${to.table}Table, args, context) => {\n` +
      parseToWherePart(columnDefinitions.filter(c => c.table_name === to.table), to.table) +
      `      },\n` +
      `    },`
  }).join("\n") + "\n";
};

const splitTableAndColumn = (tableAndColumn: string): { table: string, column: string} => {
  const elements = tableAndColumn.split(".");
  if (elements.length !== 2) {
    throw Error(`${tableAndColumn} is invalid for relation target`);
  }

  return {
    table: elements[0],
    column: elements[1]
  }
};
