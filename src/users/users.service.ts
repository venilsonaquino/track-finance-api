import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserModel } from './models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserCreatedEvent } from './events/user-created.event';
import { generateShortHash } from 'src/common/utils/generate-short-hash';
import { LoggerService } from '../config/logging/logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel)
    private readonly userModel: typeof UserModel,
    private eventEmitter: EventEmitter2,
    @Inject(LoggerService)
    private readonly logger: LoggerService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(
      `Creating a user with email: ${createUserDto.email}`,
      'UsersService',
    );

    const { email, password } = createUserDto;

    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      this.logger.warn(
        `Attempt to create user with existing email: ${email}`,
        'UsersService',
      );
      throw new ConflictException('E-mail is already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    createUserDto.password = hashedPassword;

    const user = new UserEntity({
      email: createUserDto.email,
      fullName: createUserDto.fullName,
      password: hashedPassword,
      emailVerificationToken: generateShortHash(),
    });

    const newUser = await this.userModel.create(user);
    this.logger.log(
      `User created successfully. ID: ${newUser.id}`,
      'UsersService',
    );

    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(newUser.id, newUser.email, newUser.fullName),
    );

    return newUser;
  }

  async findAll() {
    this.logger.log('Fetching all users', 'UsersService');
    return await this.userModel.findAll();
  }

  async findOne(id: string) {
    this.logger.log(`Fetching user with ID: ${id}`, 'UsersService');
    const user = await this.userModel.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`User not found. ID: ${id}`, 'UsersService');
      throw new NotFoundException();
    }

    return user;
  }

  async findEmail(email: string) {
    this.logger.log(`Fetching user by email: ${email}`, 'UsersService');
    return await this.userModel.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`, 'UsersService');

    const { password } = updateUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    updateUserDto.password = hashedPassword;

    const [affectedCount, updated] = await this.userModel.update(
      updateUserDto,
      {
        where: { id },
        returning: true,
      },
    );

    if (affectedCount == 0 && updated.length == 0) {
      this.logger.warn(
        `Attempt to update non-existing user. ID: ${id}`,
        'UsersService',
      );
      throw new NotFoundException(`User with id ${id} not found`);
    }

    this.logger.log(`User updated successfully. ID: ${id}`, 'UsersService');
    return updated[0];
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing user with ID: ${id}`, 'UsersService');
    const deletedCount = await this.userModel.destroy({ where: { id } });

    if (deletedCount === 0) {
      this.logger.warn(
        `Attempt to remove non-existing user. ID: ${id}`,
        'UsersService',
      );
      throw new NotFoundException(`User with id ${id} not found`);
    }
    this.logger.log(`User removed successfully. ID: ${id}`, 'UsersService');
    return;
  }

  async updateRefreshToken(id: string, refreshToken: string) {
    this.logger.log(
      `Updating refresh token for user ID: ${id}`,
      'UsersService',
    );
    await this.userModel.update({ refreshToken }, { where: { id } });
  }

  async findByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
    this.logger.log('Fetching user by refresh token', 'UsersService');
    const user = await this.userModel.findOne({ where: { refreshToken } });
    return user;
  }
}
