import {ApiClientService} from "../../resources/services/api-client.service";
import {LoaderService} from "../../resources/services/loader.service";
import {HttpResponseMessage} from "aurelia-http-client";
import {bindable, autoinject, observable} from "aurelia-framework";
import {buildQueryString} from "aurelia-path";

@autoinject
export class PoolPayments {
  @bindable
  public id: string;
  public data: PoolPaymentItem[] = [];
  public error: boolean = false;
  @observable
  public currentPageNumber: number = 0;
  @observable
  public pageSize: number = 5;

  public loading: boolean = false;
  public get allowNext(): boolean {
    if (this.loading){
      return false;
    }
    if(this.data.length < ((this.currentPageNumber+1) * this.pageSize) ){
      return false;
    }
    return true;
  }

  constructor(private apiClientService: ApiClientService, private loadingService: LoaderService) {

  }

  public idChanged() {
    this.currentPageNumber = -1;
  }

  public pageSizeChanged() {
    this.currentPageNumber = -1;
  }

  public currentPageNumberChanged() {
    if (this.currentPageNumber < 0) {
      this.currentPageNumber = 0;
    }
    this.bind();
  }

  public bind() {
    if (!this.id) {
      return;
    }
    this.loading = true;
    this.error = false;
    this.loadingService.toggleLoading(true);
    let options = {
      pageSize: this.pageSize,
      page: this.currentPageNumber
    }
    this.apiClientService.http.get(`pools/${this.id}/payments?${buildQueryString(options, true)}`,).then((value: HttpResponseMessage) => {
      if (value.isSuccess) {
        if(this.currentPageNumber ===  0){
          this.data = [];
        }
        this.data= [...this.data,...value.content ];

      } else {
        this.error = true;
      }
    }).catch(() => {
      this.error = true;
    }).then(() => {
      this.loadingService.toggleLoading(false);

      this.loading = false;
    })
  }

}

export interface PoolPaymentItem {
  coin: string;
  address: string;
  addressInfoLink: string;
  amount: number;
  transactionConfirmationData: string;
  transactionInfoLink: string;
  created: string;
}
