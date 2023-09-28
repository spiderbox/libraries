import { Module } from '@nestjs/common';
import { PunditService } from './pundit.service';

@Module({
  controllers: [],
  providers: [PunditService],
  exports: [PunditService],
})
export class PunditModule {}
