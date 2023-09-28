export type AnyClass<ReturnType = any> = new (...args: any[]) => ReturnType;
type AnyRecord = Record<PropertyKey, any>;
export type SubjectType = string | SubjectClass;
export type Subject = AnyRecord | SubjectType;
export type SubjectClass<N extends string = string> = AnyClass & {
  modelName?: N;
};
export type AnyObject = Record<PropertyKey, unknown>;
