import Serverless from 'serverless' 
import { DuplocloudProvider } from "./provider/DuplocloudProvider"

class DuplocloudServerless {

  // serverless type comes from @types/serverless and uses the Service class
  serverless: Serverless
  options: Serverless.Options
  config: DuploConfig
  utils: ServerlessUtils
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hooks: any;

  constructor(serverless: Serverless, options: Serverless.Options, utils: ServerlessUtils) {
    this.serverless = serverless
    this.options = options
    this.utils = utils
    this.serverless.pluginManager.addPlugin(DuplocloudProvider as any)
    console.log('DuplocloudServerless')
    this.utils.log('Foo Bar')
    this.hooks = {
      initialize: () => this.init()
    }
  }

  init() {
    console.log('A plugin named duplocloud')
  }

}
module.exports = DuplocloudServerless
