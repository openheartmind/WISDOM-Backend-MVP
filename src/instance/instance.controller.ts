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
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AddMemberDto } from './dto/add-member.dto';
import { AddMemberByEmailDto } from './dto/add-member-by-email.dto';
import { roles } from './instance.roles';

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
  @UseGuards(AuthGuard)
  create(@Body() createInstanceDto: CreateInstanceDto, @GetUser() user: User) {
    createInstanceDto.createdBy = user.id;
    return this.instanceService.create(createInstanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all instances viewable by user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  findAll(@GetUser() user: User) {
    return this.instanceService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Display instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    if (!(await this.instanceService.getRole(id, user.id))) {
      throw new UnauthorizedException(
        'Not Authorized: Not a member of instance',
      );
    }
    return this.instanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
    @GetUser() user: User,
  ) {
    if ((await this.instanceService.getRole(id, user.id)) !== roles.MANAGER) {
      throw new UnauthorizedException(
        'Not authorized: Not a manager of instance',
      );
    }
    return this.instanceService.update(id, updateInstanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    if ((await this.instanceService.getRole(id, user.id)) !== roles.MANAGER) {
      throw new UnauthorizedException(
        'Not authorized: Not a manager of instance',
      );
    }
    return this.instanceService.remove(id);
  }

  @Post(':id/members')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addMember(
    @Param('id') id: string,
    @Body() addMemberDto: AddMemberDto,
    @GetUser() user: User,
  ) {
    addMemberDto.instanceId = id;
    if ((await this.instanceService.getRole(id, user.id)) !== roles.MANAGER) {
      throw new UnauthorizedException(
        'Not authorized: Not a Manager of instance',
      );
    }
    return this.instanceService.addMember(user.id, addMemberDto);
  }

  @Post(':id/members/email')
  @ApiOperation({ summary: 'Add a member to an instance by email' })
  @ApiBody({ type: AddMemberByEmailDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized.',
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async addMemberByEmail(
    @Param('id') instanceId: string,
    @Body() addMemberByEmailDto: AddMemberByEmailDto,
    @GetUser() user: User,
  ) {
    if (
      (await this.instanceService.getRole(instanceId, user.id)) !==
      roles.MANAGER
    ) {
      throw new UnauthorizedException(
        'Not authorized: Not a manager of instance',
      );
    }
    return this.instanceService.addMemberByEmail(
      user.id,
      addMemberByEmailDto.email,
      instanceId,
      addMemberByEmailDto.role,
    );
  }
}
