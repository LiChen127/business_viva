import { Table, Column, Model, DataType, BelongsTo, ForeignKey, AutoIncrement } from 'sequelize-typescript';
import User from './User.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'Moods', timestamps: true })
export class MoodModel extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: bigint;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'userId'  // 移除 unique: true
  })
  userId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  moodGrade!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true
  })
  noteTitle: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  noteDetail: string;
}


export default MoodModel;