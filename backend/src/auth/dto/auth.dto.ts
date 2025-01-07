import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { Role } from '../../enums/role.enum';

export class LoginDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
        message: 'Password too weak - minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter and 1 number'
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    @Match('password', { message: 'Passwords do not match' })
    confirmPassword: string;

    @IsNotEmpty()
    @IsEnum(Role)
    role: Role;
}