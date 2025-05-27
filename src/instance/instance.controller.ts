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
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.instanceService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
    @GetUser() user: User,
  ) {
    return this.instanceService.update(id, updateInstanceDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete instance by id' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.instanceService.remove(id, user.id);
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
    return this.instanceService.addMember(user.id, addMemberDto);
  }
}
