import { benchmark } from './registry';
import { runModified, runOriginal } from './functions';

benchmark('modified', runModified);
benchmark('original', runOriginal);
