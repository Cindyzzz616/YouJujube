from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi

# Your API key
api_key = 'AIzaSyBT2UKWCmrb9DcK_OLGSegbkd8WDE3-XBI'
youtube = build('youtube', 'v3', developerKey=api_key)

def get_video_details(video_id):
    request = youtube.saved_videos().list(
        part='snippet,contentDetails,statistics',
        id=video_id
    )
    response = request.execute()
    return response['items'][0]['snippet']

video_id = 'dQw4w9WgXcQ'  # Replace with your desired video ID
video_details = get_video_details(video_id)
print(video_details)


# Getting the transcript of the video

def get_transcript(video_id):
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        return transcript
    except Exception as e:
        return f"Error: {str(e)}"

transcript = get_transcript(video_id)

# print(
#     transcript.video_id,
#     transcript.language,
#     transcript.language_code,
#     # whether it has been manually created or generated by YouTube
#     transcript.is_generated,
#     # whether this transcript can be translated or not
#     transcript.is_translatable,
#     # a list of languages the transcript can be translated to
#     transcript.translation_languages,
# )
#
# # fetch the actual transcript data
# print(transcript.fetch())
#
# # translating the transcript will return another transcript object
# print(transcript.translate('fr').fetch())

for entry in transcript:
    print(f"{entry['start']}s: {entry['text']}")
