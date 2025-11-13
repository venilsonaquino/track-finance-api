import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserEntity } from 'src/users/entities/user.entity';
import { UserModel } from 'src/users/models/user.model';
import { ulid } from 'ulid';

@Table({
  tableName: 'files',
})
export class FileModel extends Model<FileModel> {
  @PrimaryKey
  @Column({
    type: DataType.STRING(26),
    unique: true,
    defaultValue: ulid,
  })
  id: string;

  @ForeignKey(() => UserModel)
  @Column({
    field: 'user_id',
    type: DataType.STRING(26),
    allowNull: false,
  })
  userId: string;

  @Column({
    field: 'file_name',
    type: DataType.STRING,
    allowNull: false,
  })
  fileName: string;

  @Column({
    field: 'upload_date',
    type: DataType.DATE,
    allowNull: false,
  })
  uploadDate: string;

  @Column({
    field: 'extension',
    type: DataType.STRING,
    allowNull: false,
  })
  extension: string;

  @BelongsTo(() => UserModel)
  user: UserEntity;
}
