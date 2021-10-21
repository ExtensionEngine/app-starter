import { Command } from 'commander';
import configure from './configure';
import main from '../main';
import provider from './provider';
import scripts from '../scripts';

const cli = new Command();
scripts.forEach(it => cli.addCommand(it));
run();

function run() {
  configure(provider, main);
  return cli.parseAsync(process.argv)
    .then(() => process.exit())
    .catch(error => {
      const { logger } = provider.container;
      logger.fatal(error);
      process.exit(1);
    });
}
