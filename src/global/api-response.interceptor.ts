import {
  CallHandler,
  ExecutionContext,
  HttpException,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { catchError, map, Observable, throwError } from 'rxjs';

export class ApiResponse implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        success: true,
        data: data,
      })),
      catchError((error) => {
        if (error instanceof HttpException) {
          throw error;
        } else {
          throw error;
        }
      }),
    );
  }
}
