'use strict';
// import SenstiveWordsModel from "@/db/models/SenstiveWords.model";
import SenstiveWordsModel from "@/db/models/SenstiveWords.model";
import { Op } from "sequelize";

class SensitiveSerivce {
  static async createWord(word: string) {
    return await SenstiveWordsModel.create({ word });
  }

  static async getWordList(page?: number, pageSize?: number, search?: string) {
    let result: any;
    const offset = page ? (Number(page) - 1) * Number(pageSize) : 0;
    const limit = pageSize ? Number(pageSize) : undefined;
    if (!page && !pageSize && !search) {
      result = await SenstiveWordsModel.findAll();
    }
    if (!search && page && pageSize) {
      result = await SenstiveWordsModel.findAndCountAll({ offset, limit });
    }
    if (search && page && pageSize) {
      result = await SenstiveWordsModel.findAndCountAll({
        where: {
          [Op.or]: { word: search }
        },
        offset,
        limit
      });
    }
    if (search && (!page || !pageSize)) {
      result = await SenstiveWordsModel.findAll({
        where: {
          [Op.or]: { word: search }
        }
      });
    }
    return Object.keys(result).includes('count') ? {
      list: result.rows,
      total: result.count
    } : result;
  }

  static async removeWordInDb(id: bigint) {
    return await SenstiveWordsModel.destroy({
      where: {
        id: id
      }
    });
  }

  static async getAllWords() {
    return await SenstiveWordsModel.findAll();
  }

  static async getWordById(id: bigint) {
    return await SenstiveWordsModel.findOne({ where: { id } });
  }
}

export default SensitiveSerivce;