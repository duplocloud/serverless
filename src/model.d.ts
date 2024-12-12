
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
}
