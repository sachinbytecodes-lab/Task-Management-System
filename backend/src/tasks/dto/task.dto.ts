import { IsArray, IsBoolean, IsIn, IsMongoId, IsOptional, IsString, MaxLength } from 'class-validator';
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
  @IsString()
  member?: string; // empty string clears the assignee

  @IsOptional()
  @IsString()
  reporter?: string; // empty string clears the reporter

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
  @IsString()
  member?: string; // empty string clears the assignee

  @IsOptional()
  @IsString()
  reporter?: string; // empty string clears the reporter

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

  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @IsOptional()
  @IsArray()
  watchers?: string[];
}

export class AddSubtaskDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsIn(PRIORITIES as unknown as string[])
  priority?: string;

  @IsOptional()
  @IsString()
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

export class AddResourceDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsString()
  @MaxLength(2000)
  url: string;
}
