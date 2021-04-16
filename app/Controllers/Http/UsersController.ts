import User from 'App/Models/User';
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext';

export default class UsersController {
  public async index() {
    return User.all();
  }

  public async store(ctx: HttpContextContract) {
    const data = ctx.request.only(['fullName']);
    return User.create(data);
  }

  public async show(ctx: HttpContextContract) {
    const id = ctx.request.param('id');
    return User.findOrFail(id);
  }

  public async update(ctx: HttpContextContract) {
    const id = ctx.request.param('id');
    const { fullName } = ctx.request.only(['fullName']);
    const user = await User.findOrFail(id);
    user.fullName = fullName;
    return user.save();
  }

  public async destroy(ctx: HttpContextContract) {
    const id = ctx.request.param('id');
    const user = await User.findOrFail(id);
    return user.delete();
  }
}
