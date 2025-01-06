import { Table, Model, Column, DataType, PrimaryKey, ForeignKey } from "sequelize-typescript";

@Table({
  tableName: 'senstivewords',
  timestamps: true
})
export class SenstiveWordsModel extends Model {
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

export default SenstiveWordsModel;