'use strict';
import UserProfileModel, { UserProfile as UserProfileType } from "@/db/models/UserProfile.model";
import { Op } from "sequelize";

export class UserProfileService {
  static async setUserProfile(userId: string, userProfile: Partial<UserProfileType>) {
    return await UserProfileModel.create({ ...userProfile, userId });
  }

  static async getUserProfileByUserId(userId: string) {
    // @todo: 拆成两种ID
    return await UserProfileModel.findOne({ where: { userId: userId } });
  }

  static async updateUserProfile(userId: string, userProfile: Partial<UserProfileType>) {
    return await UserProfileModel.update(userProfile, { where: { userId } });
  }

  static async deleteUserProfile(userId: string) {
    return await UserProfileModel.destroy({ where: { userId } });
  }

  static async getAllUserProfile() {
    return await UserProfileModel.findAll();
  }

  static async getUserProfileListByUserIds(userIds: string[]) {
    return await UserProfileModel.findAll({
      where: {
        userId: userIds
      }
    });
  }

}