import {
  ArgumentNode,
  DocumentNode,
  FieldNode,
  ListValueNode,
  OperationDefinitionNode,
  SelectionNode,
} from "graphql";
import { DefinitionNode } from "graphql/language/ast";
import { ForbiddenError } from "../error/forbidden-error";

const castArgumentValue = (argument: ArgumentNode) => {
  switch (argument.value.kind) {
    case "BooleanValue":
      return Boolean(argument.value.value);
    case "StringValue":
    case "EnumValue":
    case "IntValue":
    case "FloatValue":
      return argument.value.value.toString();
    case "ListValue":
      return (argument.value as ListValueNode).values;
    case "NullValue":
      return null;
    default:
      throw new Error("");
  }
};

export const getArgumentData = (selection: SelectionNode, result: any): any => {
  if (selection.kind !== "Field") return result;
  if (!selection.selectionSet) return result;

  let mid: any = {};

  selection.arguments?.forEach((argument: ArgumentNode) => {
    mid[argument.name.value] = castArgumentValue(argument);
  });

  result[selection.name.value] = mid;

  selection.selectionSet?.selections.forEach((selection: SelectionNode) => {
    getArgumentData(selection, mid);
  });

  return result;
};

export const _authorize = (
  selection: SelectionNode,
  argumentData: any,
  context: any,
  permissionPolicy: any,
  midPermissionPolicy: any | undefined
): void => {
  if (selection.kind !== "Field") return;
  const field = selection as FieldNode;

  if (
    typeof permissionPolicy[field.name.value]?.$condition !== "undefined" &&
    !permissionPolicy[field.name.value]?.$condition(argumentData, context)
  ) {
    throw new ForbiddenError("");
  }

  if (
    typeof midPermissionPolicy !== "undefined" &&
    typeof midPermissionPolicy[field.name.value]?.$condition !== "undefined" &&
    !midPermissionPolicy[field.name.value]?.$condition(argumentData, context)
  ) {
    throw new ForbiddenError("");
  }

  field.selectionSet?.selections.forEach((selection: SelectionNode) => {
    _authorize(
      selection,
      argumentData,
      context,
      permissionPolicy,
      midPermissionPolicy[field.name.value]
    );
  });
};

export const authorize = (
  document: DocumentNode,
  context: any,
  permissionPolicy: any
): void => {
  document.definitions.forEach((definition: DefinitionNode) => {
    if (definition.kind === "OperationDefinition") {
      const operation = definition as OperationDefinitionNode;
      operation.selectionSet.selections.forEach((selection: SelectionNode) => {
        const argumentData = getArgumentData(selection, {});
        _authorize(
          selection,
          argumentData,
          context,
          permissionPolicy,
          permissionPolicy
        );
      });
    } else {
      return;
    }
  });
};
