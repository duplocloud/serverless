
import Serverless from 'serverless' 
import Plugin from 'serverless/classes/Plugin' 

const providerName = "duplocloud"

export class DuplocloudProvider implements Plugin {

  serverless: Serverless;
  options: Serverless.Options;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any;

  static getProviderName() {
    return providerName;
  }

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.serverless.setProvider(providerName, this as any);
    this.hooks = []
  }

  loadConfig(): DuploConfig {
    const config: DuploConfig = this.serverless.service?.custom?.duplocloud || {}
    // if there is no host, token or tenant then get them from the environment
    if (!config.host) {
      config.host = process.env.DUPLO_HOST
    }
    if (!config.token) {
      config.token = process.env.DUPLO_TOKEN
    }
    if (!config.tenant) {
      config.tenant = process.env.DUPLO_TENANT || 'default'
    }
    return config
  }
}
