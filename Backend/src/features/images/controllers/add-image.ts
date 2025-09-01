import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from '../../../shared/services/redis/user.cache';
import { joiValidation } from '../../../shared/globals/decorators/joi-validation.decorators';
import { addImageSchema } from '../schemes/images';
import { uploads } from '../../../shared/globals/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';
import { IUserDocument } from '../../user/interfaces/user.interface';
import { socketIOImageObject } from '../../../shared/sockets/image';
import { imageQueue } from '../../../shared/services/queues/image.queue';
import { IBgUploadResponse } from '../interfaces/image.interface';
import { Helpers } from '../../../shared/globals/helpers/helpers';

const userCache: UserCache = new UserCache();

// Test if uploads function is imported correctly
console.log('🔧 uploads function imported:', typeof uploads);

export class Add {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    try {
      console.log('🖼️ Profile image upload started');
      console.log('📥 Image data type:', typeof req.body.image);
      console.log('📥 Image data length:', req.body.image?.length || 0);
      console.log('📥 Image data preview:', req.body.image?.substring(0, 100) + '...');
      console.log('👤 User ID:', req.currentUser!.userId);
      console.log('👤 User ID type:', typeof req.currentUser!.userId);
      
      // Check if image data exists
      if (!req.body.image) {
        console.error('❌ No image data provided');
        throw new BadRequestError('No image data provided');
      }
      
      // Try uploading without public_id first to see if that's the issue
      console.log('🔄 Attempting upload without public_id...');
      console.log('🔄 About to call uploads function...');
      console.log('🔄 uploads function type:', typeof uploads);
      
      const result: UploadApiResponse = (await uploads(req.body.image, undefined, true, true)) as UploadApiResponse;
      
      console.log('📤 Upload result:', result);
      
      if (!result?.public_id) {
        console.error('❌ Upload failed - no public_id:', result);
        throw new BadRequestError('File upload: Error occurred. Try again.');
      }

      console.log('✅ Upload successful, updating cache...');
      const cachedUser = await userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'profilePicture',
        result.secure_url
      ) as IUserDocument;

      console.log('✅ Cache updated, emitting socket event...');
      socketIOImageObject.emit('update user', cachedUser);

      console.log('✅ Adding to queue...');
      await imageQueue.addImageJob('addUserProfileImageToDB', {
        key: `${req.currentUser!.userId}`,
        value: result.secure_url,
        imgId: result.public_id,
        imgVersion: String(result.version)
      });

      console.log('✅ Profile image upload completed successfully');
      res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
    } catch (error) {
      console.error('❌ Profile image upload failed:', error);
      throw error;
    }
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { version, publicId }: IBgUploadResponse = await Add.prototype.backgroundUpload(req.body.image);

    const [bgIdDoc, bgVerDoc] = await Promise.all([
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageId',
        publicId
      ) as Promise<IUserDocument>,
      userCache.updateSingleUserItemInCache(
        `${req.currentUser!.userId}`,
        'bgImageVersion',
        version
      ) as Promise<IUserDocument>
    ]);

    // Send a clear payload (id, not a whole doc)
    socketIOImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: req.currentUser!.userId
    });

    // Await the queue operation here too
    await imageQueue.addImageJob('updateBGImageInDB', {
      key: `${req.currentUser!.userId}`,
      imgId: publicId,
      imgVersion: String(version)
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Image added successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const result: UploadApiResponse = (await uploads(image, undefined, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File upload: Error occurred. Try again.');
    }
    return { version: String(result.version), publicId: result.public_id };
  }
}
