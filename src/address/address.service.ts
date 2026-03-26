import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

const MAX_ADDRESSES_PER_USER = 10;

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const count = await this.addressRepo.count({ where: { userId } });
    if (count >= MAX_ADDRESSES_PER_USER) {
      throw new ForbiddenException(`Maximum of ${MAX_ADDRESSES_PER_USER} addresses allowed`);
    }

    if (dto.isDefault) {
      await this.clearDefault(userId, dto.type);
    }

    const address = this.addressRepo.create({ ...dto, userId });
    return this.addressRepo.save(address);
  }

  findAll(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({ where: { id, userId } });
    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, userId: string, dto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (dto.isDefault) {
      await this.clearDefault(userId, dto.type ?? address.type);
    }

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);
    await this.addressRepo.remove(address);
  }

  async setDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);
    await this.clearDefault(userId, address.type);
    address.isDefault = true;
    return this.addressRepo.save(address);
  }

  private async clearDefault(userId: string, type: Address['type']): Promise<void> {
    await this.addressRepo.update({ userId, type, isDefault: true }, { isDefault: false });
  }
}
