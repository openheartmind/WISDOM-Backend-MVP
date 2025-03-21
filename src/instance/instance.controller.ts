import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { CreateInstanceDto, ExtendedCreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { User } from 'src/database/schema';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {
  }

  @Post()
  @ApiOperation({ summary: 'Create a new instance' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiBody({ type:CreateInstanceDto })
  @ApiBearerAuth()
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  create(@Body() createInstanceDto: CreateInstanceDto, @GetUser() user: User) {
    let instance: ExtendedCreateInstanceDto
    instance = createInstanceDto
    instance.createdBy = user.authId
    return this.instanceService.create(createInstanceDto, user)
  }

  @Get()
  @ApiOperation({ summary: 'List all instances viewable by user' })
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  findAll() {
    return this.instanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Display instance by id' })
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.instanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update instance by id' })
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
  ) {
    return this.instanceService.update(id, updateInstanceDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete instance by id' })
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.instanceService.remove(id);
  }

  @Post(':id/members')
  addMember(@Body() addMemberDto: AddMemberDto, @GetUser() user: User){
    return this.instanceService.addMember(addMemberDto)
  }
}
