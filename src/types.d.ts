/**
 * The custom config variable from the serverless file.
 */
declare type DuploConfig = {
  token?: string;
  host?: string;
  tenant?: string;
}

declare type ServerlessProviderDuplo = DuploConfig &{
  name: string;
}

declare type ServerlessProviderAws = {
  name: string;
  iam: {
    role: string;
  }
} 

declare type Serverless = import("serverless") & {
  getProvider: (name: string) => any;
  service: {
    provider: ServerlessProviderDuplo | ServerlessProviderAws;
    custom: {
      duplo: DuploConfig
    }
  }
}

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

interface ServerlessProgress {
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
  log: Function & {
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
