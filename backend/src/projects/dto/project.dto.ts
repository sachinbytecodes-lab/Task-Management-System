import { IsArray, IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { PRIORITIES, STATUSES } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  lead?: string;

  @IsOptional()
  @IsArray()
  members?: string[];

  @IsOptional()
  @IsMongoId()
  reporter?: string;

  @IsOptional()
  @IsArray()
  teams?: string[];

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  lead?: string;

  @IsOptional()
  @IsArray()
  members?: string[];

  @IsOptional()
  @IsMongoId()
  reporter?: string;

  @IsOptional()
  @IsArray()
  teams?: string[];

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;
}
