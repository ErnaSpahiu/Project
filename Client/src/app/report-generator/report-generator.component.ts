import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { CsvService } from '../Service/csv.service';

@Component({
  selector: 'app-report-generator',
  templateUrl: './report-generator.component.html',
  styleUrls: ['./report-generator.component.scss'],
})
export class ReportGeneratorComponent implements OnInit {
  constructor(public csvService: CsvService) {}

  // Boolean to control the table with the right information to show
  showReport: boolean = false;

  // The header columns for each table to show
  columnDefs: any;

  // The rows information for each table to show
  rowData: any = [];

  // All the informtaion of listings.csv file
  dataListings: any;

  // All the informtaion of contacts.csv file
  dataContacts: any;

  // All listings, each one with the number of times contacted and price during the whole year
  allIdContacts: any = [];

  // All listings, each one with the number of times contacted per month
  listingsAllMonths: any = [];

  // Array with the months that each listing has been contacted
  months: any = [];

  // Dynamically changing the width of the table
  style: any = {
    width: '100%',
  };

  ngOnInit() {
    this.csvService.getCsvData('listings').then((dataListings) => {
      this.dataListings = JSON.parse(
        JSON.stringify(Object.entries(dataListings))
      );
    });
    this.csvService.getCsvData('contacts').then((dataContacts) => {
      this.dataContacts = JSON.parse(
        JSON.stringify(Object.entries(dataContacts))
      );
    });
  }

