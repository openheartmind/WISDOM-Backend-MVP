import { Injectable, Inject } from '@nestjs/common';
import { ExtendedCreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { pgInstances, User } from '../database/schema';
import { eq } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class InstanceService {
  constructor(private databaseService: DatabaseService) {
  }

  async create(instance: ExtendedCreateInstanceDto, user: User) {
    return await this.databaseService.db.insert(pgInstances).values(instance).returning();
  }

  async findAll() {
    return await this.databaseService.db.query.instances.findMany();
  }

  async findOne(id: string) {
    return await this.databaseService.db.query.instances.findFirst({
      where: eq(pgInstances.id, id),
    });
  }

  async update(id: string, updateInstanceDto: UpdateInstanceDto) {
    return await this.databaseService.db
      .update(pgInstances)
      .set(updateInstanceDto)
      .where(eq(pgInstances.id, id))
      .returning();
  }

  async remove(id: string) {
    return await this.databaseService.db
      .delete(pgInstances)
      .where(eq(pgInstances.id, id))
      .returning();
  }
}
