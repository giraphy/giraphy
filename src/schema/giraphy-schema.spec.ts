import { users } from '../dev-app/base-schema';
import { RichGraphqlObjectType } from './giraphy-schema';

describe("toConfig", () => {
  it("should get config", () => {
    expect(new RichGraphqlObjectType(users.objectTypeConfig)
      .toConfig()).toBe(users.objectTypeConfig);
  });
});
