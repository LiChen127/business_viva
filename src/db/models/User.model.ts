import { Table, Model, Column, DataType, PrimaryKey } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: () => uuidv4(),
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
    allowNull: true,
  })
  nickname!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  passwordHash!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  role!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profilePicture?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
  })
  email?: string;
}

export default User;
