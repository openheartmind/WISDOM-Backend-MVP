import { Injectable } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { pgInstances, pgMemberships } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { AddMemberDto } from './dto/add-member.dto';
import { roles } from './instance.roles';

@Injectable()
export class InstanceService {
  constructor(private databaseService: DatabaseService) {}

  async create(instance: CreateInstanceDto) {
    const [created] = await this.databaseService.db
      .insert(pgInstances)
      .values(instance)
      .returning();

    await this.databaseService.db
      .insert(pgMemberships)
      .values({
        instanceId: created.id,
        roleId: roles.MANAGER,
        userId: created.createdBy,
      })
      .returning();

    return created;
  }

  async findAll(userId: string) {
    return await this.databaseService.db
      .select({
        id: pgInstances.id,
        title: pgInstances.title,
        description: pgInstances.description,
      })
      .from(pgInstances)
      .leftJoin(pgMemberships, eq(pgInstances.id, pgMemberships.instanceId))
      .where(eq(pgMemberships.userId, userId));
    //return await this.databaseService.db.query.instances.findMany();
  }

  async findOne(id: string, userId: string) {
    const [instance] = await this.databaseService.db
      .select({
        id: pgInstances.id,
        title: pgInstances.title,
        description: pgInstances.description,
        memberships: {
          roleId: pgMemberships.roleId,
        },
      })
      .from(pgInstances)
      .leftJoin(pgMemberships, eq(pgInstances.id, pgMemberships.instanceId))
      .where(and(eq(pgInstances.id, id), eq(pgMemberships.userId, userId)));
    return instance;
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

  async addMember(dto: AddMemberDto) {
    return await this.databaseService.db
      .insert(pgMemberships)
      .values(dto)
      .returning();
  }
}
