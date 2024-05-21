import User from "../Models/user.model.js";
import { errorResMsg, successResMsg } from "../utils/response.utils.js";
import cloudinary from "../Public/images/cloudinary.js"; 
// import path from "path";

export const uploadPicture = async (req, res) => {
    try {
        const profilePicture = req.file;
       
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return errorResMsg(res, 400, "User not found");
        }
        
     if (!profilePicture) {
     return errorResMsg(res, 400, "Please input your profile picture");
         }
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const updatedUser = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      { profilePicture: result.secure_url },
      {
        new: true,
      }
        );
        return successResMsg(res, 200, 
            {
              success: true,
              message: "Profile Picture Uploaded Successfully",
              data: updatedUser,
            }
        )
  } catch (err) {
    // console.log(error);
    console.error(err);
    return res
      .status(500)
      .json({ message: "Error Uploading Profile Picture", err });
  }
};
