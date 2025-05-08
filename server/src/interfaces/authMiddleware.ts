import { Request } from 'express';
import mongoose from 'mongoose';
import roles from '../enums/roles.js';
import status from '../enums/status.js';

export interface PopulatedRole {
    _id: mongoose.Types.ObjectId;
    name: roles;
}

export interface PopulatedStatus {
    _id: mongoose.Types.ObjectId;
    name: status;
}

export interface PopulatedUser {
    _id: mongoose.Types.ObjectId;
    username: string;
    name: string;
    role: PopulatedRole;
    status: PopulatedStatus;
}

export interface AuthenticatedRequest extends Request {
    user?: PopulatedUser;
}

export interface JwtPayload {
    id: string;
    tokenVersion: number;
}