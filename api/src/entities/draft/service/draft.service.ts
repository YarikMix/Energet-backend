import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from '@entities/user/models/user.entity';
import { Draft } from '@entities/draft/models/draft.entity';

@Injectable()
export class DraftService {
  constructor(
    @InjectRepository(Draft)
    private readonly draftRepository: Repository<Draft>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getAll(user: User) {
    return await this.draftRepository.find({
      relations: ['owner'],
      where: {
        owner: { id: user.id },
      },
      select: {
        owner: {
          id: true,
        },
      },
    } as FindOneOptions<Draft>);
  }

  public async create(dto, owner) {
    const newDraft = this.draftRepository.create();
    newDraft.owner = owner;
    newDraft.coords = dto.coords;
    newDraft.consumption_type = dto.consumption_type;
    newDraft.consumption_value = dto.consumption_value;
    newDraft.energy_sources = dto.energy_sources;
    newDraft.energy_storages = dto.energy_storages;

    const savedDraft = await this.draftRepository.save(newDraft);
    delete savedDraft.owner;

    return {
      ...savedDraft,
      owner_id: owner.id,
    };
  }

  public async delete(id) {
    return await this.draftRepository.delete(id);
  }
}
