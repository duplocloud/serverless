import { DuplocloudServerless } from '../plugin';
import { DuplocloudProvider } from '../provider';
import { getMockServerless, mockOptions, mockUtils } from './mocks';
import Service from 'serverless/classes/Service'

const simpleService = {
  provider: {
    name: 'aws'
  }
}

const mockServerless = getMockServerless(simpleService as Service);

// Constructor initializes with valid Serverless, Options and Utils parameters
it('should initialize with valid parameters and set properties correctly', () => {
  const duploServerless = new DuplocloudServerless(
    mockServerless,
    mockOptions, 
    mockUtils
  );

  expect(duploServerless.serverless).toBe(mockServerless);
  expect(duploServerless.options).toBe(mockOptions);
  expect(duploServerless.utils).toBe(mockUtils);
  expect(mockServerless.pluginManager.addPlugin).toHaveBeenCalledWith(DuplocloudProvider);
});
