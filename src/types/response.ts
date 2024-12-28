export interface BaseResponse {
  code: number;
  message: string;
  data?: any;
}

export interface UserResponse extends BaseResponse {
  data?: {
    user?: any;
    userList?: any[];
    total?: number;
  };
} 