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
  static createUser(user: User) {
    return UserModel.create(user as any);
  }

  /**
   * 获取单个用户
   * @param userId 
   */
  static getUserById(userId: string) {
    return UserModel.findOne({ where: { id: userId } });
  }

  /**
   * 获取用户列表
   */
  static async getUsers(page?: number, pageSize?: number, search?: string): Promise<UserListResponse | User[]> {
    let result: any;
    // 如果什么都没有传
    if (!page && !pageSize && !search) {
      // return await UserModel.findAll();
      result = await UserModel.findAll();
    }
    // 如果传了page和pageSize
    if (page && pageSize) {
      result = await UserModel.findAndCountAll({ offset: page, limit: pageSize });
    }
    // 如果都传了
    if (search && page && pageSize) {
      result = await UserModel.findAndCountAll({ where: { name: { [Op.like]: `%${search}%` } }, offset: page, limit: pageSize });
    }

    if (search && (!page || !pageSize)) {
      result = await UserModel.findAll({ where: { name: { [Op.like]: `%${search}%` } } });
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
  static deleteUser(userId: string) {
    return UserModel.destroy({ where: { id: userId } });
  }

  /**
   * 更新用户
   * @param userId 
   * @param user 
   */
  static updateUserOneField(userId: string, filed: string, value: any) {
    return UserModel.update({ [filed]: value }, { where: { id: userId } });
  }

  static updateUser(userId: string, user: User) {
    return UserModel.update(user, { where: { id: userId } });
  }
}

// 导出各个服务
// const userService = new UserService();
export default UserService;
