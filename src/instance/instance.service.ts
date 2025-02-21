import { Injectable, Inject } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { pgInstances } from '../database/schema';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class InstanceService {
  constructor(private databaseService: DatabaseService) {
  }

  async create(instance: CreateInstanceDto) {
    return await this.databaseService.db.insert(pgInstances).values(instance).returning();
  }

  async findAll() {
    return await this.databaseService.db.query.instances.findMany();
  }

  async findOne(id: number) {
    return await this.databaseService.db.query.instances.findFirst({
      where: eq(pgInstances.id, id),
    });
  }

  async update(id: number, updateInstanceDto: UpdateInstanceDto) {
    return await this.databaseService.db
      .update(pgInstances)
      .set(updateInstanceDto)
      .where(eq(pgInstances.id, id))
      .returning();
  }

  async remove(id: number) {
    return await this.databaseService.db
      .delete(pgInstances)
      .where(eq(pgInstances.id, id))
      .returning();
  }
}
