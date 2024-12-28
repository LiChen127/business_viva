// /**
//  * 收录几种上传文件的方法
//  */

// export default class UploadFileUtil {
//   /**
//    * Base64上传
//    */
//   static async uploadImgeByBase64(req: Request, res: Response) {
//     const { userId, profilePicture } = req.body;
//     if (!userId || !profilePicture) {
//       return res.status(400).json({
//         code: 400,
//         message: '缺少必要参数',
//       })
//     }
//   }
// }