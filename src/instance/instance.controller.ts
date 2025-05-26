import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { CreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { User } from 'src/database/schema';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard, RoleGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AddMemberDto } from './dto/add-member.dto';
import { roles } from './instance.roles';
import { GetRole } from 'src/auth/decorator/get-role.decorator';

@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new instance' })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBody({ type: CreateInstanceDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  create(@Body() createInstanceDto: CreateInstanceDto, @GetUser() user: User) {
    createInstanceDto.createdBy = user.authId;
    return this.instanceService.create(createInstanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all instances viewable by user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: User) {
    return this.instanceService.findAll(user.authId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Display instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.instanceService.findOne(id, user.authId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard, RoleGuard)
  update(
    @Param('id') id: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
    @GetUser() user: User,
    @GetRole() role: roles,
  ) {
    if (role !== 'Manager') {
      throw new UnauthorizedException('Not authorized to update');
    }
    return this.instanceService.update(id, updateInstanceDto, user.authId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.instanceService.remove(id, user.authId);
  }

  @Post(':id/members')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @GetUser() user: User,
  ) {
    addMemberDto.instanceId = id;
    return this.instanceService.addMember(user.authId, addMemberDto);
  }
}
