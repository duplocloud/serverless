
export class DuplocloudAPI {

  token: string;
  host: string;
  tenant: string;
  
  constructor(host: string, token: string, tenant: string) {
    this.host = host;
    this.token = token;
    this.tenant = tenant;
  }
}
