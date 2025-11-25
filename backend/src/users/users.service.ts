import {
  ConflictException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    } catch {
      throw new InternalServerErrorException(
        'Erro ao buscar usuário por email',
      );
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      const { email, password } = createUserDto;

      if (!email) {
        throw new BadRequestException('O email é obrigatório.');
      }

      if (!password) {
        throw new BadRequestException('A senha é obrigatória.');
      }

      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Já existe um usuário com este email.');
      }

      const createdUser = new this.userModel(createUserDto);
      return createdUser.save();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      return user;
    } catch {
      throw new InternalServerErrorException('Erro ao buscar usuário por ID');
    }
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    try {
      const user = await this.userModel.findById(id).exec();

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      if (updateUserDto.email) {
        const existingUser = await this.findByEmail(updateUserDto.email);

        if (existingUser && existingUser.id !== id) {
          throw new ConflictException(
            'Já existe outro usuário com este email.',
          );
        }
      }

      return await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao atualizar usuário');
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();

      if (!result) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Erro ao remover usuário');
    }
  }
}
