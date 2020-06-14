import { FieldNode } from "graphql";
import { _authorize, getArgumentData } from "./authorizer";
import { ForbiddenError } from "../error/forbidden-error";

const field: FieldNode = {
  kind: "Field",
  name: {
    kind: "Name",
    value: "users",
  },
  arguments: [
    {
      kind: "Argument",
      name: {
        kind: "Name",
        value: "userId",
      },
      value: {
        kind: "IntValue",
        value: "1",
      },
    },
  ],
  selectionSet: {
    kind: "SelectionSet",
    selections: [
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "userId",
        },
        arguments: [],
        selectionSet: undefined,
      },
      {
        kind: "Field",
        name: {
          kind: "Name",
          value: "posts",
        },
        arguments: [
          {
            kind: "Argument",
            name: {
              kind: "Name",
              value: "postId",
            },
            value: {
              kind: "IntValue",
              value: "1",
            },
          },
        ],
        selectionSet: {
          kind: "SelectionSet",
          selections: [
            {
              kind: "Field",
              name: {
                kind: "Name",
                value: "postName",
              },
              arguments: [],
              selectionSet: undefined,
            },
          ],
        },
      },
    ],
  },
};

describe("getArgumentData", () => {
  test("should return argument data", () => {
    expect(getArgumentData(field, {})).toEqual({
      users: { userId: "1", posts: { postId: "1" } },
    });
  });
});

describe("authorize", () => {
  describe("when verifying the conditions of a node", () => {
    const permissionPolicy = {
      users: {
        $condition: (data: any, context: any) =>
          data.users.userId === context.userId,
      },
    };

    describe("when valid", () => {
      test("should return nothing", () => {
        expect(
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "1" },
            permissionPolicy,
            permissionPolicy
          )
        ).toBeUndefined();
      });
    });

    describe("when invalid", () => {
      test("should throw forbidden error", () => {
        expect(() =>
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "2" },
            permissionPolicy,
            permissionPolicy
          )
        ).toThrow(new ForbiddenError(""));
      });
    });
  });

  describe("when verifying the conditions of a nested node", () => {
    const permissionPolicy = {
      users: {
        $condition: (data: any, context: any) =>
          data.users.userId === context.userId,

        posts: {
          $condition: (data: any, context: any) =>
            data.users.posts.postId === context.postId,
        },
      },
    };

    describe("when valid", () => {
      test("should return nothing", () => {
        expect(
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "1", postId: "1" },
            permissionPolicy,
            permissionPolicy
          )
        ).toBeUndefined();
      });
    });

    describe("when invalid", () => {
      test("should throw forbidden error", () => {
        expect(() =>
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "1", postId: "2" },
            permissionPolicy,
            permissionPolicy
          )
        ).toThrow(new ForbiddenError(""));
      });
    });
  });

  describe("when verifying the conditions of a edge", () => {
    const permissionPolicy = {
      users: {
        userId: {
          $condition: (data: any, context: any) =>
            data.users.userId === context.userId,
        },
      },
    };

    describe("when valid", () => {
      test("should return nothing", () => {
        expect(
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "1" },
            permissionPolicy,
            permissionPolicy
          )
        ).toBeUndefined();
      });
    });

    describe("when invalid", () => {
      test("should throw forbidden error", () => {
        expect(() =>
          _authorize(
            field,
            getArgumentData(field, {}),
            { userId: "2" },
            permissionPolicy,
            permissionPolicy
          )
        ).toThrow(new ForbiddenError(""));
      });
    });
  });
});
