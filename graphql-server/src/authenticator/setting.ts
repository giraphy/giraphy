export type AuthSetting = AuthJwtSetting | AuthWebhookSetting | undefined;

type AuthJwtSetting = {
  type: "jwt";
  secret: {
    jwksUri: string;
  };
  issuer: string;
  algorithms: string[];
  audience?: string;
  extraContextWebHook?: string;
};

type AuthWebhookSetting = {
  type: "webhook";
  url: string;
};
