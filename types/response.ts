export interface APIResponse<T>{
    code: number;
    message: string;
    data: T;
    timestamp: string | Date;
    version: string;
}