// import { Injectable } from '@angular/core';
// import Datastore from 'nedb';

// import * as path from 'path';
// import { Observable, Subject } from 'rxjs';
// import { Report } from '../models/report.model';
// import { Response } from '../../models/response';


// @Injectable({
//   providedIn: 'root'
// })
// export class NedbService {
// 	ds: any;
// 	rows_per_page = 10;
	  
// 	constructor() { 
// 		this.ds = new Datastore({
// 			filename: path.resolve("src/assets/db/reports.json"),
// 			autoload: true,
// 		});
// 	}

// 	private genID() {
// 		return new Date().getTime().toString();
// 	}

// 	/**
// 	 * Check if the histology number is formatted correctly
// 	 * @param histology_num the Histology number
// 	 * @returns true if formatted correctly 
// 	 */
// 	histologyNumOK(histology_num: string): boolean {
// 		const fractions = histology_num.split("-").join("/").split("/");

// 		if (fractions.length === 3) {
// 			if (fractions[0] !== "H" || 
// 				fractions[1].startsWith('0') || 
// 				fractions[2].startsWith("0") || 
// 				fractions[2].length !== 2) {
// 					/**
// 					 * Should begin with H
// 					 * next sequence after the dash (-) should not begin with 0
// 					 * next sequence after slash (/) should be two digits signifying year
// 					 */					
// 				 	return false;
// 			}
// 			return true
// 		}
// 		return false;
// 	}

// 	/**
// 	 * Find a report by its Histolgoy number
// 	 * @param h_num - The Histology number	 
// 	 */
// 	findReportByHnum(h_num: string): Observable<Report> {		
// 		return new Observable((subscriber) => {
// 			this.ds.findOne({ "patient.histology_num": h_num }, (err: any, doc: Report) => {
// 				// if (err) {
// 				// 	return this.handleError(err);
// 				// } else {
// 					subscriber.next(doc);
// 				// }
// 			});
// 		});
// 	}

// 	/**
// 	 * Check if a report's histology number has been changed
// 	 * @param report 
// 	 */
// 	// histologyNumChanged(report: Report): Observable<boolean> {
// 	// 	let changed = new Subject<boolean>();

// 	// 	this.findReportById(report._id).subscribe((doc: Response) => {			
// 	// 		if (this.isNotNull(doc)) {
// 	// 			const p = doc.data;
				
// 	// 			if (p.patient.histology_num !== report.patient.histology_num) {					
// 	// 				changed.next(true);
// 	// 			} else {
// 	// 				changed.next(false);
// 	// 			}
// 	// 		} else {
// 	// 			changed.next(true);
// 	// 		}						
// 	// 	}, (err) => {
// 	// 		changed.next(true);
// 	// 	});	
// 	// 	return changed.asObservable();
// 	// }

// 	/**
// 	 * Find a report by its _id
// 	 * @param id - report _id
// 	 */
// 	findReportById(id: string): Observable<Response> {
// 		return new Observable(subscriber => {
// 			this.ds.findOne({ _id: id }, (err: any, doc: Report) => {
// 				// if (err) {
// 				// 	return this.handleError(err);
// 				// } else {
// 					subscriber.next(new Response({
// 						code: 200,
// 						status: true,
// 						data: doc
// 					}));
// 				// }			
// 			});
// 		});
// 	}

// 	countDocs(options: Object): Observable<number> {
// 		return new Observable(subscriber => {
// 			this.ds.count(options, (err: any, count: number) => {
// 				// if (err) {
// 				// 	return this.handleError(err, "Could not determine report count");
// 				// } else {
// 					subscriber.next(count);
// 				// }
// 			})
// 		})
// 	}

// 	fetchAll(page = 0, options = {}): Observable<Response> {		
// 		let count  = 0; // total docs in db
	
// 		const skip_count = page * this.rows_per_page; // number of docs to skip for pagination

// 		this.countDocs({}).subscribe(res => {
// 			if (res > 0) {
// 				count = res;
// 			}
// 		})

// 		return new Observable(subscriber => {			
// 			this.ds.find(options).skip(page).limit(this.rows_per_page).sort({_id: -1}).exec((err: any, docs: Report[]) => {
// 				// if (err) {					
// 				// 	return this.handleError(err);
// 				// } else {
// 					let last_page = false;

// 					if ((docs)) {			
// 						if (docs.length < this.rows_per_page) {
// 							last_page  = true;
// 						}
// 					} else {
// 						last_page = true;
// 					}
					
// 					subscriber.next(new Response({
// 						status: true,
// 						message: 'All reports',
// 						data: docs,
// 						code: 200,
// 						extra: {
// 							last_page: last_page,
// 							total_rows: count
// 						}
// 					}));
// 				// }
// 			});
// 		});
// 	}

// 	save(report: Report): Observable<Response> {
// 		report._id = this.genID();
// 		report.initial_details.date_typed = report._id;		
		
// 		if (!this.histologyNumOK(report.initial_details.histology_Number)) {
// 			return this.handleError(null, "Histology number not formatted properly");					
// 		}				

// 		return new Observable(subscriber => {
// 			this.findReportByHnum(report.initial_details.histology_Number)
// 			.subscribe(registered => {					
// 				if (this.isNotNull(registered)) {
// 					subscriber.error(new Response({
// 						status: false,
// 						message: "This Histology number is already registered"
// 					}));
// 				} else {
// 					this.ds.insert(report, (err: any, doc: Report) => {
// 						if (err) {
// 							subscriber.error(err);
// 						} else {
// 							subscriber.next(new Response({
// 								code: 201,
// 								data: doc,
// 								status: true,
// 								message: "Report created successfully"
// 							}));
// 						}
// 					});
// 				}
// 			}, err => {
// 				subscriber.error(err);
// 			})
// 		});	
// 	}

// 	// update(report: Report): Observable<Response> {
// 	// 	if (!this.histologyNumOK(report.initial_details.histology_Number)) {
// 	// 		return this.handleError(null, "Histology number not formatted properly");					
// 	// 	}

// 	// 	return new Observable(subscriber => {					
// 	// 		this.histologyNumChanged(report).subscribe(res => {
// 	// 			if (res === false ) {			
// 	// 				this.ds.update({ _id: report._id }, report, (err, num_replaced) => {
// 	// 					if (err) {
// 	// 						subscriber.error(err);
// 	// 					}
		
// 	// 					subscriber.next(new Response({
// 	// 						status: true,
// 	// 						code: 201,
// 	// 						message: "Report updated",
// 	// 						data: num_replaced
// 	// 					}));
// 	// 				});	
// 	// 			} else {
// 	// 				subscriber.error(new Response({
// 	// 					status: false,
// 	// 					message: "Histology number cannot be changed"
// 	// 				}));					
// 	// 			}
// 	// 		});
// 	// 	});			
// 	// }

// 	/**
//      * Displays a given http error in a verbose manner
//      * @param error the error of a http response
//      */
//     private handleError(error: any, msg = ''): Observable<Response> {
// 		console.trace("How did we get here?");
// 		if (error !== null) {
// 			console.error(`Error: ${error}.`);		
// 		}
		
// 		return new Observable(e => {
// 			e.error((new Response({
// 				error: error,
// 				status: false,
// 				message: msg || error.message,
// 				data: error
// 			})));
// 		});
// 	}

// 	/**
//      * Returns true if a variable is not null, undefined or empty
//      * @param foo variable to check
//      */
//     isNotNull(foo: any): boolean {
// 		if (foo && foo !== null && foo !== undefined && foo !== '') {
// 		  return true;
// 		}
// 		return false;
// 	}
// }
