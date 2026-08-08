import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

const POPULATE_FIELDS = ['lead', 'members', 'reporter'];

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private model: Model<ProjectDocument>) {}

  findAll(ownerId: string) {
    let query = this.model.find({ owner: ownerId }).sort({ createdAt: -1 });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    return query.exec();
  }

  async findOne(ownerId: string, id: string) {
    let query = this.model.findOne({ _id: id, owner: ownerId });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    const project = await query.exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(ownerId: string, dto: CreateProjectDto) {
    return this.model.create({ ...dto, owner: ownerId, reporter: dto.reporter ?? ownerId });
  }

  async update(ownerId: string, id: string, dto: UpdateProjectDto) {
    let query = this.model.findOneAndUpdate({ _id: id, owner: ownerId }, dto, { new: true });
    for (const f of POPULATE_FIELDS) query = query.populate(f);
    const project = await query.exec();
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async remove(ownerId: string, id: string) {
    const res = await this.model.findOneAndDelete({ _id: id, owner: ownerId }).exec();
    if (!res) throw new NotFoundException('Project not found');
    return { success: true };
  }
}
