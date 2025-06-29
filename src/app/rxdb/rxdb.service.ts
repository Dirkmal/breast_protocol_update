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

  private conflictHandler = {
    isEqual(a: any, b: any) {
      return (
        new Date(a.updated_at).getTime() === new Date(b.updated_at).getTime()
      );
    },

    resolve({
      realMasterState,
      newDocumentState,
    }: {
      realMasterState: any;
      newDocumentState: any;
    }) {
      const realUpdated = realMasterState?.updated_at ?? new Date();
      const newUpdated = newDocumentState?.updated_at ?? new Date();

      return new Date(realUpdated).getTime() >= new Date(newUpdated).getTime()
        ? realMasterState
        : newDocumentState;
    },
  };

  private async init(): Promise<RxDatabase> {
    const db = await createRxDatabase({
      name: 'reportdb',
      storage,
      multiInstance: true,
      eventReduce: true,
      closeDuplicates: true,
      ignoreDuplicate: true,
    });

    await db.addCollections({
      report_axillary_node: {
        schema: reportAxillaryNodeSchema,
      },
      report_axillary_procedure: {
        schema: reportAxillaryProcedureSchema,
        conflictHandler: this.conflictHandler,
      },
      report_ihc: {
        schema: reportIhcSchema,
        conflictHandler: this.conflictHandler,
      },
      report_in_situ_carcinoma: {
        schema: reportInSituCarcinomaSchema,
        conflictHandler: this.conflictHandler,
      },
      report_initial_details: {
        schema: reportInitialDetailsSchema,
        conflictHandler: this.conflictHandler,
      },
      report_invasive_carcinoma: {
        schema: reportInvasiveCarcinomaSchema,
        conflictHandler: this.conflictHandler,
      },
      report_margins: {
        schema: reportMarginSchema,
        conflictHandler: this.conflictHandler,
      },
      report_other_margins: {
        schema: reportOtherMarginsSchema,
        conflictHandler: this.conflictHandler,
      },
      report_pathological_staging: {
        schema: reportPathologicalStagingSchema,
        conflictHandler: this.conflictHandler,
      },
      report_pathologist_report: {
        schema: reportPathologistReportSchema,
        conflictHandler: this.conflictHandler,
      },
      report_specimen_dimensions: {
        schema: reportSpecimenDimensionsSchema,
        conflictHandler: this.conflictHandler,
      },
      report_specimen_type: {
        schema: reportSpecimenTypeSchema,
        conflictHandler: this.conflictHandler,
      },
      reports: { schema: reportSchema, conflictHandler: this.conflictHandler },
    });

    return db;
  }

  public get db(): Promise<RxDatabase> {
    return this.dbInstance;
  }
}
