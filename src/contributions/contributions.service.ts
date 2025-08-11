// src/contributions/contributions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { UpdateContributionDto } from './dto/update-contribution.dto';
import { contributions } from '../database/schema/contributions';
import { eq } from 'drizzle-orm';
import { pairings } from 'src/database/schema';

@Injectable()
export class ContributionsService {
  constructor(private dbService: DatabaseService) { }

  async create(createContributionDto: CreateContributionDto, userId: string) {
    const existing = await this.dbService.db.query.contributions.findMany({
      where: eq(contributions.instanceId, createContributionDto.instanceId),
    });

    const { title, content, instanceId } = createContributionDto;

    const result = await this.dbService.db
      .insert(contributions)
      .values({
        title,
        content,
        instanceId,
        contributorId: userId,
      })
      .returning();

    if (existing.length) {
      //TODO: This should be generalized to all dimensions
      //TODO: All these should be in a transaction?
      const dimension = await this.dbService.db.query.dimensions.findFirst();
      existing.forEach(async (contribution) => {
        await this.dbService.db.insert(pairings).values({
          instanceId: contribution.instanceId,
          contribution1Id: result[0].id,
          contribution2Id: contribution.id,
          dimensionId: dimension?.id,
          isMeta: contribution.isMeta,
          isReviewed: false,
        });

        await this.dbService.db.insert(pairings).values({
          instanceId: contribution.instanceId,
          contribution1Id: contribution.id,
          contribution2Id: result[0].id,
          dimensionId: dimension?.id,
          isMeta: contribution.isMeta,
          isReviewed: false,
        });
      });
    }

    return result[0];
  }

  async findAll() {
    return this.dbService.db.query.contributions.findMany({
      with: {
        instance: true,
        contributor: {
          columns: {
            id: true,
            displayName: true,
            email: false,
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const contribution = await this.dbService.db.query.contributions.findFirst({
      where: eq(contributions.id, id),
      with: {
        instance: true,
        contributor: {
          columns: {
            id: true,
            displayName: true,
            email: false,
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });

    if (!contribution) {
      throw new NotFoundException(`Contribution with ID ${id} not found`);
    }

    return contribution;
  }

  async update(id: string, updateContributionDto: UpdateContributionDto, userId: string) {
    const contribution = await this.findOne(id);

    // Add authorization check here later

    const result = await this.dbService.db.update(contributions)
      .set({
        ...updateContributionDto,
        updatedAt: new Date(),
      })
      .where(eq(contributions.id, id))
      .returning();

    return result[0];
  }

  async remove(id: string, userId: string) {
    const contribution = await this.findOne(id);

    // Add authorization check here later

    await this.dbService.db.delete(contributions)

    await this.dbService.db.delete(contributions)
      .where(eq(contributions.id, id));

    return { deleted: true };
  }

  async findByInstance(instanceId: string) {
    return this.dbService.db.query.contributions.findMany({
      where: eq(contributions.instanceId, instanceId),
      with: {
        contributor: {
          columns: {
            id: true,
            displayName: true,
            email: false,
            createdAt: false,
            updatedAt: false,
          },
        },
      },
    });
  }
}
