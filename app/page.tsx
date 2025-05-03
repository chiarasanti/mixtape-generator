"use client";

import type React from "react";

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { La_Belle_Aurore, Cutive_Mono } from "next/font/google";

// Define fonts
const labelleAurore = La_Belle_Aurore({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const cutiveMono = Cutive_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Define types
type Song = {
  id: string;
  name: string;
  file: File;
  dataUrl: string;
};

type MixtapeStyle = "purple" | "pink" | "green" | "black";
type BackgroundColor = "purple" | "pink" | "green" | "cream";

export default function MixtapeGenerator() {
  // State for current step
  const [currentStep, setCurrentStep] = useState<number>(1);

  // State for uploaded songs
  const [songs, setSongs] = useState<Song[]>([]);

  // State for mixtape customization
  const [mixtapeStyle, setMixtapeStyle] = useState<MixtapeStyle>("purple");
  const [mixtapeTitle, setMixtapeTitle] = useState<string>("");
  const [mixtapeMessage, setMixtapeMessage] = useState<string>("");
  const [backgroundColor, setBackgroundColor] =
    useState<BackgroundColor>("purple");

  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check if adding these files would exceed the 5 file limit
    if (songs.length + files.length > 5) {
      toast({
        title: "Too many files",
        description: "You can only upload a maximum of 5 MP3 files.",
        variant: "destructive",
      });
      return;
    }

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (file.type !== "audio/mpeg") {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an MP3 file.`,
          variant: "destructive",
        });
        continue;
      }

      // Convert file to data URL for later use
      const dataUrl = await fileToDataUrl(file);

      // Add song to state
      setSongs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          file,
          dataUrl,
        },
      ]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Convert file to data URL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Remove song
  const removeSong = (id: string) => {
    setSongs((prev) => prev.filter((song) => song.id !== id));
  };

  // Navigate to next step
  const nextStep = () => {
    if (currentStep === 1 && songs.length === 0) {
      toast({
        title: "No songs added",
        description: "Please upload at least one MP3 file.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep === 2 && !mixtapeTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your mixtape.",
        variant: "destructive",
      });
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  // Navigate to previous step
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Reset everything
  const resetMixtape = () => {
    setSongs([]);
    setMixtapeStyle("purple");
    setMixtapeTitle("");
    setMixtapeMessage("");
    setBackgroundColor("purple");
    setCurrentStep(1);
  };

  // Helper function to get background color hex
  const getBackgroundColorHex = (color: BackgroundColor): string => {
    switch (color) {
      case "purple":
        return "#D7D8FF";
      case "pink":
        return "#E8DADB";
      case "green":
        return "#D5EFE5";
      case "cream":
        return "#F7F3EB";
      default:
        return "#D7D8FF";
    }
  };

  // Helper function to get cassette image path
  const getCassetteImagePath = (style: MixtapeStyle): string => {
    switch (style) {
      case "purple":
        return "/images/purple.png";
      case "pink":
        return "/images/pink.png";
      case "black":
        return "/images/black.png";
      case "green":
        return "/images/green.png";
      default:
        return "/images/purple.png";
    }
  };

  // Navigate to next cassette style
  const nextCassetteStyle = () => {
    const styles: MixtapeStyle[] = ["purple", "pink", "green", "black"];
    const currentIndex = styles.indexOf(mixtapeStyle);
    const nextIndex = (currentIndex + 1) % styles.length;
    setMixtapeStyle(styles[nextIndex]);
  };

  // Navigate to previous cassette style
  const prevCassetteStyle = () => {
    const styles: MixtapeStyle[] = ["purple", "pink", "green", "black"];
    const currentIndex = styles.indexOf(mixtapeStyle);
    const prevIndex = (currentIndex - 1 + styles.length) % styles.length;
    setMixtapeStyle(styles[prevIndex]);
  };

  // Generate HTML file
  const generateHtml = async () => {
    // Fetch the cassette image as a base64 string
    const cassetteImageResponse = await fetch(
      getCassetteImagePath(mixtapeStyle)
    );
    const cassetteImageBlob = await cassetteImageResponse.blob();
    const mixtapeImageBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(cassetteImageBlob);
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mixtapeTitle || "Your Mixtape"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cutive+Mono&family=La+Belle+Aurore&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Cutive Mono', monospace;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: ${getBackgroundColorHex(backgroundColor)};
      color: #333;
    }
    .container {
      max-width: 500px;
      width: 90%;
      text-align: center;
    }
    h1 {
      margin-top: 0;
      font-size: 2rem;
      font-family: 'Cutive Mono', monospace;
    }
    .message {
      margin: 1.5rem 0;
      font-style: italic;
      line-height: 1.6;
      font-family: 'La Belle Aurore', cursive;
      font-size: 1.5rem;
    }
    .cassette {
      width: 100%;
      max-width: 350px;
      position: relative;
      margin: 0 auto;
    }
    .cassette img {
      width: 100%;
      height: auto;
    }
    .cassette-title {
      position: absolute;
      top: 22%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-family: 'La Belle Aurore', cursive;
      font-size: 1.125rem;
      color: white;
      text-align: center;
      width: 80%;
    }
    .player {
      margin-top: 2rem;
      width: 100%;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin: 1rem 0;
    }
    button {
      background-color: #6c5ce7;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      font-family: 'Cutive Mono', monospace;
    }
    button:hover {
      background-color: #5541d8;
    }
    .playlist {
      margin-top: 1.5rem;
      text-align: left;
    }
    .song {
      padding: 0.5rem;
      margin: 0.5rem 0;
      background-color: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      cursor: pointer;
      font-family: 'Cutive Mono', monospace;
    }
    .song.playing {
      background-color: #e9e7ff;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <p>A mixtape for you</p>
    <div class="cassette">
      <img src="${mixtapeImageBase64}" alt="Mixtape Cassette">
      <div class="cassette-title">${mixtapeTitle || ""}</div>
    </div>
    
    <div class="player">
      <audio id="audio-player"></audio>
      
      <div class="controls">
        <button id="prev-btn">Previous</button>
        <button id="play-btn">Play</button>
        <button id="pause-btn">Pause</button>
        <button id="next-btn">Next</button>
      </div>
      
      <div class="playlist" id="playlist">
        ${songs
          .map(
            (song, index) => `
          <div class="song" data-index="${index}">
            ${index + 1}. ${song.name}
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  </div>

  <script>
    // Song data
    const songs = ${JSON.stringify(
      songs.map((song) => ({
        name: song.name,
        dataUrl: song.dataUrl,
      }))
    )};
    
    // Player elements
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const playlist = document.getElementById('playlist');
    const songElements = document.querySelectorAll('.song');
    
    // Current song index
    let currentSongIndex = 0;
    
    // Load the first song
    if (songs.length > 0) {
      loadSong(0);
    }
    
    // Load a song by index
    function loadSong(index) {
      if (index >= 0 && index < songs.length) {
        audioPlayer.src = songs[index].dataUrl;
        currentSongIndex = index;
        
        // Update playlist UI
        songElements.forEach((el, i) => {
          if (i === index) {
            el.classList.add('playing');
          } else {
            el.classList.remove('playing');
          }
        });
      }
    }
    
    // Play button
    playBtn.addEventListener('click', () => {
      audioPlayer.play();
    });
    
    // Pause button
    pauseBtn.addEventListener('click', () => {
      audioPlayer.pause();
    });
    
    // Previous button
    prevBtn.addEventListener('click', () => {
      loadSong(currentSongIndex - 1);
      audioPlayer.play();
    });
    
    // Next button
    nextBtn.addEventListener('click', () => {
      loadSong(currentSongIndex + 1);
      audioPlayer.play();
    });
    
    // Song ended event
    audioPlayer.addEventListener('ended', () => {
      // Auto play next song
      if (currentSongIndex < songs.length - 1) {
        loadSong(currentSongIndex + 1);
        audioPlayer.play();
      }
    });
    
    // Playlist click events
    songElements.forEach(song => {
      song.addEventListener('click', () => {
        const index = parseInt(song.dataset.index);
        loadSong(index);
        audioPlayer.play();
      });
    });
  </script>
</body>
</html>
    `;

    // Create a blob and download link
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "for_you.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 transition-colors duration-300 flex flex-col ${cutiveMono.className}`}
      style={{ backgroundColor: getBackgroundColorHex(backgroundColor) }}
    >
      <div className="max-w-[600px] mx-auto w-full flex-1 flex flex-col">
        {/* Step Indicators */}
        <div className="text-center mb-4">
          <div className="text-base">
            {currentStep === 1 ? <u>1</u> : "1"}-
            {currentStep === 2 ? <u>2</u> : "2"}-
            {currentStep === 3 ? <u>3</u> : "3"}
          </div>
          <h1 className="text-base mt-2">
            Craft a custom mixtape for a loved one &lt;3
          </h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Step 1: Upload MP3s */}
          {currentStep === 1 && (
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="border-2 border-dashed border-white rounded-lg p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".mp3,audio/mpeg"
                  multiple
                  className="hidden"
                  id="mp3-upload"
                />
                <label
                  htmlFor="mp3-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-[#B6B7E3] flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[#413962]"
                    >
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-gray-700">
                    Click to upload MP3 files
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Maximum 5 files
                  </span>
                </label>
              </div>

              {/* File List */}
              {songs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base mb-4">
                    Uploaded Songs ({songs.length}/5)
                  </h3>
                  <div className="space-y-2">
                    {songs.map((song) => (
                      <div
                        key={song.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-[#413962] mr-4"
                          >
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                          <span className="text-gray-700 truncate max-w-[200px]">
                            {song.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeSong(song.id)}
                          className="text-gray-500 hover:text-red-500 p-1"
                          aria-label="Remove song"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Customize Mixtape */}
          {currentStep === 2 && (
            <div className="space-y-8 flex-1 flex flex-col items-center justify-center h-full">
              {/* Cassette Preview with Carousel */}
              <div className="relative w-full flex items-center justify-center my-8">
                {/* Left Arrow */}
                <button
                  onClick={prevCassetteStyle}
                  className="absolute left-14 z-10 bg-white w-10 h-10 flex items-center justify-center rounded-sm"
                  aria-label="Previous cassette style"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>

                {/* Cassette with Title Overlay */}
                <div className="relative w-[350px] h-[260px]">
                  <Image
                    src={
                      getCassetteImagePath(mixtapeStyle) || "/placeholder.svg"
                    }
                    alt={`${mixtapeStyle} cassette`}
                    fill
                    className="object-cover w-full"
                  />
                  <div
                    className={`absolute top-[22%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center -rotate-1 w-4/5 ${labelleAurore.className}`}
                    style={{ fontSize: "1.4rem", color: "white" }}
                  >
                    <Input
                      value={mixtapeTitle}
                      onChange={(e) => setMixtapeTitle(e.target.value)}
                      placeholder="Add a message..."
                      className="bg-transparent border-none text-center !focus:ring-0 !focus:ring-transparent text-lg"
                    />
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={nextCassetteStyle}
                  className="absolute right-14 z-10 bg-white w-10 h-10 flex items-center justify-center rounded-md"
                  aria-label="Next cassette style"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Background Color Selection */}
              <div className="w-full text-center">
                <h3 className="mb-4">Background color</h3>
                <div className="flex justify-center space-x-4">
                  {(
                    ["purple", "pink", "green", "cream"] as BackgroundColor[]
                  ).map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        backgroundColor === color
                          ? "ring-2 ring-white ring-offset-2"
                          : ""
                      }`}
                      style={{ backgroundColor: getBackgroundColorHex(color) }}
                      aria-label={`Select ${color} background`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Download HTML */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center flex-1 flex flex-col justify-center">
              <div className="py-6">
                <div className="mx-auto mb-4 relative w-[350px] h-[260px]">
                  <Image
                    src={
                      getCassetteImagePath(mixtapeStyle) || "/placeholder.svg"
                    }
                    alt={`${mixtapeStyle} cassette`}
                    fill
                    className="object-contain"
                  />
                  <div
                    className={`absolute top-[25%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-4/5 ${labelleAurore.className}`}
                    style={{ fontSize: "1.125rem", color: "white" }}
                  >
                    {mixtapeTitle}
                  </div>
                </div>

                <div className="text-base">{mixtapeTitle}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {songs.length} song{songs.length !== 1 ? "s" : ""}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={generateHtml}
                  className="bg-white hover:bg-white hover:underline hover:cursor-pointer text-black px-8 py-6 text-base"
                >
                  Download Mixtape
                </Button>

                <div className="text-xs text-gray-500">
                  The HTML file contains your mixtape. Send it to your loved on
                  and enjoy.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          {currentStep > 1 ? (
            <button onClick={prevStep} className="text-gray-800">
              Back
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 3 ? (
            <button onClick={nextStep} className="text-gray-800">
              Next
            </button>
          ) : (
            <button onClick={resetMixtape} className="text-gray-800">
              Create New Mixtape
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
