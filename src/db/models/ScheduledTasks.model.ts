import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import RecommendationRules from './RecommendationRules.model';

/**
 * 任务调度表
 * 表名：ScheduledTasks
 */
@Table({
  tableName: 'ScheduledTasks',
  timestamps: true,
})
export class ScheduledTasks extends Model {
  @Column(
    {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    })
  id!: number;

  @ForeignKey(() => RecommendationRules)
  @Column(
    {
      type: DataType.INTEGER,
      allowNull: false,
    })
  ruleId!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledTime!: Date;

  @Column(
    {
      type: DataType.ENUM('pending', 'running', 'completed', 'failed'),
      allowNull: false,
    })
  status!: string;

  @Column(
    {
      type: DataType.DATE,
      allowNull: false,
    })
  createdAt!: Date;

  @Column(
    {
      type: DataType.DATE,
      allowNull: false,
    })
  updatedAt!: Date;
}

export default ScheduledTasks;