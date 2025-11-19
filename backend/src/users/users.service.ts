import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findOne({ email }).exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por email',
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return createdUser.save();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new InternalServerErrorException('Erro ao buscar usuário por ID');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    try {
      return await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new InternalServerErrorException('Erro ao atualizar usuário');
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      return result;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new InternalServerErrorException('Erro ao remover usuário');
    }
  }
}
