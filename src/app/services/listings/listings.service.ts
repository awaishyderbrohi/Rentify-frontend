import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProductFormData } from '../../pages/list-equipment/list-equipment.component';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Listing } from '../../pages/profile/my-listings/my-listings.component';
import { BaseResponse } from '../../models/BaseResponse.model';

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

}
