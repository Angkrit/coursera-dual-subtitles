async function openBilingual() {
  let tracks = document.getElementsByTagName("track");
  let en;
  let th;
  if (tracks.length) {
    for (const element of tracks) {
      if (element.srclang === "en") {
        en = element;
      } else if (element.srclang === "th-TH") {
        th = element;
      }
    }
    if (en) {
      en.track.mode = "showing";
      if (th) {
        th.track.mode = "showing";
      } else {
        await sleep(500);
        let cues = en.track.cues;
        const cuesTextList = getCuesTextList(cues);
        for (const element of cuesTextList) {
          getTranslation(element[1], (translatedText) => {
            const translatedTextList = translatedText.split("\n\n");
            for (let j = 0; j < translatedTextList.length; j++) {
              cues[element[0] + j].text += "\n" + translatedTextList[j];
            }
          });
        }
      }
    }
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCuesTextList(cues) {
  let cuesTextList = [];
  for (let i = 0; i < cues.length; i++) {
    if (
      cuesTextList.length &&
      cuesTextList[cuesTextList.length - 1][1].length + cues[i].text.length <
        5000
    ) {
      cuesTextList[cuesTextList.length - 1][1] += "\n\n" + cues[i].text;
    } else {
      cuesTextList.push([i, cues[i].text]);
    }
  }
  return cuesTextList;
}

function getTranslation(words, callback) {
  const xhr = new XMLHttpRequest();
  let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURI(
    words
  )}`;
  xhr.open("GET", url, true);
  xhr.responseType = "text";
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 304) {
        const translatedList = JSON.parse(xhr.responseText)[0];
        let translatedText = "";
        for (const element of translatedList) {
          translatedText += element[0];
        }
        callback(translatedText);
      }
    }
  };
  xhr.send();
}

chrome.runtime.onMessage.addListener(function (request, sender) {
  openBilingual();
});
