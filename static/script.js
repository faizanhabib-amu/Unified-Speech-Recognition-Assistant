// Handle the recording
let mediaRecorder;
let chunks = [];

const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(blob);
            const audio = document.getElementById('recordedAudio');
            audio.src = audioUrl;
            audio.style.display = 'block';
            chunks = []; // Clear the chunks array for the next recording
            styleAudioElement(); // Style the audio element

            // Store the blob for submission
            audio.blob = blob;

            // Stop the media stream
            stream.getTracks().forEach(track => {
                track.stop();
            });
        };
        mediaRecorder.start();
        document.getElementById('startRecording').disabled = true;
        document.getElementById('stopRecording').disabled = false;
    } catch (error) {
        console.error('Error starting recording:', error);
    }
};

const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        document.getElementById('startRecording').disabled = false;
        document.getElementById('stopRecording').disabled = true;
    }
};

// Function to style the audio element
const styleAudioElement = () => {
    const audio = document.getElementById('recordedAudio');
    audio.style.width = '90%';
    audio.style.height = '10%'
    audio.style.backgroundColor = '#f2f2f2';
    audio.style.borderRadius = '50px';
    audio.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    audio.style.padding = '15px';
    audio.style.marginTop = '5px';
};

// Adding event listeners to the buttons
document.getElementById('startRecording').addEventListener('click', startRecording);
document.getElementById('stopRecording').addEventListener('click', stopRecording);

// Handle recorded audio file submission
document.getElementById('submitRecording').addEventListener('click', async () => {
    const audioElement = document.getElementById('recordedAudio');
    const audioBlob = audioElement.blob;

    if (!audioBlob) {
        alert('Record the audio first!');
        return; // Stop execution if no audio is recorded
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        document.getElementById('textInput').value = data.transcription;
    } catch (error) {
        console.error('Error:', error);
        alert('Record again');
    }
});


// Handle wav audio file submission
document.getElementById('submitAudio').addEventListener('click', async () => {
    const audioFile = document.getElementById('audioFile').files[0];

    if (!audioFile) {
        alert('Upload the file first!');
        return; // Stop execution if no file is uploaded
    }

    const formData = new FormData();
    formData.append('audio', audioFile);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        document.getElementById('textInput').value = data.transcription;
    } catch (error) {
        console.error('Error:', error);
        alert('Upload another file.');
    }
});