  onGridReady(params: any) {
    // this.gridApi = params.api;
    //   // this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

  // Generates the corresponding report
  getCsv(selectedValue: any) {
    this.showReport = false;
    if (selectedValue == 'firstReport') {
      this.getDataFirstReport();
    } else if (selectedValue == 'secondReport') {
      this.getDataSecondReport();
    } else if (selectedValue == 'thirdReport') {
      this.getDataThirdReport();
    } else {
      this.getDataFourthReport();
    }
  }

  // Get the 'average selling price per seller type' report information
  getDataFirstReport() {
    // Number of elements that have each seller type
    let totalPrivate = 0;
    let totalOther = 0;
    let totalDealer = 0;

    // Total price by summing up for each type of seller
    let sumPrivate = 0;
    let sumOther = 0;
    let sumDealer = 0;

    for (let i = 0; i < this.dataListings.length; i++) {
      if (this.dataListings[i][1].seller_type == 'private') {
        totalPrivate++;
        sumPrivate += parseInt(this.dataListings[i][1].price);
      }
      if (this.dataListings[i][1].seller_type == 'other') {
        totalOther++;
        sumOther += parseInt(this.dataListings[i][1].price);
      }
      if (this.dataListings[i][1].seller_type == 'dealer') {
        totalDealer++;
        sumDealer += parseInt(this.dataListings[i][1].price);
      }
    }
    this.columnDefs = [];
    this.columnDefs = [
      { headerName: 'Seller type', field: 'type' },
      { headerName: 'Average in Euro', field: 'average' },
    ];
    let rows = [];
    this.rowData = [];
    // Calculating the average price for each type of seller
    const privateAverage = sumPrivate / totalPrivate;
    const dealerAverage = sumDealer / totalDealer;
    const otherAverage = sumOther / totalOther;

    const objPrivate = {
      type: 'Private',
      average:
        '€ ' +
        privateAverage
          .toFixed(2)
          .replace('.', ',')
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
    };
    rows.push(objPrivate);
    const objOther = {
      type: 'Other',
      average:
        '€ ' +
        dealerAverage
          .toFixed(2)
          .replace('.', ',')
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
    };
    rows.push(objOther);
    const objDealer = {
      type: 'Dealer',
      average:
        '€ ' +
        otherAverage
          .toFixed(2)
          .replace('.', ',')
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
    };
    rows.push(objDealer);
    this.rowData.push(rows);
    this.style.width = '543px';
    this.showReport = true;
  }

  // Get the 'Percentual distribution of available cars by Make' report information
  getDataSecondReport() {
    const autos: any = [
      'Audi',
      'Mazda',
      'BWM',
      'Toyota',
      'Renault',
      'VW',
      'Fiat',
      'Mercedes-Benz',
    ];
    let arrayDistribution = [];
    for (let i = 0; i < autos.length; i++) {
      const count = this.dataListings.filter(
        (make: any) => autos[i] == make[1].make
      ).length;
      const percentage = ((count / 300) * 100).toFixed(1);
      const obj = {
        make: autos[i],
        distribution:
          percentage.toString().split('.')[1] == '0'
            ? parseInt(percentage).toFixed(0) + ' %'
            : percentage + ' %',
      };
      arrayDistribution.push(obj);
    }
    arrayDistribution.sort((a: any, b: any) => {
      return (
        parseInt(b.distribution.split('%')[0]) -
        parseInt(a.distribution.split('%')[0])
      );
    });
    this.columnDefs = [];
    this.rowData = [];
    this.columnDefs = [
      { headerName: 'Make', field: 'make' },
      { headerName: 'Distribution', field: 'distribution' },
    ];
    const rows = JSON.parse(JSON.stringify(arrayDistribution));
    this.rowData.push(rows);
    this.style.width = '543px';
    this.showReport = true;
  }

  // Get the 'average price of the 30% most contacted listings' report information
  getDataThirdReport() {
    for (let i = 0; i < this.dataListings.length; i++) {
      this.iterator(i);
    }
    this.allIdContacts.sort((a: any, b: any) => {
      return b.contacted - a.contacted;
    });
    // 30% of all the id (300) is 90 elements
    const mostContacted = this.allIdContacts.slice(0, 90);
    let totalPrice = 0;
    for (let eachContact of mostContacted) {
      totalPrice += parseInt(eachContact.price);
    }
    const average = totalPrice / 90;
    this.columnDefs = [];
    this.rowData = [];
    this.columnDefs = [{ headerName: 'Average Price', field: 'price' }];
    const objContacts = {
      price:
        '€ ' +
        average
          .toFixed(2)
          .replace('.', ',')
          .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
    };
    let rows = [];
    rows.push(objContacts);
    this.rowData.push(rows);
    this.style.width = '200px';
    this.showReport = true;
  }

  // Iterate the dataContacts array
  iterator(i: any) {
    const count = this.dataContacts.filter(
      (id: any) => this.dataListings[i][1].id == id[1].listing_id
    ).length;
    const obj = {
      id: this.dataListings[i][1].id,
      price: this.dataListings[i][1].price,
      contacted: count,
    };
    this.allIdContacts.push(obj);
  }

  // Get the 'top 5 most contacted listings per month' report information
  getDataFourthReport() {
    for (let i = 0; i < 12; i++) {
      const arrayPerMonth = [];
      const array = this.dataContacts.filter(
        (value: any) =>
          i == new Date(parseInt(value[1].contact_date)).getMonth()
      );
      for (let eachArray of array) {
        arrayPerMonth.push(eachArray[1]);
      }
      const array2 = [];
      for (let j = 0; j < this.dataListings.length; j++) {
        const count = arrayPerMonth.filter(
          (id: any) => this.dataListings[j][1].id == id.listing_id
        ).length;
        if (count != 0) {
          const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
          ];
          let price = parseInt(this.dataListings[j][1].price)
            .toFixed(2)
            .replace('.', ',')
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
          const obj = {
            id: this.dataListings[j][1].id,
            contacted: count,
            month: monthNames[i],
            make: this.dataListings[j][1].make,
            price:
              price.split(',')[1] == '00'
                ? '€ ' + price.split(',')[0] + ',-'
                : '€ ' + price,
            mileage:
              this.dataListings[j][1].mileage.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                '.'
              ) + ' KM',
          };
          array2.push(obj);
          array2.sort((a: any, b: any) => {
            return b.contacted - a.contacted;
          });
        }
      }
      const mostContacted: any = array2.slice(0, 5);
      for (let k = 0; k < mostContacted.length; k++) {
        mostContacted[k].ranking = k + 1;
      }
      this.listingsAllMonths.push(mostContacted);
    }
    this.columnDefs = [];
    for (let l = 0; l < this.listingsAllMonths.length; l++) {
      if (this.listingsAllMonths[l].length == 0) {
        this.listingsAllMonths.splice(l, l + 1);
      } else {
        this.months.push(this.listingsAllMonths[l][0].month);
      }
    }
    this.columnDefs = [
      { headerName: 'Ranking', field: 'ranking' },
      { headerName: 'Listing Id', field: 'id' },
      { headerName: 'Make', field: 'make' },
      { headerName: 'Selling Price', field: 'price' },
      { headerName: 'Mileage', field: 'mileage' },
      { headerName: 'Total contacts', field: 'contacted' },
    ];
    this.rowData = [];
    this.rowData = JSON.parse(JSON.stringify(this.listingsAllMonths));
    this.style.width = '800px';
    this.showReport = true;
  }
}
