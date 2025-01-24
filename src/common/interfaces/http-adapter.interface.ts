export interface HttpAdapter{
    // the adapter must have a get method
    // and returns generic data <T>
    get<T>(url:string):Promise<T>;
}