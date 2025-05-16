import Serverless from 'serverless' 
import { DuplocloudProvider } from "./provider"
// import { PluginStatic } from 'serverless/classes/Plugin'

export class DuplocloudServerlessAwsAdapter {

  // serverless type comes from @types/serverless and uses the Service class
  serverless: Serverless;
  options: Serverless.Options;
  config: DuploConfig;
  utils: ServerlessUtils;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any;
  configurationVariablesSources: ServerlessConfigurationVariablesSources;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;
  duplo: DuplocloudProvider;

  constructor(serverless: Serverless, options: Serverless.Options, utils: ServerlessUtils) {
    this.serverless = serverless;
    this.options = options;
    this.utils = utils;
    this.provider = this.serverless.getProvider('aws');
    this.duplo = this.serverless.getProvider('duplocloud') as DuplocloudProvider
    this.hooks = {
      initialize: () => this.init()
    };
  }

  async init() {
    const config = await this.duplo.getConfig();
    const p = this.serverless.service.provider as unknown as ServerlessProviderAws;
    const vpcConfig = await this.getVpcConfig(config);
    const iamConfig = await this.getIamConfig(config);
    const currentTags = p.tags || {};
    const tags = await this.getTags(config);
    p.iam = iamConfig;
    p.vpc = vpcConfig;
    p.tags = {
      ...currentTags,
      ...tags
    }
    if (config.usePrefix) {
      await this.prefixFunctionNames(config);
    }
  }

  async getIamConfig(config: DuploConfig) {
    const awsId = await this.provider.getAccountId();
    return {
      role: `arn:aws:iam::${awsId}:role/duploservices-${config.tenant}`
    }
  }

  async getVpcConfig(config: DuploConfig) {
    const sgRes = await this.provider.request('EC2', 'describeSecurityGroups', {
      Filters: [
        {
          Name: 'group-name',
          Values: [`duploservices-${config.tenant}`]
        }
      ]
    });
    const tenantSecurityGroups = sgRes.SecurityGroups.map(sg => sg.GroupId);
    const infra = await this.duplo.getInfrastructure();
    const subnets = infra.Vnet.Subnets
      .filter(subnet => subnet.Tags.some(tag => tag.Key === 'Reach' && tag.Value === 'private'))
      .map(subnet => subnet.Id);
    const securityGroups = infra.Vnet.SecurityGroups
      .map(sg => sg.SystemId);
    return {
      securityGroupIds: [...tenantSecurityGroups,...securityGroups],
      subnetIds: subnets
    }
  }

  async getTags(config: DuploConfig) {
    return {
      "TENANT_NAME": config.tenant,
      "duplo-project": config.tenant,
      "duplo_lifecycle_owner": "duplo"
    }
  }

  async prefixFunctionNames(config: DuploConfig) {
    if ('functions' in this.serverless.service) {
      for (const [name, func] of Object.entries(this.serverless.service.functions)) {
        func.name = `duploservices-${config.tenant}-${name}`;
      }
    }
  }
}
