
declare namespace Duplocloud {
  interface Infrastructure {
    Name: string;
    Accountid: string;
    Region: string;
    Vnet: {
      SecurityGroups: {
        Name: string;
        SystemId: string;
      }[],
      Subnets: {
        Id: string;
        Tags: {
          Key: string;
          Value: string;
        }[]
      }[]
    }
  }
  interface Tenant {
    PlanID: string;
    AccountName: string;
    TenantId: string;
    Metadata: {
      Key: string;
      Value: string;
    }[];
    Tags: {
      Key: string;
      Value: string;
    }[];

  }
  interface Portal {
    DefaultAwsAccount: string;
  }
  interface Lambda {
    FunctionName: string;
    PackageType: string;
    Description?: string;
    Timeout?: number;
    MemorySize?: number;
    Tags?: {
      [key: string]: string;
    }
    Environment?: { 
      Variables: {
        [key: string]: string;
      }
    }
    Code: {
      ImageUri?: string;
    }
    Layers?: string[];
    ImageConfig?: {}
  }
}
