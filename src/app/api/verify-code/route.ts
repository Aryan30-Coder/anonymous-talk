import UserModel from "@/models/User.model";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request){
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url)
        const {username, code} = {
            username: searchParams.get('username'),
            code: searchParams.get('code')
        }

        const user = await UserModel.findOne({username});

        if(!user){
            console.error("User doesnt exist!");
            return Response.json(
                {
                    success: "false",
                    message: "User doesnt exist!"
                }, { status: 500}
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                    success: "true",
                    message: "User verified!"
                }, { status: 200}
            )
        }else if(!isCodeValid){
            return Response.json(
                {
                    success: "false",
                    message: "Error verifying code! "
                }, { status: 400}
            )
        }else{
            return Response.json(
                {
                    success: "false",
                    message: "Code is expired! Please sign-up again to generate a new code."
                }, { status: 400}
            )
        }

        

    } catch (error) {
        console.error("Error verifying code: ", error);
        return Response.json(
            {
                success: "false",
                message: "Error verifying code", error
            }, { status: 500}
        )
    }
}