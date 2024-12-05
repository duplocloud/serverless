import Serverless from 'serverless' 
import Utils from 'serverless/classes/Utils'
import { DuplocloudProvider } from "./provider"

class DuplocloudServerless {

  // serverless type comes from @types/serverless and uses the Service class
  serverless: Serverless
  options: Serverless.Options
  config: DuploConfig
  utils: Utils

  constructor(serverless: Serverless, options: Serverless.Options, utils: Utils) {
    this.serverless = serverless
    this.options = options
    this.utils = utils
    this.serverless.pluginManager.addPlugin(DuplocloudProvider)
    console.log('DuplocloudServerless', this.config)
  }

}
module.exports = DuplocloudServerless
