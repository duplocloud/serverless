import Serverless from 'serverless' 
import { DuplocloudProvider } from "./provider"
import { DuploError } from 'error';

export class DuploFunctionManager {
  // serverless type comes from @types/serverless and uses the Service class
    serverless: Serverless;
    options: Serverless.Options;
    config: DuploConfig;
    utils: ServerlessUtils;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hooks: any;
    provider: DuplocloudProvider;
    _liveFunctions: Array<Duplocloud.Lambda>;

    constructor(serverless: Serverless, options: Serverless.Options, utils: ServerlessUtils) {
      this.serverless = serverless;
      this.options = options;
      this.utils = utils;
      this.provider = this.serverless.getProvider('duplocloud') as DuplocloudProvider;
      this.hooks = {
        "deploy:deploy": async () => await this.deployFunctions()
      };
    }

    async deployFunctions() {
      this.utils.log('Deploying functions');
      const functions = this.serverless.service.functions;
      for (const [name, fn] of Object.entries(functions)) {
        this.utils.log(`Deploying function ${name}`);
      }
    }

    async list(): Promise<Array<Duplocloud.Lambda>> {
      if (this._liveFunctions) return this._liveFunctions;
      try {
        const tenant = await this.provider.getTenant();
        const path = `/subscriptions/${tenant.TenantId}/GetLambdaFunctions`;
        const response = await this.provider.request(path, 'GET');
        this._liveFunctions = response.data as Array<Duplocloud.Lambda>;
        return this._liveFunctions;
      } catch (error) {
        this.utils.log(error);
        throw new DuploError('Failed to list functions');
      }
    }

    async find(name: string): Promise<Duplocloud.Lambda> {
      const functions = await this.list();
      return functions.find(fn => fn.FunctionName === name);
    }

    async create(lambda: Duplocloud.Lambda) {
      try {
        const tenant = await this.provider.getTenant();
        const path = `/subscriptions/${tenant.TenantId}/CreateLambdaFunction`;
        const response = await this.provider.request(path, 'POST', {}, lambda);
        return response.data as Duplocloud.Lambda;
      } catch (error) {
        this.utils.log(error);
        throw new DuploError('Failed to list functions');
      }
    }

    async update(lambda: Duplocloud.Lambda) {}
}
