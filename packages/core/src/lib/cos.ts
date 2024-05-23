import COS, {CosError} from 'cos-js-sdk-v5';
import { nanoid } from "nanoid";

const client = new COS({
  SecretId: process.env.NEXT_PUBLIC_COS_SECRET_ID,
  SecretKey: process.env.NEXT_PUBLIC_COS_SECRET_KEY,
});

interface UploadResult {
  url: string | null;
  error: CosError | null;
}

/** 上传图片至腾讯云 */
async function uploadFileToCOS(file: File): Promise<UploadResult> {
  const fileName = `${nanoid()}.${getFileExtension(file)}`;
  return new Promise((resolve) => {
    client.uploadFile({
      Bucket: `${process.env.NEXT_PUBLIC_COS_BUCKET}`, /* 填入您自己的存储桶，必须字段 */
      Region: `${process.env.NEXT_PUBLIC_COS_REGION}`,  /* 存储桶所在地域，例如ap-beijing，必须字段 */
      Key: fileName,  /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */
      Body: file, /* 必须，上传文件对象，可以是input[type="file"]标签选择本地文件后得到的file对象 */
      SliceSize: 1024 * 1024 * 5,     /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */
      onProgress: function (progressData) {           /* 非必须 */
        console.log(JSON.stringify(progressData));
      },
    }, (err, data) => {
      if (err) {
        resolve({ url: null, error: err });
      } else {
        resolve({ url: `https://${data.Location}`, error: null });
      }
    });
  });
}

export { uploadFileToCOS };

/** 获取文件后缀名 */
function getFileExtension(file: File) {
  const fileName = file.name;
  const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
  return fileExtension;
}
