import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm';

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id

  @column()
  public fullName;

  @column.dateTime({ autoCreate: true })
  public createdAt

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt
}
