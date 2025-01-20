import { Injectable } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { pgInstances } from '../database/schema';
import * as schema from '../database/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
@Injectable()
export class InstanceService {
  db: NodePgDatabase<typeof schema>;
  constructor(db: NodePgDatabase<typeof schema>) {
    this.db = db;
  }

  async create(instance: CreateInstanceDto) {
    return await this.db.insert(pgInstances).values(instance).returning();
  }

  async findAll() {
    return await this.db.query.instances.findMany();
  }

  async findOne(id: number) {
    return await this.db.query.instances.findFirst({
      where: eq(pgInstances.id, id),
    });
  }

  async update(id: number, updateInstanceDto: UpdateInstanceDto) {
    return await this.db
      .update(pgInstances)
      .set(updateInstanceDto)
      .where(eq(pgInstances.id, id))
      .returning();
  }

  async remove(id: number) {
    return await this.db
      .delete(pgInstances)
      .where(eq(pgInstances.id, id))
      .returning();
  }
}
