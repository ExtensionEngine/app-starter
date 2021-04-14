import User from 'App/Models/User';

export default class UsersController {
  public async index() {
    return User.all();
  }

  public async store({ request }) {
    const { requestBody } = request;
    return User.create(requestBody);
  }

  public async show({ request }) {
    const { id } = request.routeParams;
    return User.find(id);
  }

  public async update() {
  }

  public async destroy() {
  }
}
