// src/contributions/contributions.controller.ts
import { 
    Controller, Get, Post, Body, Patch, Param, Delete, 
    UseGuards, Req, Query 
  } from '@nestjs/common';
  import { ContributionsService } from './contributions.service';
  import { CreateContributionDto } from './dto/create-contribution.dto';
  import { UpdateContributionDto } from './dto/update-contribution.dto';
  import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
  import { AuthGuard } from '../auth/auth.guard';
  
  @ApiTags('contributions')
  @Controller('contributions')
  export class ContributionsController {
    constructor(private readonly contributionsService: ContributionsService) {}
  
    @Post()
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: 'Create a new contribution' })
    @ApiBody({ type: CreateContributionDto })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Contribution created successfully' })
    create(@Body() createContributionDto: CreateContributionDto, @Req() req) {
      const userId = req.user.id; // Use authId from the user object
      return this.contributionsService.create(createContributionDto, userId);
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all contributions' })
    findAll(@Query('instanceId') instanceId?: string) {
      if (instanceId) {
        return this.contributionsService.findByInstance(instanceId);
      }
      return this.contributionsService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a contribution by ID' })
    @ApiResponse({ status: 200, description: 'Contribution found' })
    @ApiResponse({ status: 404, description: 'Contribution not found' })
    findOne(@Param('id') id: string) {
      return this.contributionsService.findOne(id);
    }
  
    @Patch(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a contribution' })
    @ApiResponse({ status: 200, description: 'Contribution updated successfully' })
    @ApiResponse({ status: 404, description: 'Contribution not found' })
    update(
      @Param('id') id: string,
      @Body() updateContributionDto: UpdateContributionDto,
      @Req() req,
    ) {
      const userId = req.user.id; // Use authId from the user object
      return this.contributionsService.update(id, updateContributionDto, userId);
    }
  
    @Delete(':id')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a contribution' })
    @ApiResponse({ status: 200, description: 'Contribution deleted successfully' })
    @ApiResponse({ status: 404, description: 'Contribution not found' })
    remove(@Param('id') id: string, @Req() req) {
      const userId = req.user.id; // Use authId from the user object
      return this.contributionsService.remove(id, userId);
    }
  }