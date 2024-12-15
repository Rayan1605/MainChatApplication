import {JoiRequestValidationError} from "@root/globels/error-handler";
import { Request} from "express";
import { ObjectSchema} from "joi"

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;

export function joiValidation(schema: ObjectSchema): IJoiDecorator {
   return (_target: any, _big: string, descriptor: PropertyDescriptor) => {
       const orginalMethod = descriptor.value;

       descriptor.value = async function (...args: any[]) { // args is an array of all the arguments
           // that are being passed in from the controller method sign up
           const req: Request = args[0];
           const { error } = await Promise.resolve(schema.validate(
               req.body));
           if (error?.details) {
               throw new JoiRequestValidationError(error.details[0].message);
           }
           return orginalMethod.apply(this, args);
       }
       return descriptor;
   }
}
