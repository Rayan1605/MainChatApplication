//Cloudinary stores images and videos which allow you to store, manage and manipulate
// media files in the cloud

import cloudinary, {UploadApiResponse, UploadApiErrorResponse} from "cloudinary";
//So remember when something ends with ?, this mean that's optional
// (file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean ):: Here, the function is declared with four parameters:
//
// file: A mandatory parameter of type string, which represents the path to the file or the file's content
// that you want to upload.

// public_id?: An optional parameter of type string. This is the unique identifier for the uploaded file in Cloudinary.
// If you don't provide it, Cloudinary generates a random unique ID.
// The question mark (?) indicates that this parameter is optional.

// overwrite?: An optional parameter of type boolean. If set to true, and there's already a file with the same
// public_id, the existing file will be replaced with the new one.
// The question mark (?) again indicates that this parameter is optional.

// invalidate?: Another optional parameter of type boolean.
// Setting this to true tells Cloudinary to invalidate any cached versions of the file across the Content Delivery
// Network (CDN), ensuring that the latest version of the file is served.
// The question mark (?) indicates that this parameter is optional.
export function uploads(file: string, public_id?: string, overwrite?: boolean, invalidate?: boolean ):
    Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
        return new Promise((resolve) => {
            //This line  below
            // starts the process of uploading a file using Cloudinary's upload method found in their version 2 API.
                cloudinary.v2.uploader.upload(
                    file,
                    {
                        //You're uploading the file you received, and you're setting its name (public_id),
                        // whether to overwrite it if it exists, and whether to invalidate the cached version.
                        public_id,
                        overwrite,
                        invalidate
                    }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (error) resolve(error);
                    resolve(result);
                    });
            });

    }