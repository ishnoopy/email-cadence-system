import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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

export class CreateCadenceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CadenceStepDto)
  steps: CadenceStepDto[];
}

export class UpdateCadenceDto {
  @IsString()
  name?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CadenceStepDto)
  steps?: CadenceStepDto[];
}
