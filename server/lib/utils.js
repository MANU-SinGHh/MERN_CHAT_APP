import jwt from "jsonwebtoken"

//function to generate a token for the user
export const generateToken=(userId)=>{
    // we need unique user id and using this user_id we will generate a token
    const token=jwt.sign({userId},process.env.JWT_SECRET)
    return token

}