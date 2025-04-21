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
    lastTranscriptRef.current = '';
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
      recognition.onend = async () => {
        setRecording(false);
        const message = transcript || lastTranscriptRef.current;
        if (message) {
          try {
            const response = await fetch(SERVICE_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message }),
            });
            const data = await response.json();
            setReply(data.reply || 'No reply received.');
          } catch (err) {
            setReply('Error contacting chat service.');
          } finally {
            setTranscript('');
            lastTranscriptRef.current = '';
          }
        } else {
          setTranscript('');
          lastTranscriptRef.current = '';
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
          // Wait a tick to ensure ondataavailable has fired
          setTimeout(async () => {
            setTranscribing(true);
            setRecording(false);
            stream.getTracks().forEach(track => track.stop());
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
                // Call chat service directly
                try {
                  const chatResponse = await fetch(SERVICE_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: data.transcript }),
                  });
                  const chatData = await chatResponse.json();
                  setReply(chatData.reply || 'No reply received.');
                } catch (err) {
                  setReply('Error contacting chat service.');
                } finally {
                  setTranscript('');
                  lastTranscriptRef.current = '';
                }
              } else {
                setReply('No transcription was captured.');
                setTranscript('');
                lastTranscriptRef.current = '';
              }
            } catch (err) {
              setTranscribing(false);
              setReply('Transcription failed.');
            }
          }, 0);
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
      
    } else {
      setRecording(false);
      
    }
  };



  return (
    <Box sx={{ minHeight: '100vh', height: '100dvh', width: '100vw', bgcolor: '#23272a', display: 'flex', flexDirection: 'column', fontFamily: 'Roboto, sans-serif', position: 'relative' }}>
      {/* Top: Assistant's Response */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', bgcolor: '#18191c', p: 4 }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 700, bgcolor: '#26282b', borderRadius: 4, p: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
          <Typography variant="h6" sx={{ color: '#eee', mb: 2, fontWeight: 700 }}>
            Assistant's Response
          </Typography>
          <Typography variant="body1" sx={{ color: '#cfd8dc', whiteSpace: 'pre-line' }}>
            {reply || 'No response yet.'}
          </Typography>
          {!recording && transcript && !transcribing && (
            <Typography variant="subtitle1" color="#bdbdbd" sx={{ mt: 2 }}>
              You said: "{transcript}"
            </Typography>
          )}
        </Paper>
        {transcribing && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <CircularProgress size={24} color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="#bdbdbd">Transcribing...</Typography>
          </Box>
        )}
      </Box>
      {/* Bottom: Controls section */}
      <Box sx={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', bgcolor: '#2c2f33', boxShadow: 2, pb: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', mr: 3, zIndex: 10 }}>
        <Button
          variant="contained"
          color={recording ? 'primary' : 'error'}
          size="large"
          onClick={recording ? handleStop : handleRecord}
          disabled={transcribing}
          sx={{
            borderRadius: '50%',
            minWidth: 72,
            minHeight: 72,
            bgcolor: recording ? '#424242' : '#d32f2f',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(211,47,47,0.2)',
            position: 'relative',
            p: 0,
            '&:hover': { bgcolor: recording ? '#1a1a1a' : '#b71c1c' },
            animation: recording ? 'pulse 1.2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': { boxShadow: '0 0 0 0 rgba(211,47,47,0.7)' },
              '70%': { boxShadow: '0 0 0 12px rgba(211,47,47,0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)' },
            },
          }}
        >
          {recording ? <StopIcon sx={{ fontSize: 48 }} /> : <FiberManualRecordIcon sx={{ fontSize: 48 }} />}
        </Button>
        <Fade in={recording} unmountOnExit>
          <Typography variant="h6" color="error" sx={{ fontWeight: 500, letterSpacing: 1, mt: 2 }}>
            Recording... Speak now
          </Typography>
        </Fade>
      </Box>
    </Box>
  );
}

export default App;
