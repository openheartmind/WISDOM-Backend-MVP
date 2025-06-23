import { Controller, Get, HttpException, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { DimensionsService } from "./dimensions.service";
import { DimensionResponseDto } from "./dto/dimension-response.dto";

@Controller('dimensions')
export class DimensionsController {
  constructor(private readonly dimensionsService: DimensionsService) { }

  @ApiOperation({ summary: 'List all dimensions available' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiResponse({ isArray: true, type: DimensionResponseDto })
  async list() {
    try {
      return await this.dimensionsService.findAll()
    } catch (error) {
      console.error('[drizzle]', error)
      throw new HttpException('Error querying database', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
