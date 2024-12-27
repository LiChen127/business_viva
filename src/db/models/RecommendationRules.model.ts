import { Table, Column, Model, DataType } from 'sequelize-typescript';
/**
 * 推荐系统元数据
 * 表名：RecommendationRules
 */
@Table({
  tableName: 'RecommendationRules',
  timestamps: true,
})
export class RecommendationRules extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @Column({ type: DataType.STRING })
  ruleName!: string;

  @Column({ type: DataType.TEXT })
  description!: string;
}

export default RecommendationRules;