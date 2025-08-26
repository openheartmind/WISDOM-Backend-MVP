import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { pgInstances, pgMemberships, users } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import { DatabaseService } from 'src/database/database.service';
import { AddMemberDto } from './dto/add-member.dto';
import { roles } from './instance.roles';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class InstanceService {
  constructor(
    private databaseService: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async create(instance: CreateInstanceDto) {
    const [created] = await this.databaseService.db
      .insert(pgInstances)
      .values(instance)
      .returning();

    await this.databaseService.db
      .insert(pgMemberships)
      .values({
        instanceId: created.id,
        role: roles.MANAGER,
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

  async findOne(id: string) {
    const [instance] = await this.databaseService.db
      .select({
        id: pgInstances.id,
        title: pgInstances.title,
        description: pgInstances.description,
        memberships: {
          role: pgMemberships.role,
        },
      })
      .from(pgInstances)
      .leftJoin(pgMemberships, eq(pgInstances.id, pgMemberships.instanceId))
      .where(eq(pgInstances.id, id));
    return instance;
  }

  async update(id: string, updateInstanceDto: UpdateInstanceDto) {
    const [instance] = await this.databaseService.db
      .update(pgInstances)
      .set(updateInstanceDto)
      .where(eq(pgInstances.id, id))
      .returning();

    return instance;
  }

  async remove(id: string) {
    await this.databaseService.db
      .delete(pgInstances)
      .where(eq(pgInstances.id, id))
      .returning();
  }

  /**
   * Add a member to an instance
   * @param userId The id of the user adding the member
   * @param dto The dto containing the role, instanceId, and userId of the member to be added
   * @returns The membership record of the added member
   */
  async addMember(userId: string, dto: AddMemberDto) {
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

  async getRole(instanceId: string, userId: string) {
    const membership =
      await this.databaseService.db.query.memberships.findFirst({
        where: and(
          eq(pgMemberships.userId, userId),
          eq(pgMemberships.instanceId, instanceId),
        ),
      });
    return membership?.role;
  }

  async addMemberByEmail(
    userId: string,
    email: string,
    instanceId: string,
    role: string,
  ) {
    const targetUser = await this.databaseService.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!targetUser) {
      const inviter = await this.databaseService.db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      //Invite that user to the application
      await this.authService.inviteUser(
        email,
        instanceId,
        inviter?.displayName ?? 'Wisdom',
      );
      //Associate that user with the instance
      const newUser = await this.databaseService.db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!newUser) {
        throw new HttpException(
          'Failed to invite user',
          HttpStatus.BAD_REQUEST,
        );
      }
      return this.addMember(userId, { instanceId, role, userId: newUser.id });
    }
    return this.addMember(userId, { instanceId, role, userId: targetUser.id });
  }
}
