import { Body, Controller, Get, Post } from '@nestjs/common';
import { User } from '@services/auth/decorators/user.decorator';
import { DraftService } from '@entities/draft/service/draft.service';
import { CreateDraftDto } from '@entities/draft/dto/createDraft.dto';

@Controller('drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('/')
  getDrafts(@User() user) {
    return this.draftService.get(user.id);
  }

  @Post('/')
  createDraft(@Body() createDraftDto: CreateDraftDto, @User() user) {
    console.log('createDraft');
    return this.draftService.create(createDraftDto, user);
  }
}
