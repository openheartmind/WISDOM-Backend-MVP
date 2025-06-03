import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { pgDimensions } from "src/database/schema"

@Injectable()
export class DimensionsService {
  constructor(private databaseService: DatabaseService) { }

  async findAll() {
    const { db } = this.databaseService;
    return await db.select({
        id: pgDimensions.id,
        title: pgDimensions.title,
        question: pgDimensions.question
      })
      .from(pgDimensions)
  }
}
