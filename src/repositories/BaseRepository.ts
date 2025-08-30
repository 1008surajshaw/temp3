import { Model, ModelCtor, WhereOptions } from 'sequelize';

export class BaseRepository<T extends Model> {
  protected model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  async findById(id: number): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data as any);
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    const whereClause: WhereOptions = { id } as any;
    const [affectedRows, updatedRecords] = await this.model.update(
      data as any,
      { where: whereClause, returning: true }
    );
    return affectedRows > 0 ? updatedRecords[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const whereClause: WhereOptions = { id } as any;
    const deletedRows = await this.model.destroy({ where: whereClause });
    return deletedRows > 0;
  }
}