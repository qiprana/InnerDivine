(() => {
  "use strict";

  const tracks = {
    all: {
      number: "Complete practice",
      title: "All Seven Affirmations",
      text: "I start my day with the following affirmations.",
      summary: "Opening, all seven affirmations, and closing.",
      mode: "All seven affirmations, in a loop",
      src: "videos/core_continuous_clean_v2.mp4",
      poster: "videos/posters/core_continuous_clean_v2.jpg"
    },
    1: {
      number: "Affirmation 1 of 7",
      title: "Affirmation 1",
      text: "I am grateful to you for the divine grace and conscious awareness that align my daily choices, words and actions with my highest spiritual purpose.",
      summary: "Divine grace and conscious awareness.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_01_final.mp4",
      poster: "videos/posters/core_01.jpg"
    },
    2: {
      number: "Affirmation 2 of 7",
      title: "Affirmation 2",
      text: "I am grateful to you for making me an instrument of your love and grace to all the kind, caring and loving souls you have surrounded me with.",
      summary: "An instrument of love and grace.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_02_final.mp4",
      poster: "videos/posters/core_02.jpg"
    },
    3: {
      number: "Affirmation 3 of 7",
      title: "Affirmation 3",
      text: "I am grateful to you for making me your channel to stream your love and blessings to everyone around me.",
      summary: "Streaming love and blessings.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_03_final.mp4",
      poster: "videos/posters/core_03.jpg"
    },
    4: {
      number: "Affirmation 4 of 7",
      title: "Affirmation 4",
      text: "I am grateful to you for the gift of this healthy resilient body, a pure loving mind, always aware that we are all connected and an eye that sees the divinity and serenity in everyone around me.",
      summary: "A healthy body, loving mind and serene vision.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_04_final.mp4",
      poster: "videos/posters/core_04.jpg"
    },
    5: {
      number: "Affirmation 5 of 7",
      title: "Affirmation 5",
      text: "I am grateful to you for shaping me such that my thoughts are always pure and loving; my words are always sweet, polite and respectful; and my deeds are always selfless and noble.",
      summary: "Pure thoughts, sweet words and noble deeds.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_05_final.mp4",
      poster: "videos/posters/core_05.jpg"
    },
    6: {
      number: "Affirmation 6 of 7",
      title: "Affirmation 6",
      text: "I am grateful to you for shaping me such that I respond to everyone with love, dignity and respect.",
      summary: "Responding with love, dignity and respect.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_06_final.mp4",
      poster: "videos/posters/core_06.jpg"
    },
    7: {
      number: "Affirmation 7 of 7",
      title: "Affirmation 7",
      text: "I am grateful to you for bestowing upon me the ability to radiate love and blessings to everyone I think about and/or interact with.",
      summary: "Radiating love and blessings.",
      mode: "One affirmation, repeated with intention",
      src: "videos/core_07_final.mp4",
      poster: "videos/posters/core_07.jpg"
    }
  };

  const video = document.getElementById("practiceVideo");
  const stage = document.getElementById("practiceStage");
  const stageHitArea = document.getElementById("stageHitArea");
  const startPrompt = document.getElementById("startPrompt");
  const stagePromptTitle = document.getElementById("stagePromptTitle");
  const stageModeLine = document.getElementById("stageModeLine");
  const stageBadge = document.getElementById("stageBadge");
  const stageTrackTitle = document.getElementById("stageTrackTitle");
  const stageTrackSummary = document.getElementById("stageTrackSummary");
  const trackCount = document.getElementById("trackCount");
  const nowTitle = document.getElementById("nowTitle");
  const nowText = document.getElementById("nowText");
  const playBtn = document.getElementById("playBtn");
  const playLabel = document.getElementById("playLabel");
  const playIcon = document.getElementById("playIcon");
  const pauseBtn = document.getElementById("pauseBtn");
  const restartBtn = document.getElementById("restartBtn");
  const stopBtn = document.getElementById("stopBtn");
  const seekRange = document.getElementById("seekRange");
  const currentTime = document.getElementById("currentTime");
  const durationTime = document.getElementById("durationTime");
  const playerStatus = document.getElementById("playerStatus");
  const repeatStatus = document.getElementById("repeatStatus");
  const repeatSelect = document.getElementById("repeatSelect");
  const volumeRange = document.getElementById("volumeRange");
  const volumeValue = document.getElementById("volumeValue");
  const muteBtn = document.getElementById("muteBtn");
  const volumeIcon = document.getElementById("volumeIcon");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const trackButtons = Array.from(document.querySelectorAll(".track-btn"));

  let currentTrack = "all";
  let playsRemaining = Infinity;
  let previousVolume = 0.8;
  let seeking = false;

  function readStoredSettings() {
    try {
      const savedTrack = localStorage.getItem("innerDivine.coreTrack");
      const savedRepeat = localStorage.getItem("innerDivine.repeat");
      const savedVolumeRaw = localStorage.getItem("innerDivine.volume");
      const savedVolume = savedVolumeRaw === null ? NaN : Number(savedVolumeRaw);
      if (savedTrack && tracks[savedTrack]) currentTrack = savedTrack;
      if (savedRepeat && Array.from(repeatSelect.options).some(option => option.value === savedRepeat)) repeatSelect.value = savedRepeat;
      if (Number.isFinite(savedVolume) && savedVolume >= 0 && savedVolume <= 1) {
        video.volume = savedVolume;
        volumeRange.value = String(Math.round(savedVolume * 100));
        previousVolume = savedVolume || 0.8;
      } else {
        video.volume = 0.8;
        volumeRange.value = "80";
      }
    } catch (_error) {
      video.volume = 0.8;
    }
  }

  function storeSetting(key, value) {
    try { localStorage.setItem(key, value); } catch (_error) { /* Playback remains usable without storage. */ }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const whole = Math.floor(seconds);
    const minutes = Math.floor(whole / 60);
    return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
  }

  function repeatDescription() {
    const value = repeatSelect.value;
    if (value === "loop") return currentTrack === "all" ? "Looping complete practice" : "Repeating continuously";
    const count = Number(value) || 1;
    return count === 1 ? "Plays once" : `Repeats ${count} times`;
  }

  function resetRepeatCounter() {
    playsRemaining = repeatSelect.value === "loop" ? Infinity : Math.max(1, Number(repeatSelect.value) || 1);
    repeatStatus.textContent = repeatDescription();
  }

  function setPrompt(mode) {
    if (mode === "playing") {
      startPrompt.classList.add("is-hidden");
      stageBadge.classList.add("is-playing");
      stageHitArea.setAttribute("aria-label", "Pause current affirmation practice");
      return;
    }
    startPrompt.classList.remove("is-hidden");
    stageBadge.classList.remove("is-playing");
    stageHitArea.setAttribute("aria-label", "Play current affirmation practice");
    if (mode === "paused") {
      stagePromptTitle.textContent = "Touch to continue";
    } else if (mode === "complete") {
      stagePromptTitle.textContent = "Touch to play again";
    } else {
      stagePromptTitle.textContent = "Touch to begin";
    }
  }

  function setPlayingUI(isPlaying) {
    if (isPlaying) {
      playLabel.textContent = "Playing";
      playIcon.innerHTML = '<path d="M6 5h4v14H6V5Zm8 0h4v14h-4V5Z"/>';
      playBtn.setAttribute("aria-label", "Pause current practice");
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      playerStatus.textContent = "Playing";
      setPrompt("playing");
    } else {
      playLabel.textContent = video.currentTime > 0 && video.currentTime < video.duration ? "Continue" : "Play";
      playIcon.innerHTML = '<path d="M8 5v14l11-7L8 5Z"/>';
      playBtn.setAttribute("aria-label", "Play current practice");
      pauseBtn.disabled = true;
    }
  }

  async function playCurrent({ restart = false, resetRepeats = false } = {}) {
    if (restart) video.currentTime = 0;
    if (resetRepeats) resetRepeatCounter();
    try {
      await video.play();
      setPlayingUI(true);
    } catch (_error) {
      setPlayingUI(false);
      playerStatus.textContent = "Tap Play to begin";
      setPrompt("ready");
    }
  }

  function pauseCurrent() {
    if (video.paused) return;
    video.pause();
    setPlayingUI(false);
    playerStatus.textContent = "Paused";
    setPrompt("paused");
  }

  function stopCurrent() {
    video.pause();
    try { video.currentTime = 0; } catch (_error) { /* Metadata may still be loading. */ }
    resetRepeatCounter();
    seekRange.value = "0";
    currentTime.textContent = "0:00";
    setPlayingUI(false);
    playLabel.textContent = "Play";
    stopBtn.disabled = true;
    playerStatus.textContent = "Ready";
    setPrompt("ready");
  }

  function togglePlayback() {
    if (video.paused || video.ended) {
      playCurrent({ restart: video.ended, resetRepeats: video.currentTime === 0 || video.ended });
    } else {
      pauseCurrent();
    }
  }

  function updateVolumeUI() {
    const percent = Math.round(video.volume * 100);
    volumeRange.value = String(percent);
    volumeValue.textContent = String(percent);
    if (video.muted || percent === 0) {
      volumeIcon.innerHTML = '<path d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3 3-3 1.5 1.5-3 3 3 3-1.5 1.5-3-3-3 3-1.5-1.5 3-3-3-3L13.5 9l3 3Z"/>';
      muteBtn.setAttribute("aria-label", "Unmute");
    } else {
      volumeIcon.innerHTML = '<path d="M4 9v6h4l5 4V5L8 9H4Zm11.5 3a3.5 3.5 0 0 0-1.5-2.87v5.74A3.5 3.5 0 0 0 15.5 12Zm-1.5-6.5v2.06a5.5 5.5 0 0 1 0 8.88v2.06a7.5 7.5 0 0 0 0-13Z"/>';
      muteBtn.setAttribute("aria-label", "Mute");
    }
  }

  function selectTrack(key, { autoplay = false } = {}) {
    if (!tracks[key]) return;
    const wasPlaying = !video.paused && !video.ended;
    currentTrack = key;
    const track = tracks[key];

    video.pause();
    video.src = track.src;
    video.poster = track.poster;
    video.load();

    trackCount.textContent = track.number;
    nowTitle.textContent = track.title;
    nowText.textContent = track.text;
    stageModeLine.textContent = track.mode;
    stageTrackTitle.textContent = key === "all" ? "Complete Core Practice" : track.title;
    stageTrackSummary.textContent = track.summary;

    trackButtons.forEach(button => {
      const active = button.dataset.track === key;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    currentTime.textContent = "0:00";
    durationTime.textContent = "0:00";
    seekRange.value = "0";
    resetRepeatCounter();
    setPlayingUI(false);
    stopBtn.disabled = true;
    playerStatus.textContent = "Ready";
    setPrompt("ready");
    storeSetting("innerDivine.coreTrack", key);

    if (autoplay || wasPlaying) playCurrent({ restart: true, resetRepeats: true });
  }

  playBtn.addEventListener("click", togglePlayback);
  pauseBtn.addEventListener("click", pauseCurrent);
  stopBtn.addEventListener("click", stopCurrent);
  restartBtn.addEventListener("click", () => playCurrent({ restart: true, resetRepeats: true }));
  stageHitArea.addEventListener("click", togglePlayback);

  trackButtons.forEach(button => {
    button.addEventListener("click", () => selectTrack(button.dataset.track));
  });

  video.addEventListener("loadedmetadata", () => {
    durationTime.textContent = formatTime(video.duration);
  });

  video.addEventListener("timeupdate", () => {
    if (!seeking && Number.isFinite(video.duration) && video.duration > 0) {
      seekRange.value = String(Math.round((video.currentTime / video.duration) * 1000));
    }
    currentTime.textContent = formatTime(video.currentTime);
  });

  video.addEventListener("play", () => setPlayingUI(true));
  video.addEventListener("pause", () => {
    if (!video.ended) setPlayingUI(false);
  });

  video.addEventListener("waiting", () => { playerStatus.textContent = "Loading…"; });
  video.addEventListener("playing", () => { playerStatus.textContent = "Playing"; });
  video.addEventListener("error", () => {
    setPlayingUI(false);
    playerStatus.textContent = "This recording could not be loaded";
    setPrompt("ready");
  });

  video.addEventListener("ended", () => {
    if (playsRemaining === Infinity) {
      playCurrent({ restart: true });
      return;
    }
    playsRemaining -= 1;
    if (playsRemaining > 0) {
      repeatStatus.textContent = `${playsRemaining} ${playsRemaining === 1 ? "play" : "plays"} remaining`;
      playCurrent({ restart: true });
      return;
    }
    setPlayingUI(false);
    playLabel.textContent = "Play again";
    playerStatus.textContent = "Practice complete";
    stopBtn.disabled = true;
    setPrompt("complete");
  });

  seekRange.addEventListener("pointerdown", () => { seeking = true; });
  seekRange.addEventListener("pointerup", () => { seeking = false; });
  seekRange.addEventListener("input", () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    const target = (Number(seekRange.value) / 1000) * video.duration;
    currentTime.textContent = formatTime(target);
  });
  seekRange.addEventListener("change", () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    video.currentTime = (Number(seekRange.value) / 1000) * video.duration;
    seeking = false;
  });

  repeatSelect.addEventListener("change", () => {
    resetRepeatCounter();
    storeSetting("innerDivine.repeat", repeatSelect.value);
  });

  volumeRange.addEventListener("input", () => {
    const next = Math.max(0, Math.min(1, Number(volumeRange.value) / 100));
    video.muted = false;
    video.volume = next;
    if (next > 0) previousVolume = next;
    updateVolumeUI();
    storeSetting("innerDivine.volume", String(next));
  });

  muteBtn.addEventListener("click", () => {
    if (video.muted || video.volume === 0) {
      video.muted = false;
      video.volume = previousVolume || 0.8;
    } else {
      previousVolume = video.volume;
      video.muted = true;
    }
    updateVolumeUI();
  });

  fullscreenBtn.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await stage.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (_error) {
      playerStatus.textContent = "Full screen is not available in this browser";
    }
  });

  document.addEventListener("fullscreenchange", () => {
    fullscreenBtn.setAttribute("aria-label", document.fullscreenElement ? "Exit full screen" : "Enter full screen");
  });

  document.addEventListener("keydown", event => {
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement) return;
    if (event.code === "Space") {
      event.preventDefault();
      togglePlayback();
    } else if (event.key.toLowerCase() === "r") {
      playCurrent({ restart: true, resetRepeats: true });
    } else if (event.key.toLowerCase() === "s") {
      stopCurrent();
    }
  });

  readStoredSettings();
  selectTrack(currentTrack);
  updateVolumeUI();
})();
