/**
 * The custom config variable from the serverless file.
 */
declare type DuploConfig = {
  enabled?: boolean;
  host?: string;
  tenant?: string;
  usePrefix?: boolean;
  useImages?: boolean;
  localMode?: boolean;
  admin?: boolean;
  homeDir?: string;
  cacheDir?: string;
  configFile?: string;
  context?: string;
  token?: string;
}

/**
 * The credentials object all of the duplo tools use
 */
declare type DuploCredentials = {
  Version?: string;
  DuploToken?: string;
  Expiration?: string;
  NeedOTP?: boolean;
  DuploHost?: string;
}

declare namespace Serverless {
  export type foo = string;
}

declare type ServerlessProviderDuplo = DuploConfig &{
  name: string;
}

declare type ServerlessProviderAws = {
  name: string;
  iam?: {
    role: string;
  }
  tags?: {
    [key: string]: string
  }
  vpc?: {
    securityGroupIds: string[];
    subnetIds: string[];
  },
  compiledCloudFormationTemplate?: {
      Resources: {
          [key: string]: string;
      };
      Outputs?:
          | {
              [key: string]: string;
          }
          | undefined;
  };
  stackTags?: { [key: string]: string };
  stage?: string;
  region?: string;
  runtime?: string | undefined;
  timeout?: number | undefined;
  versionFunctions?: boolean;
  layers?: Array<string | Record<string, string>> | undefined;
} 

declare type ServerlessService = {
  provider: ServerlessProviderDuplo | ServerlessProviderAws;
  custom: {
    duplo: DuploConfig
  }
}

// declare type DServerless = import("serverless") & {
//   getProvider: (name: string) => DuplocloudProvider | ;
//   service: {
//     provider: ServerlessProviderDuplo | ServerlessProviderAws;
//     custom: {
//       duplo: DuploConfig
//     }
//   }
// }

/**
 * The types for serverless don't seem to have the utils exposed correctly.
 * 
 * Found these here: 
 * @see https://github.com/amplify-education/serverless-domain-manager/blob/main/src/types.ts
 * 
 */
declare interface ServerlessOptions {
  stage: string;
  region?: string;
}

declare interface ServerlessProgress {
  update (message: string): void

  remove (): void
}

declare interface ServerlessProgressFactory {
  get (name: string): ServerlessProgress;
}

// declare interface ServerlessUtils {
//   writeText: (message: string) => void,
//   log: (...message: string[]) => void,
//   progress: ServerlessProgressFactory
// }

declare type ServerlessUtils = import("serverless/classes/Utils") & {
  log: (...message: string[]) => void & {
    error: (...message: string[]) => void,
    warn: (...message: string[]) => void,
    info: (...message: string[]) => void
  }
}

declare type DuploRequestOptions = { 
  useCache?: boolean | undefined; 
  region?: string | undefined 
}

declare type ServerlessResolveParams = {
  address: string;
  resolveVariable: (variable: string) => Promise<string>;
  params: string[];
}

declare type ServerlessConfigurationVariablesSources = { 
  [key: string]: { 
    resolve: (args: ServerlessResolveParams) => Promise<{ value: string }>
  } 
}
