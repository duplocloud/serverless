import { DuplocloudServerlessAwsAdapter } from "../aws-adapter";
import { getMockServerless, mockOptions, mockUtils, getTestData } from './mocks';

const simpleService = {
  provider: {
    name: 'aws'
  }
}

const mockServerless = getMockServerless(simpleService);
const adapter = new DuplocloudServerlessAwsAdapter(mockServerless, mockOptions, mockUtils);
const vpcConfig = {
  securityGroupIds: [
    "sg-anothercoolid",
    "sg-sdv908342o45r098",
    "sg-isfe08934t094230f"
  ],
  subnetIds: [
    "subnet-0cfbe267cfd61c5c1",
    "subnet-0778551d435c73081"
  ]
};
const iamRole = 'arn:aws:iam::123456789066:role/duploservices-bartest';

it('should initialize provider properties when constructed', () => {

  expect(adapter.serverless).toBe(mockServerless);
  expect(adapter.options).toBe(mockOptions); 
  expect(adapter.utils).toBe(mockUtils);
});

it('should get an iam role correctly', async () => {
  const role = await adapter.getIamConfig();
  expect(role).toEqual({ role: iamRole });
});

it('should get a vpc config correctly', async () => {
  const vpc = await adapter.getVpcConfig();
  expect(vpc.securityGroupIds).toEqual(vpcConfig.securityGroupIds);
  expect(vpc.subnetIds).toEqual(vpcConfig.subnetIds);
});

// it should add the iam and vpc config to the serverless.service.provider object
it('should add the iam and vpc config to the serverless.service.provider object', async () => {
  await adapter.init();
  const p = adapter.serverless.service.provider as any;
  expect(p.iam.role).toEqual(iamRole);
  expect(p.vpc.securityGroupIds).toEqual(vpcConfig.securityGroupIds);
  expect(p.vpc.subnetIds).toEqual(vpcConfig.subnetIds);
});
