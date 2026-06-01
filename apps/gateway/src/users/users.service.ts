import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./users.schema";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    async upsertAuthUser(
        input: {
            clerkUserId: string;
            email: string;
            name: string;
        }
    ) {
        const { clerkUserId, email, name } = input;

        return this.userModel.findOneAndUpdate(
            {
                clearkUserId: clerkUserId
            },
            {
                $set: {
                    email: email,
                    name: name,
                    lastSeenAt: new Date()
                },
                $setOnInsert: {
                    role: 'user'
                }
                
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        )
        

    }

    async findByClerkUserId(clerkUserId: string) {
        return this.userModel.findOne({ clerkUserId });
    }   


}