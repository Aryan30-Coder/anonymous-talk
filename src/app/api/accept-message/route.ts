import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { getServerSession } from "next-auth";
import { User } from 'next-auth'
import { authOptions } from "../auth/[...nextauth]/options";


export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !user){
        return Response.json({
            success: false,
            message: "User is not authenitcated!"
        }, {status : 500})
    }   

    const userId = user._id
    const {acceptMessages} = await request.json()

    try { 
        const updatedUser = await UserModel.findOneAndUpdate(
            {_id: userId},
            {isAcceptingMessage: acceptMessages},
            {new: true}
        )

        if(!updatedUser){
            return Response.json({
                success: false,
                message: "Could not update user status to accept messages!"
            }, {status: 401})
        }

        return Response.json({
                success: true,
                message: "Updated user status to accept messages!"
            }, {status: 200})

    } catch (error) {
        console.error("Error toggling get-messages button", error)
        return Response.json({
            success: false,
            message: "Error toggling the get-message button"
        }, { status: 500 })
    }
}


export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !user){
        return Response.json({
            success: false,
            message: "User is not authenitcated!"
        }, {status : 500})
    }   

    const userId = user._id

    try {
        const foundUser = await UserModel.findOne({_id: userId})
        if(!foundUser){
            return Response.json({
                success: false,
                message: "Did not find user!"
            }, {status : 404})
        }

        return Response.json({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessage
        }, {status: 200})
        
    } catch (error) {
        console.error("Error getting the status of accepting messages: ", error)
        return Response.json({
            success: false,
            message: "Error gettting the status of accepting messages!"
        }, {status: 404})
    }
}