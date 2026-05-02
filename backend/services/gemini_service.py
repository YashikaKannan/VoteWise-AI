print("NEW GEMINI CODE RUNNING")
# from google import genai
# import os

# def generate_reply(message, profile=None, history=None, eli5=False):
#     key = os.getenv("GEMINI_API_KEY")
#     if not key:
#         return "Missing API key", False

#     client = genai.Client(api_key=key)

#     prompt = f"Explain simply: {message}" if eli5 else message

#     try:
#         response = client.models.generate_content(
#             model="models/gemini-pro",
#             contents=prompt
#         )

#         return response.text, False

#     except Exception as e:
#         return f"Temporary AI error: {str(e)}", False



print("USING NEW GENAI SDK")
from google import genai
import os

def generate_reply(message, profile=None, history=None, eli5=False):
    key = os.getenv("GEMINI_API_KEY")

    if not key:
        return "Missing API key", False

    client = genai.Client(api_key=key)

    # prompt = f"Explain simply: {message}" if eli5 else message
    # prompt = f"""
    # Explain in very simple terms.

    # FORMAT STRICTLY IN MARKDOWN:
    # - Use headings with **
    # - Use bullet points with -
    # - Use proper spacing
    # - No long paragraphs

    # Example format:
    # **How to Register**
    # - Online: ...
    # - In person: ...

    # Now explain:

    # {message}
    # """ if eli5 else message
    lang = profile.preferred_language if profile else "en"

    prompt = f"""
    You are VoteWise AI.

    IMPORTANT:
    - Respond ONLY in this language: {lang}
    - Do NOT switch to English unless lang = en

    FORMAT:
    - Use simple words
    - Use bullet points
    - proper spacing
    - markdown formatting

    User question:
    {message}
    """

    if eli5:
        prompt += "\nExplain like I am a first-time voter (very simple)."


    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",  
            contents=prompt
        )

        return response.text, False

    except Exception as e:
        return f"Temporary AI error: {str(e)}", False