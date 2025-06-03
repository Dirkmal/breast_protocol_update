import { RxDatabase, createRxDatabase } from 'rxdb';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';

import { Injectable } from '@angular/core';

import { registerRxDBPlugins } from './plugins';
import {
  reportAxillaryNodeSchema,
  reportAxillaryProcedureSchema,
  reportIhcSchema,
  reportInSituCarcinomaSchema,
  reportInitialDetailsSchema,
  reportInvasiveCarcinomaSchema,
  reportMarginSchema,
  reportOtherMarginsSchema,
  reportPathologicalStagingSchema,
  reportPathologistReportSchema,
  reportSchema,
  reportSpecimenDimensionsSchema,
  reportSpecimenTypeSchema,
} from './schemas';

registerRxDBPlugins(); // Register plugins once at service level

const storage = wrappedValidateAjvStorage({
  storage: getRxStorageLocalstorage(),
});

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private dbInstance: Promise<RxDatabase>;

  constructor() {
    this.dbInstance = this.init();
  }

  private async init(): Promise<RxDatabase> {
    const db = await createRxDatabase({
      name: 'reportdb',
      storage,
      multiInstance: true,
      eventReduce: true,
      closeDuplicates: true,
    });

    await db.addCollections({
      report_axillary_node: { schema: reportAxillaryNodeSchema },
      report_axillary_procedure: { schema: reportAxillaryProcedureSchema },
      report_ihc: { schema: reportIhcSchema },
      report_in_situ_carcinoma: { schema: reportInSituCarcinomaSchema },
      report_initial_details: { schema: reportInitialDetailsSchema },
      report_invasive_carcinoma: { schema: reportInvasiveCarcinomaSchema },
      report_margins: { schema: reportMarginSchema },
      report_other_margins: { schema: reportOtherMarginsSchema },
      report_pathological_staging: { schema: reportPathologicalStagingSchema },
      report_pathologist_report: { schema: reportPathologistReportSchema },
      report_specimen_dimensions: { schema: reportSpecimenDimensionsSchema },
      report_specimen_type: { schema: reportSpecimenTypeSchema },
      reports: { schema: reportSchema },
    });

    return db;
  }

  public get db(): Promise<RxDatabase> {
    return this.dbInstance;
  }
}
