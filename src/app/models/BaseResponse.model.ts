export interface BaseResponse<T>{
  statusCode:number;
  message:string;
  t:T
}
