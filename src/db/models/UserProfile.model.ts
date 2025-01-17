import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import User from './User.model';
import { v4 as uuidv4 } from 'uuid';

@Table({ tableName: 'UserProfiles', timestamps: true })
export class UserProfile extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: () => uuidv4(), // 动态生成 UUID
    primaryKey: true,
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'userId'
  })
  userId!: string;

  @Column({ type: DataType.ENUM('male', 'female', 'other') })
  gender!: string;

  @Column({ type: DataType.INTEGER })
  age!: number;

  @Column({ type: DataType.STRING })
  location!: string;

  @Column({ type: DataType.TEXT })
  introduction!: string;

  @Column({ type: DataType.STRING })
  moodStatus!: string;

  @Column({ type: DataType.TINYINT, defaultValue: 1, })
  level!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0, })
  experiencePoints!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isBanned: boolean;

}

export default UserProfile;