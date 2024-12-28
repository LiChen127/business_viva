/**
 * 用户表Mysql服务
 */

import UserModel, { User } from "@/db/models/User.model";
import { Op } from "sequelize";

interface UserListResponse {
  list: User[];
  total: number;
}

class UserService {
  /**
   * 创建用户
   * @param user 
   */
  static async createUser(user: Partial<User>) {
    return await UserModel.create(user);
  }

  /**
   * 获取单个用户
   * @param userId 
   */
  static async getUserById(userId: string) {
    return await UserModel.findOne({ where: { id: userId } });
  }

  /**
   * 获取用户列表
   */
  static async getUserList(page?: number, pageSize?: number, search?: string): Promise<UserListResponse | User[]> {
    let result: any;
    const offset = page ? (Number(page) - 1) * Number(pageSize) : 0;
    const limit = pageSize ? Number(pageSize) : undefined;

    // 如果什么都没有传
    if (!page && !pageSize && !search) {
      result = await UserModel.findAll();
    }
    // 如果传了page和pageSize
    if (!search && page && pageSize) {
      result = await UserModel.findAndCountAll({ offset, limit });
    }
    // 如果都传了
    if (search && page && pageSize) {
      result = await UserModel.findAndCountAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { nickname: { [Op.like]: `%${search}%` } }
          ]
        },
        offset,
        limit
      });
    }

    if (search && (!page || !pageSize)) {
      result = await UserModel.findAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${search}%` } },
            { nickname: { [Op.like]: `%${search}%` } }
          ]
        }
      });
    }
    return Object.keys(result).includes('count') ? {
      list: result.rows,
      total: result.count
    } : result;
  }

  /**
   * 删除用户
   * @param userId 
   */
  static async deleteUser(userId: string) {
    return await UserModel.destroy({ where: { id: userId } });
  }

  /**
   * 更新用户
   * @param userId 
   * @param user 
   */
  static async updateUserOneField(userId: string, filed: string, value: any) {
    return await UserModel.update({ [filed]: value }, { where: { id: userId } });
  }

  static async updateUser(userId: string, user: Partial<User>) {
    return await UserModel.update(user, { where: { id: userId } });
  }

  /**
   * 获取用户名
   * @param username 
   */
  static async getUserByUsername(username: string) {
    return await UserModel.findOne({ where: { username } });
  }
}

// 修改导���方式
export const {
  createUser,
  getUserById,
  getUserList,
  deleteUser,
  updateUserOneField,
  updateUser,
  getUserByUsername,
} = UserService;

export default UserService;
