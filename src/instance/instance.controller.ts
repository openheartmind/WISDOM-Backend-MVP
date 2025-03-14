import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { CreateInstanceDto, ExtendedCreateInstanceDto } from './dto/create-instance.dto';
import { UpdateInstanceDto } from './dto/update-instance.dto';
import { User } from 'src/database/schema';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('instance')
export class InstanceController {
  constructor(private readonly instanceService: InstanceService) {
  }

  @Post()
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  create(@Body() createInstanceDto: CreateInstanceDto, @GetUser() user: User) {
    let instance: ExtendedCreateInstanceDto
    instance = createInstanceDto
    instance.createdBy = user.authId
    return this.instanceService.create(createInstanceDto, user)
  }

  @Get()
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  findAll() {
    return this.instanceService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.instanceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateInstanceDto: UpdateInstanceDto,
  ) {
    return this.instanceService.update(id, updateInstanceDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard) @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.instanceService.remove(id);
  }
}
