
import { Injectable, isDevMode } from '@angular/core';
import { addRxPlugin, createRxDatabase, RxCollection, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { reportSchema } from '../models/report-schema';
import { v4 as uuidv4 } from 'uuid';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';


addRxPlugin(RxDBDevModePlugin);

const storage = wrappedValidateAjvStorage({
  storage: getRxStorageDexie()
});


@Injectable({
  providedIn: 'root'
})

export class RxdbService {
  private dbPromise: Promise<RxDatabase>;
  private collectionName = 'reports';

  constructor() {
    this.dbPromise = this.init();
  }

  private async init(): Promise<RxDatabase> {
    const db = await createRxDatabase({
      name: 'hospitaldb',
      storage,
      ignoreDuplicate: true,
      closeDuplicates: true
    });

    await db.addCollections({
      [this.collectionName]: {
        schema: reportSchema
      }
    });

    return db;
  }

  private async getCollection(): Promise<RxCollection> {
    const db = await this.dbPromise;
    return db[this.collectionName];
  }

  async saveReport(report: any): Promise<void> {
    let id = uuidv4();
    const collection = await this.getCollection();
    report._id = id;
    await collection.insert(report);
  }

  async updateReport(id: string, updatedReport: any): Promise<void> {
    const collection = await this.getCollection();
    const doc = await collection.findOne(id).exec();
    if (doc) {
      await doc.incrementalPatch(updatedReport);
    } else {
      throw new Error(`Report with ID ${id} not found`);
    }
  }

  async getReportById(id: string): Promise<any> {
    const collection = await this.getCollection();
    const doc = await collection.findOne(id).exec();
    return doc?.toJSON();
  }

  async getAllReports(): Promise<any[]> {
    const collection = await this.getCollection();
    const docs = await collection.find().exec();
    return docs.map(doc => doc.toJSON());
  }
}