import { IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { PRIORITIES } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  lead?: string;

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
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  lead?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}
