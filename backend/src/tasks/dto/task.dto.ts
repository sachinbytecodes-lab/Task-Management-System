import { IsArray, IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
import { PRIORITIES, STATUSES } from '../schemas/task.schema';

export class CreateTaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  member?: string;

  @IsOptional()
  @IsMongoId()
  reporter?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsArray()
  teams?: string[];

  @IsOptional()
  @IsMongoId()
  project?: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(STATUSES as unknown as string[])
  status?: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  member?: string;

  @IsOptional()
  @IsMongoId()
  reporter?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  labels?: string[];

  @IsOptional()
  @IsArray()
  teams?: string[];

  @IsOptional()
  @IsMongoId()
  project?: string;
}

export class AddSubtaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsMongoId()
  member?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;
}

export class AddCommentDto {
  @IsString()
  @MaxLength(2000)
  text: string;
}
