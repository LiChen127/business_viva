import { Table, Model, Column, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";

@Table({
  tableName: 'sensitivewords',
  timestamps: true
})
export class sensitivewordsModel extends Model {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: bigint;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  word!: string;
}

export default sensitivewordsModel;