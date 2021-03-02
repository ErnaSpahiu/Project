import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class CsvService {

  constructor(public http: HttpClient) { }


  getCsvData(csvFile: any) {
    const url = "http://localhost:5000/" + csvFile;
    return this.http.get(url).toPromise();
  }
}
