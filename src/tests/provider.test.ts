import { getMockServerless, mockOptions, mockUtils, getTestData } from './mocks';
import { DuplocloudProvider } from '../provider';
import Service from 'serverless/classes/Service'

const simpleService = {
  provider: {
    name: 'aws'
  }
}

const mockServerless = getMockServerless(simpleService as Service);
const provider = new DuplocloudProvider(mockServerless, mockOptions, mockUtils);

// Test resolving credentials
it('should resolve credentials correctly', async () => {
  const creds = await provider.resolveCredentials();
  expect(creds).toEqual({
    Version: "v1",
    DuploHost: 'https://foo.duplocloud.net',
    DuploToken: 'abc123def456'
  });
});

// test get credentials but use service config instead of environment variables
it('should get credentials correctly from service config', async () => {
  const service = {
    provider: {
      name: "aws"
    },
    custom: {
      duplocloud: {
        host: "https://bar.fuz.net",
        tenant: "bubbles",
        token: "iamnotarealtoken"
      }
    }
  } as unknown as Service
  const p = new DuplocloudProvider(getMockServerless(service), mockOptions, mockUtils);
  const config = await p.getConfig();
  const creds = await p.getCredentials();
  expect(config.host).toEqual("https://bar.fuz.net");
  expect(config.tenant).toEqual("bubbles");
  expect(creds.DuploToken).toEqual("iamnotarealtoken");

});

// Constructor initializes serverless, options and utils properties correctly
it('should initialize provider properties when constructed', () => {
  const provider = new DuplocloudProvider(mockServerless, mockOptions, mockUtils);

  expect(provider.serverless).toBe(mockServerless);
  expect(provider.options).toBe(mockOptions); 
  expect(provider.utils).toBe(mockUtils);
  expect(mockServerless.setProvider).toHaveBeenCalledWith('duplocloud', provider);
  expect(provider.getProviderName()).toBe('duplocloud');
  expect(DuplocloudProvider.getProviderName()).toBe('duplocloud');
});

// the init should work
it('should initialize provider properties when constructed', async () => {
  // const provider = new DuplocloudProvider(mockServerless, mockOptions, mockUtils);
  await provider.setApi();
  // expect the api default host to be 
  expect(provider.api.defaults.baseURL).toBe('https://foo.duplocloud.net');
  const testTenant = getTestData("tenant");
  const tenant = await provider.getTenant();
  expect(tenant).toEqual(testTenant);
});

it('should call the get infra just fine', async () => {
  // const provider = new DuplocloudProvider(mockServerless, mockOptions, mockUtils);
  await provider.setApi();
  
  // mock the tenant request
  const testInfra = getTestData("infra");
  const testTenant = getTestData("tenant");
  provider.api.request = jest.fn().mockImplementation(({url}) => {
    if (url === 'adminproxy/GetTenantNames') {
      return { data: [testTenant] }
    // else if the url starts with adminproxy/GetInfrastructureConfig
    } else if (url.startsWith('adminproxy/GetInfrastructureConfig')) {
      return { data: testInfra }
    }
  });

  const infra = await provider.getInfrastructure();
  expect(infra).toEqual(testInfra);
})

it('should say hello', async () => {
  expect(true).toBe(true);
});
