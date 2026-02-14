"use server";

import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();
    if (!user) {
      return {
        success: false,
        error: "No authentication user is found",
      };
    }

    const { id, firstName, lastName, emailAddresses, imageUrl } = user;
    // absert method like checking the user in the database if it is available then update it otherwise create a new record in the database

    const newUser = await db.user.upsert({
      where: {
        // clerkid==id
        clerkId: id,
      },
      update: {
        name:
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || null,
        image: imageUrl || null,
        email: emailAddresses[0]?.emailAddresses || "",
      },
      create: {
        clerkId: id,
        name:
          firstName && lastName
            ? `${firstName} ${lastName}`
            : firstName || lastName || null,
        image: imageUrl || null,
        email: emailAddresses[0]?.emailAddress || "",
      },
    });
    return {
        success:true,
        user:newUser,
        message:"User onboarded successfully"
    }
  } catch (err) {
    console.log("❌ Error in onboarding the user",err);
    return {
        success:false,
        error:"Error in onboarding the user"
    }
  }
};

export const getUser=async()=>{
    try{
        const user=currentUser();
        if(!user) return null;
        const dbUser=await db.user.findUnique({
            where:{
                clerkId:user.id
            },
            select:{
                id:true,
                email:true,
                name:true,
                image:true,
                clerkId:true,
            }
        })
        return dbUser;
    }catch(error){
        console.error("❌ Error fetching current User :",error);
        return null;
    }
}