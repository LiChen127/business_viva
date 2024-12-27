import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import User from './User.model';
import { v4 as uuidv4 } from 'uuid';
/**
 * 管理平台操作日志
 * 表名：ActionsLog
 */
@Table({
  tableName: 'ActionsLog',
  timestamps: true,
})
export class ActionsLogs extends Model {
  @Column(
    {
      type: DataType.UUID,
      defaultValue: () => uuidv4(), // 动态生成 UUID
      primaryKey: true,
    })
  id!: string;

  @ForeignKey(() => User)
  @Column(
    {
      type: DataType.UUID,
      allowNull: false,
    })
  userId!: string;

  @Column(
    {
      type: DataType.DATE,
      allowNull: false,
    })
  timeStamp!: Date;

  @Column(
    {
      type: DataType.ENUM('login',
        'change',
        'profile',
        'recommendation',
        'admin',
      ),
      allowNull: false,
    })
  actionType!: string;

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

export default ActionsLogs;