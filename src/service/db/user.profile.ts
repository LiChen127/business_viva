'use strict';
import UserProfileModel, { UserProfile as UserProfileType } from "@/db/models/UserProfile.model";

export class UserProfileService {
  static async setUserProfile(userId: string, userProfile: Partial<UserProfileType>) {
    return await UserProfileModel.update(userProfile, { where: { userId } });
  }

  static async getUserProfile(userId: string) {
    return await UserProfileModel.findOne({ where: { userId } });
  }

  static async updateUserProfile(userId: string, userProfile: Partial<UserProfileType>) {
    return await UserProfileModel.update(userProfile, { where: { userId } });
  }

  static async deleteUserProfile(userId: string) {
    return await UserProfileModel.destroy({ where: { userId } });
  }
}