/**
 * 全局正则管理
 */

// username手机号正则
export const usernameRegex = /^1[3-9][0-9]{9}$/;
// password正则
// 密码至少8位，包含大小写字母、数字、特殊符号
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

