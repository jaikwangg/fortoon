import { RowDataPacket, ResultSetHeader } from 'mysql2';

export type GenericRowDataPacket<T> = RowDataPacket & T;

export interface IBaseEntity {
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBaseEntityWithId extends IBaseEntity {
    id: number;
}

export type QueryResult<T> = [T[], any];

export type InsertResult = [ResultSetHeader, any];

export type UpdateResult = [ResultSetHeader, any];

export type DeleteResult = [ResultSetHeader, any];

export interface IDatabaseError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
}

export interface IDatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port?: number;
}