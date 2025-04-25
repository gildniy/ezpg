export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  tempSecret: string;
  accessTokenExpiration: string;
  tempTokenExpiration: string;
  refreshTokenSecret: string;
  refreshTokenExpiration: string;
}

export interface CorsConfig {
  allowedOrigins: string[];
}

export interface AppConfig {
  name: string;
  nodeEnv: string;
  port: number;
}

export interface TfaConfig {
  encryptionKey: string;
}

export interface Config {
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  app: AppConfig;
  tfa: TfaConfig;
}
