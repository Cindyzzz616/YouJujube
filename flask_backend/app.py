import sys
import os
from flask import Flask, jsonify, request
from google.cloud import firestore
import re

# Add the backend directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.Entities.Video import Video

# Initialize Flask app
app = Flask(__name__)

# Initialize Firestore client
db = firestore.Client.from_service_account_json("serviceAccountKey.json")

@app.route("/videos", methods=["GET"])
def get_videos():
    try:
        # Reference to the "videos" collection
        videos_ref = db.collection("videos")
        docs = videos_ref.stream()

        # Collect all video documents
        videos = []
        for doc in docs:
            video = doc.to_dict()
            # Remove the document ID from the response
            videos.append(video)

        return jsonify({"success": True, "data": videos}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/check_video", methods=["POST"])
def check_video():
    try:
        data = request.get_json()
        youtube_link = data.get("youtube_link")
        
        # Extract video ID from YouTube link
        video_id_match = re.search(r"v=([^&]+)", youtube_link)
        if not video_id_match:
            return jsonify({"success": False, "error": "Invalid YouTube link"}), 400
        
        video_id = video_id_match.group(1)
        print(f"Extracted video_id: {video_id}", flush=True)  # Print the video_id for debugging
        
        # Check if video ID exists in Firestore
        videos_ref = db.collection("videos")
        query = videos_ref.where("id", "==", video_id).stream()
        video_doc = next(query, None)
        
        if video_doc:
            video_data = video_doc.to_dict()
            return jsonify({"success": True, "exists": True, "data": video_data}), 200
        else:
            try:
                # Create a Video object and fetch its details
                video = Video(videoId=video_id, native_language="en")  # Assuming native_language is "en"
                video.add_video_details()
                video.add_transcripts()
                video.add_difficulty()
                
                video_data = {
                    "videoId": video.videoId,
                    "title": video.title,
                    "description": video.description,
                    "duration": video.duration,
                    "thumbnails": video.thumbnails,
                    "channelId": video.channelId,
                    "channelTitle": video.channelTitle,
                    "video_language": video.video_language,
                    "transcripts": video.transcripts,
                    "final_levels": video.final_levels,
                    "native_language": video.native_language,
                    "view_count": video.view_count
                }
                
                # Save video_data to Firestore
                videos_ref.document(video_id).set(video_data)
                
                print(f"Fetched and saved video details for video_id: {video_id}", flush=True)  # Print success message
                return jsonify({"success": True, "exists": False, "data": video_data}), 200
            except Exception as e:
                print(f"Failed to fetch video details for video_id: {video_id}, error: {str(e)}", flush=True)  # Print error message
                return jsonify({"success": False, "error": f"Failed to fetch video details: {str(e)} (video_id: {video_id})"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": f"{str(e)} (video_id: {video_id})"}), 500

if __name__ == "__main__":
    app.run(debug=True)
