type Setting = {
  port: number;
  db: {
    kind: "MySQL";
    version: string;
    host: string;
    user: string;
    password: string;
  };
  auth: AuthJwtSetting | AuthWebhookSetting | undefined;
};

type RdbmsSetting = {
  kind: "MySQL" | "PostgreSQL" ;
};

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
