'use strict';
import sensitivewordsModel from "@/db/models/Sensitive.model";
import { Op } from "sequelize";

class SensitiveSerivce {
  static async createWord(word: string) {
    return await sensitivewordsModel.create({ word });
  }

  static async getWordList(page?: number, pageSize?: number, search?: string) {
    let result: any;
    const offset = page ? (Number(page) - 1) * Number(pageSize) : 0;
    const limit = pageSize ? Number(pageSize) : undefined;
    if (!page && !pageSize && !search) {
      result = await sensitivewordsModel.findAll();
    }
    if (!search && page && pageSize) {
      result = await sensitivewordsModel.findAndCountAll({ offset, limit });
    }
    if (search && page && pageSize) {
      result = await sensitivewordsModel.findAndCountAll({
        where: {
          [Op.or]: { word: search }
        },
        offset,
        limit
      });
    }
    if (search && (!page || !pageSize)) {
      result = await sensitivewordsModel.findAll({
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
    return await sensitivewordsModel.destroy({
      where: {
        id: id
      }
    });
  }

  static async getAllWords() {
    return await sensitivewordsModel.findAll();
  }

  static async getWordById(id: bigint) {
    return await sensitivewordsModel.findOne({ where: { id } });
  }
}

export default SensitiveSerivce;