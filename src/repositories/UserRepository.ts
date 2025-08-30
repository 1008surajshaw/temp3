import { IUserRepository } from '../interfaces/IUserRepository';
import { User } from '../models/User';
import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findAll(offset: number, limit: number): Promise<{ users: User[]; total: number }> {
    const { count, rows } = await this.model.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
    });
    return { users: rows, total: count };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.model.findOne({ where: { email } as any });
  }
}