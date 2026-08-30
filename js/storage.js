const PROFILE_KEY = "wuni_profile";

function getProfile() {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) {
    saveProfile(DEFAULT_PROFILE);
    return structuredClone(DEFAULT_PROFILE);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    saveProfile(DEFAULT_PROFILE);
    return structuredClone(DEFAULT_PROFILE);
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function enemMedia(enem) {
  const valores = [enem.linguagens, enem.humanas, enem.natureza, enem.matematica, enem.redacao];
  const soma = valores.reduce((acc, v) => acc + (Number(v) || 0), 0);
  return soma / valores.length;
}
