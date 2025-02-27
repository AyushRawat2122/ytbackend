import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file has been uploaded successfully

    console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temp file if the upload operation got failed
    return null;
  }
};

const deleteOnCloudinary = async (publicId) => {
  try {
    if(!publicId){
      return null;
    }

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });

    //file successfully removed from cloudinary

    return response;
  } catch (error) {
    return null;
  }
};
export { uploadOnCloudinary, deleteOnCloudinary };
