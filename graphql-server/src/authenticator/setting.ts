export type AuthSetting = AuthJwtSetting | AuthWebhookSetting | undefined;

type AuthJwtSetting = {
  kind: "jwt";
  jwksUri: string;
  issuer: string;
  algorithms: string[];
  audience?: string;
  extraContextWebHook?: string;
};

type AuthWebhookSetting = {
  kind: "webhook";
  url: string;
};
