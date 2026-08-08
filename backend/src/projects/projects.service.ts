import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private model: Model<ProjectDocument>) {}

  findAll() {
    return this.model.find().populate('lead').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const project = await this.model.findById(id).populate('lead').exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(dto: CreateProjectDto) {
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateProjectDto) {
    const project = await this.model.findByIdAndUpdate(id, dto, { new: true }).populate('lead').exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(id: string) {
    const res = await this.model.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException('Project not found');
    return { success: true };
  }
}
