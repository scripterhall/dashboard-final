import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
     // URI de la requête
     const uri = request.url;

   
     if (uri.includes('http://localhost:8987') || uri.includes('http://localhost:8097')) {
       
       return next.handle(request);
     }
 
    
     const token = localStorage.getItem('token');
 
     
     if (token) {
      
       const authRequest = request.clone({
         setHeaders: {
           Authorization: token
         }
       });
 
      
       return next.handle(authRequest);
     }else{
      Swal.fire(
        'Attention',
        'vous n\'êtes pas autoriser',
        'error'
      )
     }
 
     // Si le token n'existe pas, passer simplement la requête sans modification
    
   }
  
}
