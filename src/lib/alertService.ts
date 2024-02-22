import Tts from 'react-native-tts';

Tts.setDefaultVoice('com.apple.ttsbundle.Samantha-compact');
Tts.setDefaultRate(0.48);
Tts.setDefaultPitch(1);
// Tts.voices().then(voices => console.log(voices));
// Tts.speak('1 and a half minutes remaining');
// Tts.speak('Timer started');

const play = (sound: string) => {
  console.log('ALERT SOUND', sound);
};

const say = (phrase: string) => {
  Tts.speak(phrase);
};

const vibrate = () => {
  console.log('ALERT VIBRATE');
};

export default {
  say,
  play,
  vibrate,
};
