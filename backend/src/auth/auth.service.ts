// auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Role } from '../enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    // Check if username already exists
    const existingUser = await this.userRepository.findOne({
      where: { username: registerDto.username },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'Username already exists',
      };
    }

    // Validate password match
    if (registerDto.password !== registerDto.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      username: registerDto.username,
      password: hashedPassword,
      role: registerDto.role || Role.LAPANGAN,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      return {
          success: true,
          message: 'Registration successful',
          user: {
            id: savedUser.id,
            username: savedUser.username,
            role: savedUser.role,
          },
      };
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred, please try again',
      };
    }
}



async login(loginDto: LoginDto) {
  const user = await this.userRepository.findOne({
    where: { username: loginDto.username },


  });


  if (!user) {
    throw new UnauthorizedException('Invalid credentials');

  }

  const isPasswordValid = await bcrypt.compare(
    loginDto.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: user.id, username: user.username, role: user.role };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    }),
    this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    }),
  ]);

  // Save refresh token to database
  await this.userRepository.update(user.id, {
    refreshToken: await bcrypt.hash(refreshToken, 10),
  });

  return {
    success: true, // Pastikan ada indikator success
    message: 'Login successful', // Pesan sukses
    accessToken,
    refreshToken,
    user: { // Hanya kembalikan data user tanpa password
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}


  // async refreshToken(refreshToken: string) {
  //   try {
  //     const payload = await this.jwtService.verifyAsync(refreshToken, {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //     });

  //     const user = await this.userRepository.findOne({
  //       where: { id: payload.sub }
  //     });

  //     if (!user || !user.refreshToken) {
  //       throw new UnauthorizedException();
  //     }

  //     const isRefreshTokenValid = await bcrypt.compare(
  //       refreshToken,
  //       user.refreshToken,
  //     );

  //     if (!isRefreshTokenValid) {
  //       throw new UnauthorizedException();
  //     }

  //     const newPayload = { sub: user.id, username: user.username, role: user.role };

  //     const [newAccessToken, newRefreshToken] = await Promise.all([
  //       this.jwtService.signAsync(newPayload, {
  //         secret: process.env.JWT_SECRET,
  //         expiresIn: '15m',
  //       }),
  //       this.jwtService.signAsync(newPayload, {
  //         secret: process.env.JWT_REFRESH_SECRET,
  //         expiresIn: '7d',
  //       }),
  //     ]);

  //     // Update refresh token in database
  //     await this.userRepository.update(user.id, {
  //       refreshToken: await bcrypt.hash(newRefreshToken, 10),
  //     });

  //     return {
  //       accessToken: newAccessToken,
  //       refreshToken: newRefreshToken,
  //     };
  //   } catch {
  //     throw new UnauthorizedException();
  //   }
  // }
  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const isRefreshTokenValid = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );

      if (!isRefreshTokenValid) {
        throw new UnauthorizedException();
      }

      // Kembalikan hanya access token baru
      const newAccessToken = await this.jwtService.signAsync(
        { sub: user.id, username: user.username, role: user.role },
        { secret: process.env.JWT_SECRET, expiresIn: '15m' },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: number) {
    await this.userRepository.update(userId, {
      refreshToken: null,
    });
    return { message: 'Logged out successfully' };
  }

  async validateToken(user: any) {
    return {
      id: user.sub,
      username: user.username,
      role: user.role,
    };
  }
}