////////      Make Predictions      /////////
document.addEventListener('DOMContentLoaded', function () {
    const submitTextButton = document.getElementById('submitText');
    const textInput = document.getElementById('textInput');

    // Event listener for the button click
    submitTextButton.addEventListener('click', async () => {
        const textInputValue = textInput.value;

        try {
            const response = await fetch('/predict_emotion_and_histogram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: textInputValue })
            });

            const result = await response.json();
            console.log('Prediction result:', result);

            // Update the emotion result in the HTML
            const emotionResultDiv = document.getElementById('emotionResult');
            emotionResultDiv.querySelector('p')?.remove();
            emotionResultDiv.insertAdjacentHTML('beforeend', `
                <div>
                    
                </div>
            `);

            // Update the sentiment result in the HTML
            const sentimentResultDiv = document.getElementById('sentimentResult');
            const sentiment = getSentiment(result.prediction);
            sentimentResultDiv.querySelector('p')?.remove();
            sentimentResultDiv.insertAdjacentHTML('beforeend', `
                <div>
                    
                </div>
            `);

            // Update emoji display based on emotion
            showEmotionEmoji(result.prediction.toLowerCase());

            // Update emoji display based on sentiment
            showSentimentEmoji(sentiment.toLowerCase());

            // Update the histogram in the HTML
            plotEmotionHistogram(result.percentages);
            plotSentimentHistogram(result.percentages);
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while making the prediction.');
        }
    });

    // Event listener for the Enter key press
    textInput.addEventListener('keypress', async function (event) {
        if (event.key === 'Enter') {
            // Call the handleSubmit function
            submitTextButton.click(); // Simulate a click on the submitTextButton
        }
    });

    // Sentiment extraction from emotions
    function getSentiment(emotion) {
        const positiveEmotions = ['happy', 'love'];
        const negativeEmotions = ['sad', 'anger'];

        if (positiveEmotions.includes(emotion.toLowerCase())) {
            return 'Positive';
        } else if (negativeEmotions.includes(emotion.toLowerCase())) {
            return 'Negative';
        } else {
            return 'Neutral';
        }
    }

    // Emotion Emoji Handle
    function showEmotionEmoji(emotionInput) {
        const emotions = {
            happy: document.getElementById('happyEmoji'),
            love: document.getElementById('loveEmoji'),
            neutral: document.getElementById('neutralEmoji'),
            sad: document.getElementById('sadEmoji'),
            anger: document.getElementById('angerEmoji')
        };

        const emotionTextDiv = document.querySelector('.emotion-text');
        emotionTextDiv.textContent = emotionInput.charAt(0).toUpperCase() + emotionInput.slice(1);

        // Hide all emojis
        for (let key in emotions) {
            if (emotions[key]) {
                emotions[key].classList.add('hidden-emoji');
            }
        }

        // Show the relevant emoji
        if (emotions[emotionInput]) {
            emotions[emotionInput].classList.remove('hidden-emoji');
        } else {
            console.error(`Error: Emotion "${emotionInput}" not recognized.`);
        }
    }

    // Sentiment Emoji Handle
    function showSentimentEmoji(sentimentInput) {
        const sentiments = {
            positive: document.getElementById('positiveEmoji'),
            neutral: document.getElementById('neutralSentimentEmoji'),
            negative: document.getElementById('negativeEmoji')
        };

        const sentimentTextDiv = document.querySelector('.sentiment-text');
        sentimentTextDiv.textContent = sentimentInput.charAt(0).toUpperCase() + sentimentInput.slice(1);

        // Hide all emojis
        for (let key in sentiments) {
            if (sentiments[key]) {
                sentiments[key].classList.add('hidden-emoji');
            }
        }

        // Show the relevant emoji
        if (sentiments[sentimentInput]) {
            sentiments[sentimentInput].classList.remove('hidden-emoji');
        } else {
            console.error(`Error: Sentiment "${sentimentInput}" not recognized.`);
        }
    }

    // Function to plot emotion histogram
    function plotEmotionHistogram(percentages) {
        const ctx = document.getElementById('histogramEmotionChart').getContext('2d');

        // Destroy the existing chart if it exists
        if (window.emotionChart) {
            window.emotionChart.destroy();
        }

        // Create a new chart
        window.emotionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: percentages.map(p => p[0]),
                datasets: [{
                    label: 'Emotion Distribution',
                    data: percentages.map(p => p[1]),
                    backgroundColor: ['gray', 'green', 'red', 'pink', 'orange']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Function to plot sentiment histogram
    function plotSentimentHistogram(percentages) {
        const ctx = document.getElementById('histogramSentimentChart').getContext('2d');

        // Define the emotion to sentiment mapping
        const sentimentMapping = {
            'Neutral': 'Neutral',
            'Happy': 'Positive',
            'Sad': 'Negative',
            'Love': 'Positive',
            'Anger': 'Negative'
        };

        // Initialize the sentiment aggregation
        const sentimentScores = { 'Positive': 0, 'Neutral': 0, 'Negative': 0 };

        // Aggregate the emotion percentages into sentiments
        percentages.forEach(p => {
            const emotion = p[0];
            const percentage = p[1];
            const sentiment = sentimentMapping[emotion];
            sentimentScores[sentiment] += percentage;
        });

        // Convert the aggregated sentiments into a format suitable for Chart.js
        const sentiments = Object.keys(sentimentScores);
        const sentimentPercentages = sentiments.map(sentiment => sentimentScores[sentiment]);

        // Destroy the existing chart if it exists
        if (window.sentimentChart) {
            window.sentimentChart.destroy();
        }

        // Create a new chart
        window.sentimentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sentiments,
                datasets: [{
                    label: 'Sentiment Distribution',
                    data: sentimentPercentages,
                    backgroundColor: ['green', 'gray', 'red']
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
});
