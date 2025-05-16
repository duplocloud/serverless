import Serverless from 'serverless'
import Service from 'serverless/classes/Service'
import axios from 'axios';
import { DuplocloudProvider } from '../provider';
import * as fs from 'fs';

export const mockOptions = {} as Serverless.Options;
export const mockUtils = {
  log: jest.fn()
} as unknown as ServerlessUtils;

const simpleService = {
  provider: {
    name: 'aws',
    stage: 'dev',
    region: 'us-west-2',
  }
} as Service

const mockServerless = getMockServerless(simpleService);

const mockAwsProvider = {
  getAccountId: jest.fn().mockResolvedValue('123456789066'),
  request: jest.fn().mockImplementation((service, method) => {
    if (service === 'EC2' && method === 'describeSecurityGroups') {
      return {
        SecurityGroups: [
          {
            Description: "All hosts in account duploservices-bartest",
            GroupName: "duploservices-bartest",
            OwnerId: "123456789066",
            GroupId: "sg-anothercoolid",
            Tags: [],
            VpcId: "vpc-someid",
          },
        ]
      }
    }
  })
}

export function getMockServerless(service: Service): Serverless {
  return {
    setProvider: jest.fn(),
    getProvider: jest.fn().mockImplementation((provider: string) => {
      if (provider === 'aws') {
        return mockAwsProvider;
      } else if (provider === 'duplocloud') {
        return new DuplocloudProvider(mockServerless, mockOptions, mockUtils);
      }
    }),
    pluginManager: {
      addPlugin: jest.fn()
    },
    configSchemaHandler: {
      defineCustomProperties: jest.fn(),
    },
    service
  } as unknown as Serverless;
}

// a function to get a json object from the data folder
export const getTestData = <T>(filename: string): T => {
  const file: string = `${__dirname}/data/${filename}.json`;
  const data = fs.readFileSync(file, { encoding: 'utf8' });
  return JSON.parse(data) as T;
}

// Mocking the serverless object
// global.mockServerless = mockServerless;

// Mocking options
// global.mockOptions = mockOptions;

// Mocking utils
// global.mockUtils = mockUtils;

axios.create = jest.fn().mockImplementation((defaults) => {
  const testInfra = getTestData("infra");
  const testTenant = getTestData("tenant");
  return {
    defaults,
    request: jest.fn().mockImplementation(({ url }) => {
      if (url === 'adminproxy/GetTenantNames') {
        return { data: [testTenant] }
        // else if the url starts with adminproxy/GetInfrastructureConfig
      } else if (url.startsWith('adminproxy/GetInfrastructureConfig')) {
        return { data: testInfra }
      }
    })
  }
});
