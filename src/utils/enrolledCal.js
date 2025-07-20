const formatDurationDisplay = (seconds) => {
  const totalMin = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);

  if (totalMin < 60) {
    return `${totalMin} min${sec ? ` ${sec} sec` : ""}`;
  }

  const hr = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return `${hr} hr${min ? ` ${min} min` : ""}`;
};

export const calculateDurationsAndCounts = (modules) => {
  let totalSeconds = 0;
  let watchedSeconds = 0;
  let assessments = 0;
  let assignments = 0;

  modules.forEach((module) => {
    module.completed = true;

    module.topics.forEach((topic) => {
      topic.completed = true;

      topic.contents.forEach((content) => {
        const isVideoOrAudio = ["video", "audio"].includes(content.type);
        const isPdfOrImage = ["pdf", "image"].includes(content.type);
        const duration = parseFloat(content.duration) || 0;

        let contentSeconds = 0;

        if (isVideoOrAudio && duration > 0) {
          contentSeconds = duration * 3600;
          totalSeconds += contentSeconds;

          if (content.completed) {
            watchedSeconds += contentSeconds;
          } else {
            topic.completed = false;
            module.completed = false;
          }
        }

        if (isPdfOrImage) {
          if (!content.url || !content.pages) {
            topic.completed = false;
            module.completed = false;
          }
        }

        if (Array.isArray(content.questions)) {
          assignments += content.questions.length;
        }

        assessments += 1;
      });
    });
  });

  const totalDurationDisplay = formatDurationDisplay(totalSeconds);
  const watchedDurationDisplay = formatDurationDisplay(watchedSeconds);

  modules.forEach((module) => {
    module.topics.forEach((topic) => {
      topic.contents.forEach((content) => {
        if (["video", "audio"].includes(content.type)) {
          content.totalHour = totalDurationDisplay;
        }
      });
    });
  });

  return {
    totalHour: totalDurationDisplay || 0,
    watchedHours: watchedDurationDisplay,
    assessments,
    assignments,
    totalSeconds,
    watchedSeconds
  };
};
