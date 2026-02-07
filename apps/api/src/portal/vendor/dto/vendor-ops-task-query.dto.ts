import { OpsTaskStatus } from '@prisma/client';

export type VendorOpsTaskQueryDto = {
  status?: OpsTaskStatus;
  page?: string;
  pageSize?: string;
};
