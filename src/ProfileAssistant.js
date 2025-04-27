import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, Paper, TextField, Avatar, IconButton, MenuItem, Select, Tooltip, Fade, CircularProgress, useMediaQuery } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import SendIcon from '@mui/icons-material/Send';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FuturisticBotImg from './assets/futuristic-bot.png';
import RetroBotImg from './assets/retro-bot.png';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const SERVICE_URL = 'https://chat-bot-api-node.vercel.app/api/chat';
const PROFILE_PROMPT = `👋 Hello! I'm your Virtual Chat Assistant. Ask me about Santosh Professional Experience!`;

const themes = {
  light: createTheme({
    palette: {
      mode: 'light',
      background: { default: '#f4f7fa', paper: '#fff' },
      primary: { main: '#1976d2' },
      secondary: { main: '#ff9800' },
    },
  }),
  retro: createTheme({
    palette: {
      mode: 'light',
      background: {
        default: 'linear-gradient(135deg, #fbe7b2 0%, #e9b87a 100%)',
        paper: '#f5e1c2',
      },
      primary: { main: '#2c6e7f' }, // teal
      secondary: { main: '#e9b87a' }, // orange
      accent: { main: '#fda858' },
      text: { primary: '#2c2c2c', secondary: '#e9b87a' },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: '#f5e1c2',
            boxShadow: '0 4px 32px 0 #e9b87a55',
            border: '2px solid #e9b87a',
            filter: 'grayscale(0.15) contrast(1.1)',
          },
        },
      },
    },
  }),
  futuristic: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: 'linear-gradient(135deg, #0a1823 0%, #05101a 100%)',
        paper: 'rgba(10, 24, 35, 0.25)', // glass effect
      },
      primary: { main: '#00f0ff' }, // neon cyan
      secondary: { main: '#1bffe4' },
      accent: { main: '#00f0ff' },
      text: { primary: '#e0f7fa', secondary: '#00f0ff' },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: 'rgba(10, 24, 35, 0.25)',
            boxShadow: '0 0 32px 0 #00f0ff55',
            border: '1.5px solid #00f0ff88',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          },
        },
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      background: { default: '#23272a', paper: '#26282b' },
      primary: { main: '#90caf9' },
      secondary: { main: '#fbc02d' },
    },
  }),
  aurora: createTheme({
    palette: {
      mode: 'dark',
      background: { default: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)', paper: 'rgba(36,37,42,0.92)' },
      primary: { main: '#43cea2' },
      secondary: { main: '#ff7e5f' },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: 'rgba(36,37,42,0.92)',
            boxShadow: '0 4px 32px 0 rgba(67,206,162,0.15)',
          },
        },
      },
    },
  }),
  neon: createTheme({
    palette: {
      mode: 'dark',
      background: { default: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)', paper: 'rgba(20,20,30,0.97)' },
      primary: { main: '#39ff14' }, // neon green
      secondary: { main: '#ff00de' }, // neon pink
      accent: { main: '#00fff7' }, // neon cyan
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            background: 'rgba(20,20,30,0.97)',
            boxShadow: '0 0 24px 2px #39ff14, 0 0 8px 2px #ff00de',
            border: '1.5px solid #39ff14',
          },
        },
      },
    },
  }),
};

const MODES = [
  { label: 'Bot Assistant', value: 'personal', enabled: true },
  { label: 'Work Assistant', value: 'work', enabled: false },
  { label: 'Fun Mode', value: 'fun', enabled: false },
];

