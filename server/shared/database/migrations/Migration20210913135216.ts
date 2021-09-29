import { Migration } from '@mikro-orm/migrations';

export class Migration20210913135216 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    const setTimestamps = table => {
      table.timestamp('created_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table.timestamp('updated_at', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now());
      table.timestamp('deleted_at', { useTz: true });
    };

    const createUserTable = knex.schema.createTable('user', table => {
      const USER_ROLES = ['ADMIN', 'USER'];
      table.increments('id');
      table.enum('role', USER_ROLES);
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('email').notNullable().unique();
      table.string('password').nullable();
      setTimestamps(table);
    });

    this.addSql(createUserTable.toQuery());
  }

  async down(): Promise<void> {
    const knex = this.getKnex();
    this.addSql(knex.schema.dropTable('user').toQuery());
  }
}