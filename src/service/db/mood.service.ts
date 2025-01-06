import MoodModel from "@/db/models/Mood.model";
import { Op } from "sequelize";

export type Mood = {
  moodId?: bigint;
  userId: string;
  moodGrade: number;
  noteTitle?: string;
  noteDetail?: String,
}

class MoodService {
  // 插入一条mood记录
  static async createMoodeRecord(mood: Mood) {
    return await MoodModel.create({
      id: mood.moodId,
      userId: String(mood.userId),
      moodGrade: Number(mood.moodGrade)
    })
  }

  static async getAllMoodRecordListByUserId(userId: string) {
    return await MoodModel.findAll({
      where: {
        userId: userId
      },
    });
  }

  static async getByMoodId(moodId: bigint) {
    return await MoodModel.findOne({
      where: {
        id: moodId
      }
    });
  }

  static async updateMoodRecord(newMood: Mood) {
    const { moodId } = newMood;
    return await MoodModel.update(
      {
        moodGrade: newMood.moodGrade,
        noteTitle: newMood.noteTitle,
        noteDetail: newMood.noteDetail,
      },
      {
        where: {
          id: moodId
        }
      }
    );
  }

  static async deleteMoodRecord(moodId: bigint) {
    return await MoodModel.destroy({
      where: {
        id: moodId
      }
    });
  }

  static async getMoodRecordListByUserId(userIds: string[], dateTime?: string) {
    // 构建查询条件
    const whereCondition: any = { userId: userIds };
    if (dateTime) {
      // 将日期转换为开始和结束时间
      const startOfDay = new Date(`${dateTime}T00:00:00`);
      const endOfDay = new Date(`${dateTime}T23:59:59`);
      // 添加时间范围条件
      whereCondition.createAt = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }
    // 执行查询
    return await MoodModel.findAll({
      where: whereCondition,
    });
  }
}

export default MoodService;