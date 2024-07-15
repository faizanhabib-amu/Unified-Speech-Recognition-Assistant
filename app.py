import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import logging
from flask import Flask, request, jsonify, render_template
import numpy as np
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
import pickle
import speech_recognition as sr
<<<<<<< HEAD
from pydub import AudioSegment

AudioSegment.converter = "C:/ffmpeg/bin/ffmpeg.exe"
=======
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb

app = Flask(__name__)

# Load the model and tokenizer
model = load_model('emotion_detection_model.keras')
with open('tokenizer.pickle', 'rb') as handle:
    tokenizer = pickle.load(handle)

# Define the emotion labels
emotion_labels = {0: 'Neutral', 1: 'Happy', 2: 'Sad', 3: 'Love', 4: 'Anger'}

# Function to preprocess the input sentence
def preprocess_sentence(sentence, tokenizer, max_len=100):
    sequence = tokenizer.texts_to_sequences([sentence])
    padded_sequence = pad_sequences(sequence, maxlen=max_len, padding='post')
    return padded_sequence

# Function to predict the emotion
def predict_emotion(sentence, model, tokenizer, max_len=100):
    padded_sequence = preprocess_sentence(sentence, tokenizer, max_len)
    prediction = model.predict(padded_sequence)
    emotion_index = np.argmax(prediction)
    return emotion_index, prediction

@app.route('/')
def index():
    return render_template('index.html')

<<<<<<< HEAD
UPLOAD_FOLDER = r'C:\Users\mrsha\Desktop\App\RecordedFiles'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def convert_to_wav(file_path):
    try:
        logging.info(f'Starting conversion of file to WAV: {file_path}')
        audio = AudioSegment.from_file(file_path)
        audio = audio.set_frame_rate(16000).set_channels(1).set_sample_width(2)
        wav_path = os.path.splitext(file_path)[0] + '.wav'
        audio.export(wav_path, format='wav')
        logging.info(f'Conversion successful, saved to: {wav_path}')
        return wav_path
    except Exception as e:
        logging.error(f'Error converting file to WAV: {e}')
        raise
=======
@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    text = data['text']
    
    # Predict emotion
    emotion_index, prediction = predict_emotion(text, model, tokenizer)
    predicted_emotion = emotion_labels[emotion_index]

    return jsonify({'prediction': predicted_emotion})

import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = r'C:\Users\Faizan Habib\Desktop\App\RecordedFiles'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb

@app.route('/upload', methods=['POST'])
def upload_audio():
    try:
        audio_file = request.files['audio']
        if audio_file:
<<<<<<< HEAD
=======
            # Save the audio file to the specified directory
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb
            save_path = os.path.join(UPLOAD_FOLDER, 'uploaded_audio.wav')
            audio_file.save(save_path)
            logging.info(f'Audio file saved successfully to: {save_path}')

<<<<<<< HEAD
            # Convert to WAV with correct format if necessary
            converted_path = convert_to_wav(save_path)
            logging.info(f'Audio file converted to WAV format: {converted_path}')

            # Process the audio file and convert it to text
            transcription = process_audio(converted_path)
            if transcription is None:
                logging.error('Transcription failed')
                return jsonify({'error': 'Transcription failed'}), 500

            logging.info(f'Transcription: {transcription}')
            return jsonify({'message': 'Audio uploaded and transcribed successfully', 'transcription': transcription, 'audio_path': converted_path})
=======
            # Process the audio file and convert it to text
            transcription = process_audio(save_path)

            # Log the transcription
            logging.info(f'Transcription: {transcription}')

            return jsonify({'message': 'Audio uploaded and transcribed successfully', 'transcription': transcription, 'audio_path': save_path})
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb
        else:
            logging.error('No audio file received')
            return jsonify({'error': 'No audio file received'}), 400
    except Exception as e:
        logging.error(f'Error during audio upload: {e}')
        return jsonify({'error': f'Error during audio upload: {e}'}), 500

<<<<<<< HEAD
def process_audio(audio_path):
    try:
=======
# Function to process audio and convert it to text
def process_audio(audio_path):
    try:
        import speech_recognition as sr
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_path) as source:
            audio_data = recognizer.record(source)
            transcription = recognizer.recognize_google(audio_data)
        return transcription
<<<<<<< HEAD
    except sr.UnknownValueError:
        logging.error('Speech Recognition could not understand audio')
        return None
    except sr.RequestError as e:
        logging.error(f'Could not request results from Google Speech Recognition service; {e}')
        return None
=======
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb
    except Exception as e:
        logging.error(f'Error processing audio: {e}')
        return None


@app.route('/predict_emotion_and_histogram', methods=['POST'])
def predict_emotion_and_histogram():
    data = request.get_json()
    text = data['text']
    
    # Predict emotion
    emotion_index, prediction = predict_emotion(text, model, tokenizer)
    predicted_emotion = emotion_labels[emotion_index]

    # Calculate emotion distribution percentages
    total_predictions = np.sum(prediction)
    percentages = [(emotion_labels[i], (prediction[0][i] / total_predictions) * 100) for i in range(len(emotion_labels))]

    return jsonify({'prediction': predicted_emotion, 'percentages': percentages})

if __name__ == '__main__':
<<<<<<< HEAD
    logging.basicConfig(level=logging.INFO)
=======
>>>>>>> 6ebf796a5e51c2baaa2b7a146be3c10dbba557fb
    app.run(debug=True)
