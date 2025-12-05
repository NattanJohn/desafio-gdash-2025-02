import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserSchema } from './schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail =
      this.configService.get<string>('DEFAULT_ADMIN_EMAIL') ||
      'admin@example.com';
    const adminPassword =
      this.configService.get<string>('DEFAULT_ADMIN_PASSWORD') || '123456';

    const existingAdmin = await this.usersService.findByEmail(adminEmail);

    if (!existingAdmin) {
      await this.usersService.create({
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
      console.log(
        `[SEED] Usuário administrador padrão (${adminEmail}) criado com sucesso.`,
      );
    }
  }
}
