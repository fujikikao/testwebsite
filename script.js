const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector(".site-menu");
const menuLinks = document.querySelectorAll(".site-menu a");

function closeMenu() {
  if (!menuToggle || !siteMenu) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.querySelector(".visually-hidden").textContent = "開啟導覽選單";
  siteMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (menuToggle && siteMenu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.querySelector(".visually-hidden").textContent = isOpen ? "開啟導覽選單" : "關閉導覽選單";
    siteMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  menuLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (!siteMenu.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });
}

const video = document.querySelector("#new-song");
const playToggle = document.querySelector("#play-toggle");
const playIcon = document.querySelector("#play-icon");
const progress = document.querySelector("#track-progress");
const currentTime = document.querySelector("#current-time");
const duration = document.querySelector("#duration");
const playerStatus = document.querySelector("#player-status");
const muteToggle = document.querySelector("#mute-toggle");
const volumeIcon = document.querySelector("#volume-icon");
const volumeLevel = document.querySelector("#volume-level");

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

if (video && playToggle && playIcon && progress && currentTime && duration && playerStatus && muteToggle && volumeIcon && volumeLevel) {
  video.volume = Number(volumeLevel.value);
  let previousVolume = video.volume;

  playToggle.addEventListener("click", async () => {
    if (video.paused) {
      try {
        await video.play();
      } catch {
        playerStatus.textContent = "無法播放影片，請稍後再試。";
      }
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", () => {
    playIcon.textContent = "Ⅱ";
    playToggle.setAttribute("aria-label", "暫停新曲試聽");
    playerStatus.textContent = "正在試聽";
  });

  video.addEventListener("pause", () => {
    playIcon.textContent = "▶";
    playToggle.setAttribute("aria-label", "播放新曲試聽");
    if (!video.ended) playerStatus.textContent = "已暫停";
  });

  video.addEventListener("ended", () => {
    progress.value = "0";
    playerStatus.textContent = "試聽結束，再聽一次？";
  });

  video.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(video.duration);
  });

  video.addEventListener("timeupdate", () => {
    currentTime.textContent = formatTime(video.currentTime);
    if (Number.isFinite(video.duration) && video.duration > 0) {
      progress.value = String((video.currentTime / video.duration) * 100);
    }
  });

  progress.addEventListener("input", () => {
    if (Number.isFinite(video.duration) && video.duration > 0) {
      video.currentTime = (Number(progress.value) / 100) * video.duration;
    }
  });

  volumeLevel.addEventListener("input", () => {
    video.volume = Number(volumeLevel.value);
    if (video.volume > 0) previousVolume = video.volume;
    video.muted = video.volume === 0;
    muteToggle.setAttribute("aria-pressed", String(video.muted));
    muteToggle.setAttribute("aria-label", video.muted ? "取消靜音" : "靜音");
    volumeIcon.textContent = video.muted ? "×" : "♫";
  });

  muteToggle.addEventListener("click", () => {
    if (video.muted || video.volume === 0) {
      video.volume = previousVolume || 0.8;
      volumeLevel.value = String(video.volume);
      video.muted = false;
    } else {
      previousVolume = video.volume;
      video.muted = true;
    }
    muteToggle.setAttribute("aria-pressed", String(video.muted));
    muteToggle.setAttribute("aria-label", video.muted ? "取消靜音" : "靜音");
    volumeIcon.textContent = video.muted ? "×" : "♫";
  });

  video.addEventListener("error", () => {
    playerStatus.textContent = "影片載入失敗，請確認網路或稍後再試。";
  });
}

const observedSections = document.querySelectorAll("#story, #members, #tour, #listen");
const navigationLinks = new Map([...menuLinks].map((link) => [link.getAttribute("href").slice(1), link]));

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      menuLinks.forEach((link) => link.removeAttribute("aria-current"));
      const activeLink = navigationLinks.get(entry.target.id);
      if (activeLink) activeLink.setAttribute("aria-current", "location");
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  observedSections.forEach((section) => sectionObserver.observe(section));
}