import MoodModel from "@/db/models/Mood.model";

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
}

export default MoodService;