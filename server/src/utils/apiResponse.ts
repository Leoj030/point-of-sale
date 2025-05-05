import { ApiResponse } from "../interfaces/api.response.ts";

export const successResponse = <T>(message: string, data?: T): ApiResponse<T> => {
    return {
        success: true,
        message,
        data
    }
}

export const errorResponse = <T>(message: string, error?: T): ApiResponse<T> => {
    return {
        success: false,
        message,
        error
    }
}