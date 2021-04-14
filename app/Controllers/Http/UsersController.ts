import User from 'App/Models/User';

export default class UsersController {
  public async index() {
    return User.all();
  }

  public async store(ctx) {
    const data = ctx.request.only(['fullName']);
    return User.create(data);
  }

  public async show(ctx) {
    const id = ctx.request.param('id');
    return User.find(id);
  }

  public async update() {
  }

  public async destroy() {
  }
}
