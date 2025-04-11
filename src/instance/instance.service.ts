import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async update(
    id: string,
    updateInstanceDto: UpdateInstanceDto,
    userId: string,
  ) {
    const membership =
      await this.databaseService.db.query.memberships.findFirst({
        where: and(
          eq(pgMemberships.userId, userId),
          eq(pgMemberships.instanceId, id),
        ),
      });
    if (membership?.roleId !== roles.MANAGER) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    const [instance] = await this.databaseService.db
      .update(pgInstances)
      .set(updateInstanceDto)
      .where(eq(pgInstances.id, id))
      .returning();

    return instance;
  }

  async remove(id: string, userId: string) {
    const instance = await this.databaseService.db.query.instances.findFirst({
      where: and(eq(pgInstances.id, id)),
    });
    if (instance?.createdBy !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    await this.databaseService.db
      .delete(pgInstances)
      .where(eq(pgInstances.id, id))
      .returning();
  }

  async addMember(userId: string, dto: AddMemberDto) {
    const userMembership =
      await this.databaseService.db.query.memberships.findFirst({
        where: and(
          eq(pgMemberships.userId, userId),
          eq(pgMemberships.instanceId, dto.instanceId),
        ),
      });
    if (userMembership?.roleId !== roles.MANAGER) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    const membership =
      await this.databaseService.db.query.memberships.findFirst({
        where: and(
          eq(pgMemberships.userId, dto.userId),
          eq(pgMemberships.instanceId, dto.instanceId),
        ),
      });
    if (membership) {
      return await this.databaseService.db
        .update(pgMemberships)
        .set(dto)
        .where(
          and(
            eq(pgMemberships.instanceId, dto.instanceId),
            eq(pgMemberships.userId, dto.userId),
          ),
        )
        .returning();
    }
    return await this.databaseService.db
      .insert(pgMemberships)
      .values(dto)
      .returning();
  }
}
