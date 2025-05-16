
const host = {
  title: 'Host',
  type: 'string',
  description: 'The host of the Duplocloud API',
}

const token = {
  title: 'Token',
  type: 'string',
  description: 'The token to authenticate with the Duplocloud API',
}

const tenant = {
  title: 'Tenant',
  type: 'string',
  description: 'The name of the tenant to place the resources in',
  default: 'default'
}

const homeDir = {
  title: 'Home Directory',
  type: 'string',
  description: 'The home directory of the user',
  default: `${process.env.HOME}/.duplo`
}

const cacheDir = {
  title: 'Cache Directory',
  type: 'string',
  description: 'The directory to store the cache',
  default: `${process.env.HOME}/.duplo/cache`
}

const configFile = {
  title: 'Config File',
  type: 'string',
  description: 'The path to the config file',
  default: `${process.env.HOME}/.duplo/config.json`
}

const usePrefix = {
  title: 'Use Prefix',
  type: 'boolean',
  description: 'Whether to prefix the functions with the usual duploservices-tenant prefix',
  default: true
}

const useImages = {
  title: 'Use Images',
  type: 'boolean',
  description: 'Whether to use images for the functions',
  default: false
}

const localMode = {
  title: 'Local Mode',
  type: 'boolean',
  description: 'Whether to run the function locally',
  default: false
}

const admin = {
  title: 'Admin',
  type: 'boolean',
  description: 'Whether an admin user should enable admin for this session.',
  default: true
}

const enabled = {
  title: 'Enabled',
  type: 'boolean',
  description: 'Whether the Duplocloud plugin is enabled',
  default: true
}

export const DuplocloudCustomVariable = {
  type: 'object',
  properties: {
    duplocloud: { 
      title: 'Duplocloud',
      type: 'object',
      properties: {
        enabled,
        host,
        token,
        tenant,
        homeDir,
        cacheDir,
        configFile,
        usePrefix,
        useImages,
        localMode,
        admin,
      },
    },
  }
};
