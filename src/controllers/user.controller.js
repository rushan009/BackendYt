//for try catch from the another templets
import { asyncHandler } from "../utils/asynchandler.js";

//for handling the error as we made a class in this file which defaultly handles the error
import {ApiError} from "../utils/ApiError.js"

//for importing the models which are made from mongoose and can communicate with the mongo db atlas
import {User} from "../models/user.model.js" 

//for the url of the files which are going to be uploaded on the cloudinary
import {uploadOnCloudinary} from "../utils/cloudinary.js"

//like the error for the custom response messgae
import { ApiResponse } from "../utils/ApiResponce.js";


//using a method naemd async handle imported from a custom wrapper made on the another file
const registerUser = asyncHandler( async (req, res) =>{
    // get user details from frontend (here its postman)
    //validation - not empty
    //check if user already exits //can use email or other field where the field is different or unique
    //check for required field
    //upload them to the cloudinary
    //take the url from the cloudinary responce.
    // create user object as no mongo db is no sql data base as a result the user must be an object to pass it to the db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    //these are the models imported filed which we are going to take from html and req.body allow the html form inputs to come as constants and again using js to make the array of those constannt which are made required on the model page and checking them whether they are null or not using .some method which takes field as arguments //where fields are each are every element of the array and them trimming them and chechking them whether they are null or not
    const {fullName, email, username, password}=req.body
    if (
        [fullName, email, username, password].some((field)=>field?.trim()==="")
    ) {
        //throwing error using the api error file
        throw new ApiError(400, "All fields are required") 
    }

    //validating whether the user exits or not
    //we have made the email field unique we are using find one to find whether the email is unique or not and username is unique or not
    //if there is the same username or email then it returs true in existedUser which is cheked and passed error in the next if condition.

    const existedUser =await User.findOne({
        $or:[{username}, {email}]
    })


    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist")
    }


    //
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalpath=req.files?.coverImage[0]?.path;
    let coverImageLocalpath;
    if (req.files && Array.isArray(req.files.coverImage && req.files.coverImage.length>0)) {
        coverImageLocalpath=req.files.coverImage[0].path;
    }
    console.log(req.files);
    


    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalpath)
    if (!avatar) {
         throw new ApiError(400, "avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
   const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
   )
   
   if (!createdUser) {
    throw new ApiError(500, "something went wrong while making a new user")
   }


   return res.status(201).json(
    new ApiResponse(200, createdUser, "user created")
   )

} )

export default registerUser
