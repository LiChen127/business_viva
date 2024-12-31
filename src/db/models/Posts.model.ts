import { Table, Model, Column, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";
import User from "./User.model";

@Table({
  tableName: 'posts',
  timestamps: true
})
export class Posts extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: bigint;


  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  title!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'userId'
  })
  userId!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  viewCount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  likeCount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  shareCount!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  commentCount!: number;
}

export default Posts;
