import Serverless from 'serverless' 
// import Plugin from 'serverless/classes/Plugin' 
// import { PluginStatic, Logging } from 'serverless/classes/Plugin'
import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';

const providerName = "duplocloud"

/**
 * DuplocloudProvider is a Serverless plugin that integrates with DuploCloud.
 * It manages the configuration and initialization of the provider within a Serverless framework.
 * 
 * Properties:
 * - serverless: The Serverless instance.
 * - options: Options passed to the Serverless command.
 * - utils: Utility functions for logging and progress.
 * - provider: The provider instance.
 * - hooks: Lifecycle hooks for the provider.
 * 
 * Methods:
 * - static getProviderName(): Returns the name of the provider.
 * - constructor(serverless, options, utils): Initializes the provider with Serverless instance, options, and utilities.
 * - init(): Logs the provider name.
 * - loadConfig(): Loads the DuploCloud configuration from Serverless service custom settings or environment variables.
 */
export class DuplocloudProvider {

  serverless: Serverless;
  options: Serverless.Options;
  utils: ServerlessUtils;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any;
  naming: { [key: string]: (param?: string) => string };
  api: AxiosInstance;
  _config: DuploConfig;
  _tenant: Duplocloud.Tenant;
  _infra: Duplocloud.Infrastructure;
  _portal: Duplocloud.Portal;

  static getProviderName() {
    return providerName;
  }

  constructor(serverless: Serverless, options: Serverless.Options, utils: ServerlessUtils) {
    this.serverless = serverless;
    this.options = options;
    this.utils = utils;
    // this.provider = this;
    this.serverless.setProvider(providerName, this);
    this.hooks = {
      initialize: async () => this.init()
    }
  }

  async init(): Promise<void> {
    this.utils.log(`The provider named ${providerName} loaded`)
  }

  getProviderName() {
    return providerName;
  }

  async resolveCredentials(): Promise<DuploConfig> {
    const service = this.serverless.service;
    let config: DuploConfig | ServerlessProviderDuplo = {}
    // when using duplocloud provider, the provider section has the configuration
    if (service.provider.name === providerName) {
      config = service.provider as ServerlessProviderDuplo
    // otherwise the duplocloud config is in the custom section
    } else {
      config = service?.custom?.duplocloud || {}
    }
    // if there is no host, token or tenant then get them from the environment
    if (!config.host) {
      config.host = process.env?.DUPLO_HOST
    }
    if (!config.token) {
      config.token = process.env?.DUPLO_TOKEN
    }
    if (!config.tenant) {
      config.tenant = process.env?.DUPLO_TENANT || 'default'
    }
    return config
  }

  async getCredentials(): Promise<DuploConfig> {
    if (!this._config) {
      this._config = await this.resolveCredentials()
    }
    return this._config
  }

  async getServerlessDeploymentBucketName(): Promise<string> {
    return ""
  }

  getRegion(): string {
    return this.serverless.service.provider.region || ""
  }

  getStage() {
    return ""
  }

  async getAccountId(): Promise<string> {
    return ""
  }

  async request(
    service: string,
    method: string,
    params?: {
      [key: string]: string
    },
    data?: unknown
    // options?: DuploRequestOptions,
  ): Promise<AxiosResponse> {
    const rc: AxiosRequestConfig = {
      url: service,
      method,
      data,
      params
    }
    // if the api has not been set yet, then set it
    if (!this.api) await this.setApi();
    return this.api.request(rc)
  }

  async setApi() {
    this._config = await this.getCredentials();
    this.api = axios.create({
      baseURL: this._config.host,
      timeout: 1000,
      headers: {
        'Authorization': `Bearer ${this._config.token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Return the results from the v3/features/system endpoint.
   */
  async getPortalInfo(): Promise<Duplocloud.Portal> {
    // use a try/catch block to handle errors and return only the data
    try {
      const response = await this.request('/v3/features/system', 'GET')
      return response.data
    } catch (error) {
      this.utils.log('Error getting portal info:', error)
    }
  }

  /**
   * Get the currently configured tenant object.
   */
  async getTenant(): Promise<Duplocloud.Tenant> {
    if (this._tenant) return this._tenant
    try {
      const res = await this.request('adminproxy/GetTenantNames', 'GET')
      // find the tenant named this.tenant from the list of tenants
      this._tenant = res.data.find((t: Duplocloud.Tenant) => t.AccountName === this._config.tenant);
      return this._tenant;
    } catch (error) {
      this.utils.log('Error getting tenant:', error)
    }
  }

  /**
   * Get the infrastructure for this tenant
   */
  async getInfrastructure(): Promise<Duplocloud.Infrastructure> {
    if (this._infra) return this._infra
    try {
      const tenant = await this.getTenant()
      const res = await this.request(`adminproxy/GetInfrastructureConfig/${tenant.PlanID}`, 'GET')
      this._infra = res.data
      return this._infra
    } catch (error) {
      this.utils.log('Error getting infrastructure:', error)
    }
  }
}