const ChatBubble = styled(Paper)(({ theme, owner }) => {
  const isMobile = window.innerWidth <= 600;

  // Aggressive 3D glass effect for futuristic theme
  const isFuturistic = theme && theme.palette && theme.palette.mode === 'dark' && theme.palette.primary && theme.palette.primary.main === '#00f0ff';
  const isNeon = theme && theme.palette && theme.palette.primary && theme.palette.primary.main === '#39ff14';
  let boxShadow, border, background, borderRadius, overlay;
  if (isFuturistic) {
    boxShadow = [
      isMobile ? '0 4px 18px 4px #001a22cc' : '0 10px 40px 8px #001a22cc', // deep shadow
      isMobile ? '0 0 16px 2px #00f0ff99' : '0 0 32px 6px #00f0ff99',   // neon glow
      '0 1.5px 10px 0 #00f0ff55', // soft inner
      'inset 0 2px 16px 0 #00f0ff44', // inner glow
      isMobile ? '0 1px 4px 0 #fff3' : '0 2px 8px 0 #fff6' // highlight
    ].join(', ');
    border = isMobile ? '1.5px solid #00f0ffcc' : '2.5px solid #00f0ffcc';
    background = 'linear-gradient(180deg, rgba(10,24,35,0.44) 85%, rgba(0,240,255,0.09) 100%), rgba(10,24,35,0.30)';
    borderRadius = isMobile ? '14px' : '24px';
    overlay = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: isMobile ? '28%' : '38%',
      borderRadius: 'inherit',
      pointerEvents: 'none',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.19) 0%, rgba(0,0,0,0) 100%)',
      zIndex: 1,
    };
  } else if (isNeon) {
    boxShadow = '0 6px 32px 0 #111a0fcc, 0 0 16px 2px #39ff14cc, 0 1.5px 10px 0 #ff00de88';
    border = undefined;
    background = owner === 'assistant'
      ? theme.palette.background.paper
      : theme.palette.mode === 'dark'
      ? '#23272f'
      : '#f7f9fa';
    borderRadius = owner === 'assistant' ? '18px 18px 18px 6px' : '18px 18px 6px 18px';
    overlay = null;
  } else {
    boxShadow = '0 8px 32px 0 rgba(30,40,70,0.18), 0 1.5px 10px 0 rgba(60,60,60,0.13)';
    border = undefined;
    background = owner === 'assistant'
      ? theme.palette.background.paper
      : theme.palette.mode === 'dark'
      ? '#23272f'
      : '#f7f9fa';
    borderRadius = owner === 'assistant' ? '18px 18px 18px 6px' : '18px 18px 6px 18px';
    overlay = null;
  }
  return {
    maxWidth: isMobile ? '95%' : '80%',
    padding: isMobile ? '8px 12px' : '16px 24px',
    fontSize: isMobile ? 14 : 16,
    fontWeight: 600,
    letterSpacing: 0.1,
    margin: isMobile ? '4px 0' : '8px 0',
    alignSelf: owner === 'assistant' ? 'flex-start' : 'flex-end',
    borderRadius,
    boxShadow,
    marginLeft: owner === 'assistant' ? 0 : 'auto',
    marginRight: owner === 'assistant' ? 'auto' : 0,
    background,
    color: isFuturistic ? '#00f0ff' : theme.palette.text.primary,
    border,
    position: 'relative',
    overflow: 'hidden',
    backdropFilter: isFuturistic ? 'blur(16px) saturate(180%)' : undefined,
    WebkitBackdropFilter: isFuturistic ? 'blur(16px) saturate(180%)' : undefined,
    borderTopLeftRadius: owner === 'assistant' ? (isMobile ? 6 : 8) : (isMobile ? 18 : 24),
    borderTopRightRadius: owner === 'assistant' ? (isMobile ? 18 : 24) : (isMobile ? 6 : 8),
    transition: 'background 0.5s, box-shadow 0.5s',
    ...(isFuturistic && {
      '&::before': overlay
    })
  };
});

function ProfileAssistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: PROFILE_PROMPT }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('futuristic');
  const [profileMode, setProfileMode] = useState('personal');
  const isMobile = useMediaQuery('(max-width:600px)');
  const chatEndRef = useRef(null);

  // Voice recording state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isMobileFallback, setIsMobileFallback] = useState(false);
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
        setError('Speech recognition error: ' + event.error);
        setRecording(false);
      };
      recognition.onend = () => {
        setRecording(false);
        if (lastTranscriptRef.current) {
          setInput(lastTranscriptRef.current);
          setTimeout(() => {
            handleSend(lastTranscriptRef.current);
          }, 0);
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
          setTimeout(async () => {
            setTranscribing(true);
            setRecording(false);
            stream.getTracks().forEach(track => track.stop());
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            try {
              const formData = new FormData();
              formData.append('audio', audioBlob, 'audio.webm');
              const response = await fetch('https://chat-bot-api-node.vercel.app/api/transcribe', {
                method: 'POST',
                body: formData,
              });
              const data = await response.json();
              setTranscribing(false);
              if (data.transcript) {
                setTranscript(data.transcript);
                setInput(data.transcript);
                setTimeout(() => {
                  handleSend(data.transcript);
                }, 0);
              } else {
                setError('No transcription was captured.');
              }
            } catch (err) {
              setTranscribing(false);
              setError('Transcription failed.');
            }
          }, 0);
        };
        mediaRecorder.start();
      } catch (err) {
        setError('Microphone access denied or not supported.');
        setRecording(false);
      }
    } else {
      setError('Speech recognition and microphone recording are not supported in this browser.');
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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Send the message to the backend service with mode: 'profile'
  const handleSend = async (overrideInput) => {
    const messageToSend = (typeof overrideInput === 'string' ? overrideInput : input).trim();
    if (!messageToSend || loading) return;
    setLoading(true);
    setError(null);
    const userMsg = { sender: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    try {
      const response = await fetch(SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend, mode: 'profile', profileMode })
      });
      const data = await response.json();
      const assistantMsg = {
        sender: 'assistant',
        text: data.reply || 'No reply received.'
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError('Error contacting chat service.');
    } finally {
      setInput('');
      setLoading(false);
    }
  };


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Theme switcher button icon
  let themeIcon;
  switch (theme) {
    case 'light': themeIcon = <Brightness4Icon />; break;
    case 'dark': themeIcon = <AutoAwesomeIcon />; break;
    case 'aurora': themeIcon = <Brightness7Icon />; break;
    case 'neon': themeIcon = <AutoAwesomeIcon sx={{ color: '#39ff14', textShadow: '0 0 6px #39ff14, 0 0 12px #ff00de' }} />; break;
    default: themeIcon = <Brightness7Icon />;
  }

  // Cycle through all themes including neon
  const themeOrder = ['light', 'dark', 'aurora', 'neon', 'futuristic', 'retro'];
  const nextTheme = () => {
    const idx = themeOrder.indexOf(theme);
    setTheme(themeOrder[(idx + 1) % themeOrder.length]);
  }
  return (
    <>
      <ThemeProvider theme={themes[theme]}>
        <Box
        sx={{
          minHeight: '100vh',
          bgcolor: theme === 'aurora' ? 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)' : theme === 'futuristic' ? 'transparent' : 'background.default',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          fontFamily: 'Roboto, sans-serif',
          transition: 'background 0.7s',
          p: isMobile ? 'env(safe-area-inset-top, 12px) 0 env(safe-area-inset-bottom, 12px) 0' : 0,
          m: isMobile ? 0 : 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Animated backgrounds for all themes */}
        {theme === 'futuristic' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 0%, #00f0ff33 0%, #0a1823 60%, #05101a 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(90deg, #00f0ff22 0 2px, transparent 2px 80px), repeating-linear-gradient(180deg, #00f0ff22 0 2px, transparent 2px 80px)',
                opacity: 0.18,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(120deg, #00f0ff44 5%, transparent 60%), linear-gradient(240deg, #00f0ff22 5%, transparent 60%)',
                opacity: 0.11,
              },
              animation: 'tronGlow 8s linear infinite',
              '@keyframes tronGlow': {
                '0%': { filter: 'blur(0px) brightness(1.0)' },
                '50%': { filter: 'blur(2px) brightness(1.14)' },
                '100%': { filter: 'blur(0px) brightness(1.0)' },
              },
            }}
          />
        )}
        {theme === 'retro' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, #fbe7b2 0%, #e9b87a 80%, #f5e1c2 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(90deg, #e9b87a33 0 2px, transparent 2px 80px), repeating-linear-gradient(180deg, #e9b87a33 0 2px, transparent 2px 80px)',
                opacity: 0.11,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 80% 20%, #fff6e0 10%, transparent 80%)',
                opacity: 0.12,
              },
            }}
          />
        )}
        {theme === 'aurora' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 30% 80%, #43cea299 20%, transparent 70%), radial-gradient(circle at 80% 20%, #ff7e5f88 10%, transparent 70%)',
                opacity: 0.18,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(120deg, #43cea255 10%, transparent 60%), linear-gradient(240deg, #185a9d55 10%, transparent 60%)',
                opacity: 0.13,
              },
            }}
          />
        )}
        {theme === 'neon' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(90deg, #39ff1433 0 2px, transparent 2px 80px), repeating-linear-gradient(180deg, #ff00de33 0 2px, transparent 2px 80px)',
                opacity: 0.13,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 80% 20%, #ff00de22 10%, transparent 80%)',
                opacity: 0.11,
              },
            }}
          />
        )}
        {theme === 'dark' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 0%, #23272a 60%, #181a1b 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 70% 80%, #fbc02d33 10%, transparent 80%)',
                opacity: 0.10,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 20% 20%, #90caf922 10%, transparent 80%)',
                opacity: 0.09,
              },
            }}
          />
        )}
        {theme === 'light' && (
          <Box
            aria-hidden
            sx={{
              position: 'fixed',
              zIndex: 0,
              inset: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
              background: 'linear-gradient(135deg, #f4f7fa 0%, #e3ecfa 100%)',
              '::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 80% 20%, #1976d211 10%, transparent 80%)',
                opacity: 0.13,
              },
              '::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 20% 80%, #ff980011 10%, transparent 80%)',
                opacity: 0.09,
              },
            }}
          />
        )}
        {/* Header & Mode Switcher */}
        <Box sx={{ width: '100%', maxWidth: 600, mt: isMobile ? 1 : 4, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant={isMobile ? 'h6' : 'h4'}
            sx={{
              color: {
                futuristic: '#00f0ff',
                retro: '#2c6e7f',
                aurora: '#fff',
                neon: '#39ff14',
                dark: '#fff',
                light: '#1976d2',
              }[theme],
              fontWeight: 800,
              letterSpacing: 1,
              textShadow:
                theme === 'futuristic'
                  ? '0 0 12px #00f0ffcc, 0 0 32px #00f0ff44'
                  : theme === 'neon'
                  ? '0 0 10px #39ff14cc, 0 0 20px #ff00de66'
                  : theme === 'retro'
                  ? '0 2px 0 #fff7e2, 0 4px 12px #e9b87a55'
                  : theme === 'aurora'
                  ? '0 0 18px #43cea2cc, 0 0 24px #185a9dcc'
                  : undefined,
            }}
          >
            Virtual Bot
          </Typography>
          <Tooltip title="Switch Theme" placement="left">
            <Fade in>
              <IconButton
                onClick={nextTheme}
                sx={{ ml: 2, bgcolor: 'background.paper', boxShadow: 2 }}
                size="large"
              >
                {themeIcon}
              </IconButton>
            </Fade>
          </Tooltip>
        </Box>
        <Box sx={{ width: '100%', maxWidth: 600, px: 2, mt: 1, mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Select
            value={profileMode}
            onChange={e => setProfileMode(e.target.value)}
            variant="outlined"
            size={isMobile ? 'small' : 'medium'}
            sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 2 }}
            disabled
          >
            {MODES.map(mode => (
              <MenuItem key={mode.value} value={mode.value} disabled={!mode.enabled}>
                {mode.label} {mode.enabled ? '' : ' (coming soon)'}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {/* Chat Area */}
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 600,
            flex: 1,
            minHeight: isMobile ? undefined : 420,
            maxHeight: isMobile ? undefined : '60vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: theme === 'aurora' ? 'rgba(36,37,42,0.92)' : 'background.paper',
            borderRadius: isMobile ? 0 : 4,
            p: isMobile ? 1.5 : 4,
            mb: isMobile ? 0.5 : 2,
            mt: isMobile ? 0.5 : 2,
            boxShadow: theme === 'aurora' ? '0 4px 32px 0 rgba(67,206,162,0.15)' : 3,
            transition: 'background 0.7s',
            mx: isMobile ? 0 : 'auto',
            pb: isMobile ? '78px' : undefined, // reserve space for fixed input
          }}
        >
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-end', mb: 1, flexDirection: msg.sender === 'assistant' ? 'row' : 'row-reverse' }}>
              <Avatar sx={{
                bgcolor: msg.sender === 'assistant' ? 'primary.main' : 'secondary.main',
                mr: msg.sender === 'assistant' ? 2 : 0,
                ml: msg.sender !== 'assistant' ? 2 : 0,
                width: 44,
                height: 44,
                boxShadow:
                  theme === 'futuristic' && msg.sender === 'assistant'
                    ? '0 0 12px #00f0ff, 0 0 32px #00f0ff66'
                    : theme === 'retro' && msg.sender === 'assistant'
                    ? '0 4px 24px 0 #e9b87a99'
                    : undefined,
                border:
                  theme === 'retro' && msg.sender === 'assistant' ? '2px solid #e9b87a' : undefined,
                background:
                  theme === 'retro' && msg.sender === 'assistant' ? '#fbe7b2' : undefined,
              }}>
                {msg.sender === 'assistant' && theme === 'futuristic' ? (
                  <img src={FuturisticBotImg} alt="Futuristic Bot" style={{ width: 36, height: 36, borderRadius: '50%', filter: 'drop-shadow(0 0 8px #00f0ff)' }} />
                ) : msg.sender === 'assistant' && theme === 'retro' ? (
                  <img src={RetroBotImg} alt="Retro Bot" style={{ width: 36, height: 36, borderRadius: '50%', filter: 'contrast(1.1) sepia(0.3)' }} />
                ) : msg.sender === 'assistant' ? (
                  <SmartToyIcon />
                ) : (
                  <PersonIcon />
                )}
              </Avatar>
              <ChatBubble elevation={2} owner={msg.sender}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: isMobile ? 15 : 16 }}>{msg.text}</Typography>
              </ChatBubble>
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1, gap: 1 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <SmartToyIcon />
              </Avatar>
              <ChatBubble elevation={2} owner="assistant">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="primary" />
                  <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>Assistant is typing...</Typography>
                </Box>
              </ChatBubble>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Paper>
        {/* Error Message */}
        {error && (
          <Fade in>
            <Paper sx={{ bgcolor: 'error.main', color: '#fff', p: 2, mb: 2, borderRadius: 2, maxWidth: 600 }}>
              <Typography variant="body2">{error}</Typography>
            </Paper>
          </Fade>
        )}
        {/* Input Area */}
        <Paper
          elevation={6}
          sx={{
            width: '100%',
            maxWidth: 600,
            mx: isMobile ? 0 : 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: isMobile ? 1 : 2,
            borderRadius: isMobile ? '24px 24px 0 0' : 6,
            boxShadow: isMobile ? '0 -2px 32px 0 rgba(25,118,210,0.12)' : '0 4px 24px 0 rgba(25,118,210,0.09)',
            position: isMobile ? 'fixed' : 'static',
            bottom: isMobile ? 0 : 'unset',
            left: 0,
            right: 0,
            zIndex: 1300,
            bgcolor: 'background.paper',
            transition: 'box-shadow 0.4s',
            border: isMobile ? '1.5px solid #e0e0e0' : undefined,
            boxSizing: 'border-box',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type or use voice to interact.."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading || recording || transcribing}
            multiline={isMobile}
            minRows={isMobile ? 1 : 1}
            maxRows={isMobile ? 4 : 2}
            autoFocus
            sx={theme === 'futuristic' ? {
              bgcolor: 'rgba(10,24,35,0.30)',
              borderRadius: isMobile ? '1.3rem' : '2rem',
              boxShadow: isMobile
                ? '0 2px 12px 0 #001a22cc'
                : '0 6px 32px 0 #001a22cc',
              color: '#00f0ff',
              '& .MuiOutlinedInput-root': {
                borderRadius: isMobile ? '1.3rem' : '2rem',
                background: 'linear-gradient(180deg, rgba(10,24,35,0.44) 85%, rgba(0,240,255,0.09) 100%), rgba(10,24,35,0.30)',
                border: isMobile ? '1.5px solid #00f0ffcc' : '2.5px solid #00f0ffcc',
                boxShadow: isMobile
                  ? '0 2px 12px 0 #001a22cc'
                  : '0 6px 32px 0 #001a22cc',
                color: '#00f0ff',
                '& fieldset': {
                  borderColor: '#00f0ffcc',
                  borderRadius: isMobile ? '1.3rem' : '2rem',
                  transition: 'border-color 0.4s',
                },
                '&:hover fieldset': {
                  borderColor: '#00f0ff',
                  boxShadow: '0 0 8px #00f0ff88',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00f0ff',
                  boxShadow: '0 0 12px #00f0ffcc',
                },
                '& input': {
                  color: '#00f0ff',
                  fontSize: isMobile ? 15 : 17,
                  fontWeight: 600,
                  letterSpacing: 0.1,
                  background: 'transparent',
                },
              },
              mr: 1,
              transition: 'box-shadow 0.4s, background 0.4s',
              backdropFilter: 'blur(16px) saturate(180%)',
              WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            } : {
              bgcolor: 'background.paper',
              borderRadius: 4,
              boxShadow: 'none',
              '& fieldset': {
                borderRadius: '2rem',
                borderColor: 'primary.light',
              },
              fontSize: isMobile ? 15 : 17,
              mr: 1,
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            sx={theme === 'futuristic' ? {
              fontWeight: 700,
              minWidth: isMobile ? 48 : 56,
              minHeight: 48,
              borderRadius: '2rem',
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 1 : 2,
              fontSize: isMobile ? 22 : 26,
              background: 'linear-gradient(180deg, rgba(10,24,35,0.44) 85%, rgba(0,240,255,0.09) 100%), rgba(10,24,35,0.30)',
              color: '#00f0ff',
              border: isMobile ? '1.5px solid #00f0ffcc' : '2.5px solid #00f0ffcc',
              boxShadow: isMobile
                ? '0 2px 12px 0 #001a22cc, 0 0 8px #00f0ff44'
                : '0 6px 32px 0 #001a22cc, 0 0 16px #00f0ff44',
              transition: 'background 0.4s, box-shadow 0.4s',
              '&:hover': {
                background: 'linear-gradient(180deg, rgba(0,240,255,0.18) 85%, rgba(10,24,35,0.30) 100%)',
                boxShadow: '0 0 20px #00f0ffcc, 0 0 8px #00f0ff44',
                color: '#00f0ff',
                borderColor: '#00f0ff',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
                color: '#00f0ff99',
                borderColor: '#00f0ff44',
              },
            } : {
              fontWeight: 700,
              minWidth: isMobile ? 48 : 56,
              minHeight: 48,
              borderRadius: '2rem',
              boxShadow: '0 2px 8px rgba(25,118,210,0.13)',
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 1 : 2,
              fontSize: isMobile ? 22 : 26,
            }}
          >
            <SendIcon sx={{ fontSize: isMobile ? 22 : 26 }} />
          </Button>
          <IconButton
            onClick={recording ? handleStop : handleRecord}
            color={recording ? 'error' : 'primary'}
            disabled={loading || transcribing}
            sx={theme === 'futuristic' ? {
              minWidth: isMobile ? 48 : 56,
              minHeight: 48,
              borderRadius: '2rem',
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 1 : 2,
              fontSize: isMobile ? 26 : 28,
              background: recording
                ? 'linear-gradient(90deg, #ff1744 0%, #ff8a65 100%)'
                : 'linear-gradient(180deg, rgba(10,24,35,0.44) 85%, rgba(0,240,255,0.09) 100%), rgba(10,24,35,0.30)',
              color: recording ? '#ff1744' : '#00f0ff',
              border: isMobile ? '1.5px solid #00f0ffcc' : '2.5px solid #00f0ffcc',
              boxShadow: isMobile
                ? '0 2px 12px 0 #001a22cc, 0 0 8px #00f0ff44'
                : '0 6px 32px 0 #001a22cc, 0 0 16px #00f0ff44',
              transition: 'background 0.4s, box-shadow 0.4s',
              '&:hover': {
                background: recording
                  ? 'linear-gradient(90deg, #d50000 0%, #ff1744 100%)'
                  : 'linear-gradient(180deg, rgba(0,240,255,0.18) 85%, rgba(10,24,35,0.30) 100%)',
                boxShadow: '0 0 20px #00f0ffcc, 0 0 8px #00f0ff44',
                color: recording ? '#ff1744' : '#00f0ff',
                borderColor: '#00f0ff',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
                color: '#00f0ff99',
                borderColor: '#00f0ff44',
              },
            } : {
              minWidth: isMobile ? 48 : 56,
              minHeight: 48,
              borderRadius: '2rem',
              boxShadow: '0 2px 8px rgba(25,118,210,0.13)',
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 1 : 2,
              fontSize: isMobile ? 26 : 28,
            }}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording ? <StopIcon sx={{ fontSize: isMobile ? 26 : 28 }} /> : <MicIcon sx={{ fontSize: isMobile ? 26 : 28 }} />}
          </IconButton>
          {transcribing && (
            <CircularProgress size={22} color="primary" sx={{ mr: 1 }} />
          )}
          {transcribing && (
            <Typography variant="body2" color="text.secondary">Transcribing...</Typography>
          )}
          {error && (
            <Fade in>
              <Typography variant="body2" color="error" sx={{ ml: 2 }}>{error}</Typography>
            </Fade>
          )}
      </Paper>
    </Box>
  </ThemeProvider>
</>)
}

export default ProfileAssistant;