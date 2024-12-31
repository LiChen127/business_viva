import { Table, Model, Column, DataType, ForeignKey } from "sequelize-typescript";
import User from "./User.model";
import Posts from "./Posts.model";


@Table({
  tableName: 'comments',
  timestamps: true
})
export class Comments extends Model {
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
    unique: true,
    field: 'userId'
  })
  userId!: string;

  @ForeignKey(() => Posts)
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    unique: true,
    field: 'postId'
  })
  postId!: bigint;

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

export default Comments;
