import Serverless from 'serverless' 
// import Plugin from 'serverless/classes/Plugin' 
// import { PluginStatic, Logging } from 'serverless/classes/Plugin'
import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { DuploError } from './error'
import fs from 'node:fs/promises';
import { DuplocloudCustomVariable } from "./schema"

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
  naming: { [key: string]: (param?: string) => string };
  api: AxiosInstance;
  _config: DuploConfig;
  _creds: DuploCredentials;
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
    this.serverless.setProvider(providerName, this);
    serverless.configSchemaHandler.defineCustomProperties(DuplocloudCustomVariable);
  }

  getProviderName() {
    return providerName;
  }

  async resolveConfig(): Promise<DuploConfig> {
    const service = this.serverless.service;
    let config: DuploConfig | ServerlessProviderDuplo
    // when using duplocloud provider, the provider section has the configuration
    if (service.provider.name === providerName) {
      config = service.provider as ServerlessProviderDuplo
    } else { // otherwise the duplocloud config is in the custom section
      if (!service?.custom) service.custom = {}
      if (!service.custom?.duplocloud) service.custom.duplocloud = {}
      config = service.custom.duplocloud
    }
    // discover home directory
    if (!('homeDir' in config)) {
      config.homeDir = process.env?.DUPLO_HOME || `${process.env.HOME}/.duplo`
    }
    // discover cache directory which defaults to a dir within homeDir
    if (!('cacheDir' in config)) {
      config.cacheDir = process.env?.DUPLO_CACHE || `${config.homeDir}/cache`
    }
    if (!('configFile' in config)) {
      config.configFile = process.env?.DUPLO_CONFIG || `${config.homeDir}/config`
    }
    if (!('context' in config)) {
      config.context = process.env?.DUPLO_CONTEXT
    }
    // if there is no host, token or tenant then get them from the environment
    if (!('host' in config)) {
      config.host = process.env?.DUPLO_HOST
    }
    if (!('tenant' in config)) {
      config.tenant = process.env?.DUPLO_TENANT || 'default'
    }
    if (!('usePrefix' in config)) {
      config.usePrefix = true
    }
    if (!('useImages' in config)) {
      config.useImages = true
    }
    if (!('localMode' in config)) {
      config.localMode = false
    }
    // default the admin to true because we do need it for the aws api, most of the time ...
    if (!('admin' in config)) {
      config.admin = true 
    }
    return config
  }

  async getConfig(): Promise<DuploConfig> {
    if (!this._config) {
      this._config = await this.resolveConfig()
    }
    return this._config
  }

  async resolveCredentials(): Promise<DuploCredentials> {
    const config = await this.getConfig()
    // start with the configs token as the highest priority, then env vars
    let creds: DuploCredentials = {
      Version: "v1",
      DuploToken: config?.token || process.env?.DUPLO_TOKEN,
      DuploHost: config.host
    }
    // if still no token then let's go check the cache
    if (!creds.DuploToken) {
      const h = config.host.split("://")[1].replace("/", "");
      const parts = [h];
      if (config.admin) parts.push("admin");
      parts.push("duplo-creds");
      const cacheKey = parts.join(",");
      const cacheFile = `${config.cacheDir}/${cacheKey}.json`
      try {
        const data = await fs.readFile(cacheFile, { encoding: 'utf8' })
        creds = JSON.parse(data.toString());
        creds.DuploHost = config.host;
      } catch (error) {
        this.utils.log('Error reading cache file:', error);
        throw new DuploError('No DuploCloud token found');
      }
    }
    return creds
  }

  async getCredentials(): Promise<DuploCredentials> {
    if (!this._creds) {
      this._creds = await this.resolveCredentials()
    }
    return this._creds
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
    return this.api.request(rc);
  }

  async setApi() {
    const creds = await this.getCredentials();
    this.api = axios.create({
      baseURL: creds.DuploHost,
      timeout: 1000,
      headers: {
        'Authorization': `Bearer ${creds.DuploToken}`,
        'Content-Type': 'application/json'
      }
    });
    // this.api = setupCache(api);
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
