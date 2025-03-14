import { RowDataPacket } from 'mysql2';

export type GenericRowDataPacket<T> = RowDataPacket & T