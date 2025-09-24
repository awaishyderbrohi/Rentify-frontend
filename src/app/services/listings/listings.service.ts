import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductFormData } from '../../pages/list-equipment/list-equipment.component';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Listing } from '../../pages/profile/my-listings/my-listings.component';
import { BaseResponse } from '../../models/BaseResponse.model';
import { BasePageRes } from '../../models/BasePageRes.model';

@Injectable({
  providedIn: 'root'
})
export class ListingsService {

   BASE_URL = `${environment.apiUrl}/listing`;

  constructor(private http:HttpClient) { }


 createListing(data: ProductFormData): Observable<any> {
  const formData = new FormData();

  // Append JSON data as Blob
  formData.append('data', new Blob([JSON.stringify({
    ...data,
    images: undefined // prevent duplicating image data in JSON
  })], { type: 'application/json' }));

  // Append images separately
  if (data.images && data.images.length > 0) {
    data.images.forEach((file: File) => {
      formData.append('images', file);
    });
  }

  return this.http.post<any>(`${this.BASE_URL}/create`, formData, {
    withCredentials: true
  });
}


  getAllUserListings(): Observable<BaseResponse<Listing[]>>{
    return this.http.get<BaseResponse<Listing[]>>(`${this.BASE_URL}/user-listings`,{withCredentials:true});
  }

  deleteListingById(id:string){
    return this.http.delete(`${this.BASE_URL}/delete-by-id/${id}`,{withCredentials:true});
  }

  getListingById(id:string):Observable<BaseResponse<Listing>>{
      return this.http.get<BaseResponse<Listing>>(`${this.BASE_URL}/${id}`, {withCredentials:true});
  }

  search(q:string,location:string,lat:number,lon:number,page:number): Observable<BaseResponse<BasePageRes<Listing>>>{
      if(page != 0 ){
        page = page-1
      }
      let params = new HttpParams();
      params = params.set('query', q);
      params = params.set('latitude', lat.toString());
      params = params.set('longitude', lon.toString());
      params = params.set('page', page.toString());

  return this.http.get<BaseResponse<BasePageRes<Listing>>>(`${this.BASE_URL}/search`,{params,  withCredentials:true});

  }

  getRandomItems(count:number): Observable<BaseResponse<Listing[]>>{
    let params = new HttpParams();
    params = params.set("count",count)
    return this.http.get<BaseResponse<Listing[]>>(`${this.BASE_URL}/random`,{params});
  }

  changeListingStatus(id:string, status:string): Observable<BaseResponse<string>>{
    let params = new HttpParams();
    params = params.set('id',id);
    params = params.set('status',status);
    return this.http.get<BaseResponse<string>>(`${this.BASE_URL}/change-status`,{params,withCredentials:true});
  }

  getProductsByCategory(category:string, page:number): Observable<BaseResponse<BasePageRes<Listing>>>{
    if(page>0){
      page = page-1
    }
    let params = new HttpParams();
    params = params.set('category',category)
    params = params.set('page',page)
    return this.http.get<BaseResponse<BasePageRes<Listing>>>(`${this.BASE_URL}/category`,{params,withCredentials:true});
  }


   getRelatedItems(lisitngId:string): Observable<BaseResponse<Listing[]>>{

    return this.http.get<BaseResponse<Listing[]>>(`${this.BASE_URL}/${lisitngId}/related`);
  }



}
