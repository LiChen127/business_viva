import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';



@Table({
  tableName: 'Users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: () => uuidv4(), // 动态生成 UUID
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  username!: string;


  @Column({
    type: DataType.STRING,
    allowNull: true, // 明确允许为空
  })
  nickname!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash!: string;

  @Column({
    type: DataType.ENUM('admin', 'user', 'superAdmin'),
    allowNull: false,
    defaultValue: 'user',
  })
  role!: 'admin' | 'user' | 'superAdmin';

  @Column({
    type: DataType.STRING,
    allowNull: true, // 明确允许为空
  })
  profilePicture!: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: true, // 明确允许为空
  })
  email!: string;
}

export default User;
