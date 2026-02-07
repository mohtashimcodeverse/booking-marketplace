import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';

import { ServicePlansController } from './controllers/service-plans.controller';
import { VendorServiceAgreementsController } from './controllers/vendor-service-agreements.controller';
import { PropertyServiceConfigsController } from './controllers/property-service-configs.controller';
import { OpsTasksController } from './controllers/ops-tasks.controller';
import { MaintenanceController } from './controllers/maintenance.controller';

import { OperatorOpsGeneratorService } from './services/operator-ops-generator.service';
import { OperatorServiceConfigService } from './services/operator-service-config.service';
import { ServicePlansService } from './services/service-plans.service';
import { VendorServiceAgreementsService } from './services/vendor-service-agreements.service';
import { PropertyServiceConfigsService } from './services/property-service-configs.service';
import { OpsTasksService } from './services/ops-tasks.service';
import { MaintenanceService } from './services/maintenance.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    ServicePlansController,
    VendorServiceAgreementsController,
    PropertyServiceConfigsController,
    OpsTasksController,
    MaintenanceController,
  ],
  providers: [
    OperatorOpsGeneratorService,
    OperatorServiceConfigService,
    ServicePlansService,
    VendorServiceAgreementsService,
    PropertyServiceConfigsService,
    OpsTasksService,
    MaintenanceService,
  ],
  exports: [
    OperatorOpsGeneratorService,
    OperatorServiceConfigService,
    ServicePlansService,
    VendorServiceAgreementsService,
    PropertyServiceConfigsService,
    OpsTasksService,
    MaintenanceService,
  ],
})
export class OperatorModule {}
