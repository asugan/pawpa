import { db } from '../../db';

export abstract class BaseService {
  protected db = db;
}