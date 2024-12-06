/**
 * The custom config variable from the serverless file.
 */
declare type DuploConfig = {
  token: string;
  host: string;
  tenant: string;
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

declare interface ServerlessUtils {
  writeText: (message: string) => void,
  log: (...message: string[]) => void,
  progress: ServerlessProgressFactory
}
