import cloudinary, { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export function uploads(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  console.log('🚀 uploads function called');
  console.log('📁 File type:', typeof file);
  console.log('📁 File length:', file?.length || 0);
  console.log('📁 File starts with data:', file?.startsWith('data:'));
  
  // Check Cloudinary configuration
  console.log('🔧 Checking Cloudinary config...');
  console.log('   Cloud name:', cloudinary.v2.config().cloud_name);
  console.log('   API key exists:', !!cloudinary.v2.config().api_key);
  console.log('   API secret exists:', !!cloudinary.v2.config().api_secret);
  
  if (!cloudinary.v2.config().cloud_name || !cloudinary.v2.config().api_key || !cloudinary.v2.config().api_secret) {
    console.error('❌ Cloudinary not properly configured!');
    return Promise.resolve({ message: 'Cloudinary not configured' } as UploadApiErrorResponse);
  }
  
  return new Promise((resolve) => {
    // If it's a base64 string, convert to buffer first
    if (file.startsWith('data:image/') || file.startsWith('data:video/') || file.startsWith('data:/image/') || file.startsWith('data:/video/')) {
      console.log('✅ Detected base64 data, converting to buffer...');
      try {
        // Remove the data URL prefix and convert to buffer
        let base64Data = file;
        if (file.startsWith('data:/image/') || file.startsWith('data:/video/')) {
          base64Data = file.replace(/^data:\/(image|video)\/\w+;base64,/, '');
        } else {
          base64Data = file.replace(/^data:(image|video)\/\w+;base64,/, '');
        }
        console.log('📊 Base64 data length after cleanup:', base64Data.length);
        console.log('📊 Base64 data preview (first 50 chars):', base64Data.substring(0, 50));
        
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('📦 Buffer created, size:', buffer.length);
        
        // Validate buffer size (should be reasonable for an image)
        if (buffer.length < 100) {
          console.error('❌ Buffer too small, likely corrupted base64 data');
          resolve({ message: 'Invalid image data - file too small' } as UploadApiErrorResponse);
          return;
        }
        
        // Upload the buffer using upload_stream
        console.log('📤 Creating upload stream...');
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            public_id,
            overwrite,
            invalidate,
            resource_type: (file.startsWith('data:video/') || file.startsWith('data:/video/')) ? 'video' : 'image'
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            console.log('🔄 Upload callback triggered');
            console.log('🔄 Error:', error);
            console.log('🔄 Result:', result);
            
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              // Add more specific error handling
              if (error.message === 'Invalid image file') {
                console.error('❌ Invalid image file - this usually means corrupted base64 data');
                console.error('❌ Try checking if the image data is properly formatted');
              }
              resolve(error);
            } else {
              console.log('✅ Cloudinary upload success:', { public_id: result?.public_id, version: result?.version });
              resolve(result);
            }
          }
        );
        
        console.log('📤 Writing buffer to stream...');
        // Write buffer to stream
        uploadStream.end(buffer);
        console.log('✅ Buffer written to stream');
        
        // Add a timeout to prevent hanging
        setTimeout(() => {
          console.log('⏰ Upload timeout - no response received');
          resolve({ message: 'Upload timeout' } as UploadApiErrorResponse);
        }, 30000); // 30 second timeout
      } catch (err) {
        console.error('❌ Error in base64 processing:', err);
        resolve({ message: 'Error processing image data' } as UploadApiErrorResponse);
      }
    } else {
      console.log('📁 Using regular file upload method...');
      // For regular file paths, use the original method
      cloudinary.v2.uploader.upload(
        file,
        {
          public_id,
          overwrite,
          invalidate
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('❌ Regular upload error:', error);
            resolve(error);
          } else {
            console.log('✅ Regular upload success:', { public_id: result?.public_id, version: result?.version });
            resolve(result);
          }
        }
      );
    }
  });
}

export function videoUpload(
  file: string,
  public_id?: string,
  overwrite?: boolean,
  invalidate?: boolean
): Promise<UploadApiResponse | UploadApiErrorResponse | undefined> {
  console.log('🎥 videoUpload function called');
  console.log('📁 File type:', typeof file);
  console.log('📁 File length:', file?.length || 0);
  
  return new Promise((resolve) => {
    // If it's a base64 string, convert to buffer first
    if (file.startsWith('data:video/') || file.startsWith('data:/video/')) {
      console.log('✅ Detected base64 video data, converting to buffer...');
      try {
        // Remove the data URL prefix and convert to buffer
        let base64Data = file;
        if (file.startsWith('data:/video/')) {
          base64Data = file.replace(/^data:\/video\/\w+;base64,/, '');
        } else {
          base64Data = file.replace(/^data:video\/\w+;base64,/, '');
        }
        console.log('📊 Base64 video data length after cleanup:', base64Data.length);
        console.log('📊 Base64 video data preview (first 50 chars):', base64Data.substring(0, 50));
        
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('📦 Video buffer created, size:', buffer.length);
        
        // Validate buffer size (should be reasonable for a video)
        if (buffer.length < 100) {
          console.error('❌ Video buffer too small, likely corrupted base64 data');
          resolve({ message: 'Invalid video data - file too small' } as UploadApiErrorResponse);
          return;
        }
        
        // Upload the buffer using upload_stream
        console.log('📤 Creating video upload stream...');
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          {
            resource_type: 'video',
            chunk_size: 50000,
            public_id,
            overwrite,
            invalidate
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              console.error('❌ Video upload error:', error);
              resolve(error);
            } else {
              console.log('✅ Video upload success:', { public_id: result?.public_id, version: result?.version });
              resolve(result);
            }
          }
        );
        
        console.log('📤 Writing video buffer to stream...');
        // Write buffer to stream
        uploadStream.end(buffer);
        console.log('✅ Video buffer written to stream');
      } catch (err) {
        console.error('❌ Error in video base64 processing:', err);
        resolve({ message: 'Error processing video data' } as UploadApiErrorResponse);
      }
    } else {
      console.log('📁 Using regular video file upload method...');
      // For regular file paths, use the original method
      cloudinary.v2.uploader.upload(
        file,
        {
          resource_type: 'video',
          chunk_size: 50000,
          public_id,
          overwrite,
          invalidate
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            console.error('❌ Regular video upload error:', error);
            resolve(error);
          } else {
            console.log('✅ Regular video upload success:', { public_id: result?.public_id, version: result?.version });
            resolve(result);
          }
        }
      );
    }
  });
}
