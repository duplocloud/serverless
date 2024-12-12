import Serverless from 'serverless' 
import { DuplocloudProvider } from "./provider"
// import { PluginStatic } from 'serverless/classes/Plugin'

export class DuplocloudServerlessAwsAdapter {

  // serverless type comes from @types/serverless and uses the Service class
  serverless: Serverless
  options: Serverless.Options
  config: DuploConfig
  utils: ServerlessUtils
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any;
  configurationVariablesSources: ServerlessConfigurationVariablesSources;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider: any;

  constructor(serverless: Serverless, options: Serverless.Options, utils: ServerlessUtils) {
    this.serverless = serverless;
    this.options = options;
    this.utils = utils;
    this.provider = this.serverless.getProvider('aws');
    this.hooks = {
      initialize: () => this.init()
    };
    // this.configurationVariablesSources = {
    //   duplo: {
    //     resolve: async ({ address, params }) => {
    //       const dp = this.serverless.getProvider('duplocloud');
    //       const config = await dp.getCredentials();
    //       return {
    //         value: config[address]
    //       }
    //     },
    //   },
    // };
  }

  async init() {
    const p = this.serverless.service.provider as unknown as ServerlessProviderAws;
    const vpcConfig = await this.getVpcConfig();
    const iamConfig = await this.getIamConfig();
    const currentTags = p.tags || {};
    const tags = await this.getTags();
    p.iam = iamConfig;
    p.vpc = vpcConfig;
    p.tags = {
      ...currentTags,
      ...tags
    }
  }

  async getIamConfig() {
    const dp = this.serverless.getProvider('duplocloud') as DuplocloudProvider;
    const awsId = await this.provider.getAccountId();
    const config = await dp.getCredentials();
    return {
      role: `arn:aws:iam::${awsId}:role/duploservices-${config.tenant}`
    }
  }

  async getVpcConfig() {
    const dp = this.serverless.getProvider('duplocloud') as DuplocloudProvider;
    const config = await dp.getCredentials();
    const sgRes = await this.provider.request('EC2', 'describeSecurityGroups', {
      Filters: [
        {
          Name: 'group-name',
          Values: [`duploservices-${config.tenant}`]
        }
      ]
    });
    const tenantSecurityGroups = sgRes.SecurityGroups.map(sg => sg.GroupId);
    const infra = await dp.getInfrastructure();
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

  async getTags() {
    const dp = this.serverless.getProvider('duplocloud') as DuplocloudProvider;
    const config = await dp.getCredentials();
    return {
      "TENANT_NAME": config.tenant,
      "duplo-project": config.tenant,
      "duplo_lifecycle_owner": "duplo"
    }
  }
}
