import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@Req() req: Request) {
    return this.usersService.findById((req.user as any).userId);
  }

  @Patch('me')
  updateMe(@Req() req: Request, @Body() dto: UpdateUserDto) {
    return this.usersService.update((req.user as any).userId, dto);
  }

  @Get()
  all() {
    return this.usersService.findAll();
  }
}
