import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { User } from '@services/auth/decorators/user.decorator';
import { DraftService } from '@entities/draft/service/draft.service';
import { CreateDraftDto } from '@entities/draft/dto/createDraft.dto';

@Controller('drafts')
export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  @Get('/')
  getDrafts(@User() user) {
    return this.draftService.getAll(user);
  }

  @Post('/')
  createDraft(@Body() createDraftDto: CreateDraftDto, @User() user) {
    return this.draftService.create(createDraftDto, user);
  }

  @Delete('/:id')
  async deleteDraft(@Param('id') id: string, @User() user) {
    await this.draftService.delete(id);
    return this.draftService.getAll(user);
  }
}
