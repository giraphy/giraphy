import { createRdbmsSchema } from './rdbms-schema/main';

createRdbmsSchema().then(() => process.exit(0));
