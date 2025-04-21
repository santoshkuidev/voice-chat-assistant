import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Fade } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';

const SERVICE_URL = 'https://chat-bot-api-node.vercel.app/api/chat';
const TRANSCRIBE_URL = 'https://chat-bot-api-node.vercel.app/api/transcribe';

function App() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [reply, setReply] = useState('');
  const [shouldSend, setShouldSend] = useState(false);
  const [isMobileFallback, setIsMobileFallback] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recognitionRef = useRef(null);
  const lastTranscriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Helper: Check if browser supports Web Speech API
  const supportsSpeechRecognition = () => (
    'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  );


  // Start recording (speech or audio fallback)
  const handleRecord = async () => {
    setTranscript('');
    setReply('');
    setShouldSend(false);
    if (supportsSpeechRecognition()) {
      setIsMobileFallback(false);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        lastTranscriptRef.current = text;
        setTranscript(text);
      };
      recognition.onerror = (event) => {
        setReply('Speech recognition error: ' + event.error);
        setRecording(false);
      };
      recognition.onend = () => {
        setRecording(false);
        if (!transcript && lastTranscriptRef.current) {
          setTranscript(lastTranscriptRef.current);
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
    } else if (navigator.mediaDevices && window.MediaRecorder) {
      setIsMobileFallback(true);
      setRecording(true);
      audioChunksRef.current = [];
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        const mediaRecorder = new window.MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunksRef.current.push(event.data);
        };
        mediaRecorder.onstop = async () => {
          setTranscribing(true);
          setRecording(false);
          stream.getTracks().forEach(track => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          // Send to backend for transcription
          setReply('Transcribing...');
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'audio.webm');
            const response = await fetch(TRANSCRIBE_URL, {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
            setTranscribing(false);
            if (data.transcript) {
              setTranscript(data.transcript);
              setShouldSend(true);
            } else {
              setReply('No transcription was captured.');
            }
          } catch (err) {
            setTranscribing(false);
            setReply('Transcription failed.');
          }
        };
        mediaRecorder.start();
      } catch (err) {
        setReply('Microphone access denied or not supported.');
        setRecording(false);
      }
    } else {
      setReply('Speech recognition and microphone recording are not supported in this browser.');
    }
  };


  // Stop recording (speech or audio fallback)
  const handleStop = () => {
    if (isMobileFallback && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
      setRecording(false);
      setShouldSend(true);
    } else {
      setRecording(false);
      setShouldSend(true);
    }
  };


  useEffect(() => {
    // Use transcript or fallback to lastTranscriptRef.current
    if (shouldSend) {
      const messageToSend = transcript || lastTranscriptRef.current;
      if (messageToSend) {
        const send = async () => {
          try {
            const response = await fetch(SERVICE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: messageToSend }),
            });
            const data = await response.json();
            setReply(data.reply || 'No reply received.');
          } catch (err) {
            setReply('Error contacting service.');
          }
        };
        send();
      } else {
        setReply('No transcription was captured.');
      }
      setShouldSend(false);
    }
  }, [shouldSend, transcript]);

  return (
    <Box sx={{ height: '100vh', width: '100vw', bgcolor: '#23272a', display: 'flex', flexDirection: 'column', fontFamily: 'Roboto, sans-serif' }}>
      {/* Top 30%: Controls */}
      <Box sx={{ flex: '0 0 30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#2c2f33', boxShadow: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={handleRecord}
            disabled={recording || transcribing}
            sx={{
              borderRadius: '50%',
              minWidth: 72,
              minHeight: 72,
              bgcolor: '#d32f2f',
              boxShadow: '0 4px 16px rgba(211,47,47,0.2)',
              position: 'relative',
              p: 0,
              '&:hover': { bgcolor: '#b71c1c' },
              animation: recording ? 'pulse 1.2s infinite' : 'none',
              '@keyframes pulse': {
                '0%': { boxShadow: '0 0 0 0 rgba(211,47,47,0.7)' },
                '70%': { boxShadow: '0 0 0 12px rgba(211,47,47,0)' },
                '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)' },
              },
            }}
          >
            <FiberManualRecordIcon sx={{ fontSize: 48 }} />
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStop}
            disabled={!recording || transcribing}
            sx={{
              borderRadius: '50%',
              minWidth: 72,
              minHeight: 72,
              bgcolor: '#424242',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(66,66,66,0.2)',
              p: 0,
              '&:hover': { bgcolor: '#1a1a1a' },
            }}
          >
            <StopIcon sx={{ fontSize: 40 }} />
          </Button>
        </Box>
        <Fade in={recording} unmountOnExit>
          <Typography variant="h6" color="error" sx={{ fontWeight: 500, letterSpacing: 1 }}>
            Recording... Speak now
          </Typography>
        </Fade>
        {transcribing && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={24} color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="#bdbdbd">Transcribing...</Typography>
          </Box>
        )}
        {!recording && transcript && !transcribing && (
          <Typography variant="subtitle1" color="#bdbdbd" sx={{ mt: 2 }}>
            You said: "{transcript}"
          </Typography>
        )}
      </Box>
      {/* Bottom 60%: Response */}
      <Box sx={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', bgcolor: '#18191c', p: 4 }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, minHeight: '60%', bgcolor: '#26282b', borderRadius: 4, p: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <Typography variant="h6" sx={{ color: '#eee', mb: 2, fontWeight: 700 }}>
            Assistant's Response
          </Typography>
          <Typography variant="body1" sx={{ color: reply ? '#fafafa' : '#888', whiteSpace: 'pre-wrap', minHeight: 48 }}>
            {reply || 'Response will appear here.'}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default App;
