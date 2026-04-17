# this file is responsible for handling interactions with the Cloudinary API, such as uploading files and retrieving URLs. It uses the Cloudinary Python SDK to perform these operations. The configuration for Cloudinary is set up using environment variables to keep sensitive information secure.
import cloudinary
import cloudinary.uploader
import os

# Configure Cloudinary with credentials from environment variables
cloudinary.config(
    cloud_name=os.getenv("dnajlpzzf"),
    api_key=os.getenv("981827112162362"),
    api_secret=os.getenv("S2khxgJcCqwU6aV_C_-P5iXDBN8"),
)

def upload_file(file):
    result = cloudinary.uploader.upload(file)
    return result.get("secure_url")

