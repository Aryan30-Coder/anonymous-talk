import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { getServerSession } from "next-auth";
import { User } from 'next-auth'
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest, context: {params: Promise<{messageId: string}>}){
    const {messageId} = await context.params
    await dbConnect()
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "User not authenticated!"
        }, {status: 400})
    }

    try {
        const updateResult = await UserModel.updateOne(
            {_id: user._id},
            {$pull: {messages: {_id: messageId}}}
        )

        if(updateResult.modifiedCount === 0){
            return Response.json({
                success: false,
                message: "Message not found or already deleted!"
            }, {status: 404})
        }

        return Response.json({
            success: true,
            message: "Message deleted!"
        }, {status: 200})
    } catch (error) {
        console.log("Error in deleting message route", error)
        return Response.json({
            success: false,
            message: "Error deleting message!"
        }, {status: 500})
    }

}