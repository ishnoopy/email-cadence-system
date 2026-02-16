import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CadenceStep } from 'shared-types';

class CadenceStepDto implements CadenceStep {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: 'SEND_EMAIL' | 'WAIT';

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  body?: string;

  @IsNumber()
  @IsOptional()
  seconds?: number;
}

export class CreateEnrollmentDto {
  @IsString()
  @IsNotEmpty()
  cadenceId: string;

  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;
}

export class UpdateEnrollmentCadenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CadenceStepDto)
  steps: CadenceStepDto[];
}
